import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

function fakeRequest(userAgent = 'jest-agent', ip = '127.0.0.1') {
  return { headers: { 'user-agent': userAgent }, ip } as never;
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    getMe: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
    listSessions: jest.Mock;
    revokeSession: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      listSessions: jest.fn(),
      revokeSession: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates register with request metadata', async () => {
    const payload = { email: 'a@b.com', password: 'password123', name: 'A' };
    authService.register.mockResolvedValue({ access_token: 't', userId: '1' });

    await controller.register(payload, fakeRequest());
    expect(authService.register).toHaveBeenCalledWith(payload, {
      userAgent: 'jest-agent',
      ip: '127.0.0.1',
    });
  });

  it('delegates login with request metadata', async () => {
    const payload = { email: 'a@b.com', password: 'password123' };
    authService.login.mockResolvedValue({ access_token: 't', userId: '1' });

    await controller.login(payload, fakeRequest());
    expect(authService.login).toHaveBeenCalledWith(payload, {
      userAgent: 'jest-agent',
      ip: '127.0.0.1',
    });
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

  it('delegates logout', async () => {
    await controller.logout('Bearer jwt-token');
    expect(authService.logout).toHaveBeenCalledWith('Bearer jwt-token');
  });

  it('delegates listSessions', async () => {
    authService.listSessions.mockResolvedValue([]);
    await controller.listSessions('Bearer jwt-token');
    expect(authService.listSessions).toHaveBeenCalledWith('Bearer jwt-token');
  });

  it('delegates revokeSession', async () => {
    await controller.revokeSession('Bearer jwt-token', 'session-1');
    expect(authService.revokeSession).toHaveBeenCalledWith('Bearer jwt-token', 'session-1');
  });
});
