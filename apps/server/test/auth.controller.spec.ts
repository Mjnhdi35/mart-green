import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Public } from '../src/core/decorators/public.decorator';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('register calls service', async () => {
    (authService.register as any).mockResolvedValue({});
    await controller.register({} as any);
    expect(authService.register).toHaveBeenCalled();
  });

  it('login calls service', async () => {
    (authService.login as any).mockResolvedValue({});
    await controller.login({} as any);
    expect(authService.login).toHaveBeenCalled();
  });

  it('refresh calls service', async () => {
    (authService.refreshToken as any).mockResolvedValue({});
    await controller.refresh({ refreshToken: 'x' });
    expect(authService.refreshToken).toHaveBeenCalledWith({
      refreshToken: 'x',
    });
  });

  it('me calls service', async () => {
    (authService.me as any).mockResolvedValue({ id: 'u1' });
    const res = await controller.me({ id: 'u1' } as any);
    expect(authService.me).toHaveBeenCalledWith('u1');
    expect(res).toEqual({ id: 'u1' });
  });

  it('logout calls service', async () => {
    (authService.logout as any).mockResolvedValue({
      message: 'Logged out successfully',
    });
    const res = await controller.logout({ id: 'u1' } as any);
    expect(authService.logout).toHaveBeenCalledWith('u1');
    expect(res).toEqual({ message: 'Logged out successfully' });
  });
});
