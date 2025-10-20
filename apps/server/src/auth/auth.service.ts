import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto, RefreshDto, RegisterDto } from './dtos/auth.dto';
import { User } from '../users/entities/user.entity';
import { PasswordHasher } from '../core/services/password-hasher.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, confirmPassword, ...rest } = dto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }
    const hashed = await this.passwordHasher.hash(password);
    const user = await this.usersService.create({
      email,
      password: hashed,
      ...rest,
    } as Partial<User>);
    const { accessToken, refreshToken } = await this.issueTokens(user.id);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { accessToken, refreshToken } = await this.issueTokens(user.id);
    return { accessToken, refreshToken };
  }
  async me(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }
  async logout(userId: string) {
    await this.redisService.del(this.refreshKey(userId));
    return { message: 'Logged out successfully' };
  }

  async refreshToken(dto: RefreshDto) {
    const { refreshToken } = dto;
    const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = decoded.sub;
    const stored = await this.redisService.get(this.refreshKey(userId));
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const { accessToken, refreshToken: newRefresh } =
      await this.issueTokens(userId);
    return { accessToken, refreshToken: newRefresh };
  }

  private async issueTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessTtlString =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const accessExpiresIn = this.parseTtl(accessTtlString);
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        expiresIn: accessExpiresIn,
      },
    );
    const refreshTtlString =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const refreshExpiresIn = this.parseTtl(refreshTtlString);
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      },
    );
    const ttlSeconds = refreshExpiresIn;
    await this.redisService.set(
      this.refreshKey(userId),
      refreshToken,
      ttlSeconds,
    );
    return { accessToken, refreshToken };
  }

  private refreshKey(userId: string): string {
    return `auth:refresh:${userId}`;
  }

  private parseTtl(input: string): number {
    const match = input.match(/^(\d+)([smhd])$/);
    if (!match) return 60 * 60 * 24 * 7;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 60 * 60 * 24 * 7;
    }
  }
}
