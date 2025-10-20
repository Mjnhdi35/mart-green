import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { PasswordHasher } from '../src/core/services/password-hasher.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../src/redis/redis.service';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  const passwordHasher = {
    hash: jest.fn(),
    compare: jest.fn(),
  } as unknown as jest.Mocked<PasswordHasher>;

  const jwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;

  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  } as unknown as jest.Mocked<ConfigService>;

  const redisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  } as unknown as jest.Mocked<RedisService>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PasswordHasher, useValue: passwordHasher },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return undefined;
    });
    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      throw new Error('missing config: ' + key);
    });
  });

  it('register: throws when passwords mismatch', async () => {
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'pass1234',
        confirmPassword: 'pass12345',
        displayName: 'A',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('register: throws when user exists', async () => {
    (usersService.findByEmail as any).mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'pass1234',
        confirmPassword: 'pass1234',
        displayName: 'A',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register: returns tokens, stores refresh in redis', async () => {
    (usersService.findByEmail as any).mockResolvedValue(null);
    (passwordHasher.hash as any).mockResolvedValue('hashed');
    (usersService.create as any).mockResolvedValue({ id: 'u1' });
    (jwtService.signAsync as any)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    (redisService.set as any).mockResolvedValue(true);

    const result = await service.register({
      email: 'a@b.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
      displayName: 'A',
    } as any);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'auth:refresh:u1',
      'refresh-token',
      expect.any(Number),
    );
  });

  it('login: throws on invalid credentials', async () => {
    (usersService.findByEmail as any).mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login: returns tokens on valid credentials', async () => {
    (usersService.findByEmail as any).mockResolvedValue({
      id: 'u1',
      password: 'hash',
    });
    (passwordHasher.compare as any).mockResolvedValue(true);
    (jwtService.signAsync as any)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    (redisService.set as any).mockResolvedValue(true);

    const result = await service.login({
      email: 'a@b.com',
      password: 'pass1234',
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('refreshToken: validates stored token and rotates', async () => {
    (jwtService.verify as any).mockReturnValue({ sub: 'u1' });
    (redisService.get as any).mockResolvedValue('refresh-token');
    (jwtService.signAsync as any)
      .mockResolvedValueOnce('new-access')
      .mockResolvedValueOnce('new-refresh');
    (redisService.set as any).mockResolvedValue(true);

    const result = await service.refreshToken({
      refreshToken: 'refresh-token',
    });
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'auth:refresh:u1',
      'new-refresh',
      expect.any(Number),
    );
  });

  it('refreshToken: rejects when redis mismatch', async () => {
    (jwtService.verify as any).mockReturnValue({ sub: 'u1' });
    (redisService.get as any).mockResolvedValue('other-token');
    await expect(
      service.refreshToken({ refreshToken: 'refresh-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('me: returns user', async () => {
    (usersService.findOne as any).mockResolvedValue({ id: 'u1' });
    const user = await service.me('u1');
    expect(user).toEqual({ id: 'u1' });
  });

  it('logout: deletes refresh key', async () => {
    (redisService.del as any).mockResolvedValue(true);
    const res = await service.logout('u1');
    expect(redisService.del).toHaveBeenCalledWith('auth:refresh:u1');
    expect(res).toEqual({ message: 'Logged out successfully' });
  });
});
