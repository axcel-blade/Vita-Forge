import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    getMe: jest.Mock;
    refresh: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      refresh: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates register', async () => {
    const payload = { email: 'a@b.com', password: 'password123', name: 'A' };
    authService.register.mockResolvedValue({ access_token: 't', userId: '1' });

    await controller.register(payload);
    expect(authService.register).toHaveBeenCalledWith(payload);
  });

  it('delegates login', async () => {
    const payload = { email: 'a@b.com', password: 'password123' };
    authService.login.mockResolvedValue({ access_token: 't', userId: '1' });

    await controller.login(payload);
    expect(authService.login).toHaveBeenCalledWith(payload);
  });

  it('reads the current user from the Authorization header', async () => {
    authService.getMe.mockResolvedValue({ id: '1', email: 'a@b.com' });

    await controller.me('Bearer jwt-token');
    expect(authService.getMe).toHaveBeenCalledWith('Bearer jwt-token');
  });

  it('delegates refresh', async () => {
    authService.refresh.mockResolvedValue({ access_token: 'a', refresh_token: 'r' });
    await controller.refresh({ refresh_token: 'r' });
    expect(authService.refresh).toHaveBeenCalledWith('r');
  });
});
