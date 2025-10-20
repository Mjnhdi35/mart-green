import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto } from './dtos/auth.dto';
import { Public } from '../core/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../core/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto);
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return this.authService.me(user.id);
  }

  @Post('logout')
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
