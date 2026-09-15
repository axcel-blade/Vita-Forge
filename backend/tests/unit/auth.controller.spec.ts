import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME } from '../../src/auth/session.constants';

function fakeRequest(userAgent = 'jest-agent', ip = '127.0.0.1') {
  return { headers: { 'user-agent': userAgent }, ip, cookies: {} } as never;
}

function fakeAuthenticatedRequest(sessionId: string) {
  return { sessionId } as never;
}

function fakeResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as { cookie: jest.Mock; clearCookie: jest.Mock };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    getMe: jest.Mock;
    logout: jest.Mock;
    listSessions: jest.Mock;
    revokeSession: jest.Mock;
    updateAccount: jest.Mock;
    changePassword: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      logout: jest.fn(),
      listSessions: jest.fn(),
      revokeSession: jest.fn(),
      updateAccount: jest.fn(),
      changePassword: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('registers, sets the session + csrf cookies, and never returns them in the body', async () => {
    authService.register.mockResolvedValue({
      message: 'Registration successful',
      userId: '1',
      sessionId: 'sess-1',
      csrfToken: 'csrf-1',
      expiresAt: new Date().toISOString(),
    });
    const res = fakeResponse();

    const body = await controller.register({ email: 'a@b.com', password: 'password123', name: 'A' }, fakeRequest(), res as never);

    expect(authService.register).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'password123', name: 'A' },
      { userAgent: 'jest-agent', ip: '127.0.0.1' },
    );
    expect(body).toEqual({ message: 'Registration successful', userId: '1' });
    expect(body).not.toHaveProperty('sessionId');
    expect(body).not.toHaveProperty('csrfToken');

    const sessionCookieCall = res.cookie.mock.calls.find((call) => call[0] === SESSION_COOKIE_NAME);
    expect(sessionCookieCall).toBeDefined();
    expect(sessionCookieCall![1]).toBe('sess-1');
    expect(sessionCookieCall![2]).toMatchObject({ httpOnly: true, path: '/', sameSite: 'lax' });

    const csrfCookieCall = res.cookie.mock.calls.find((call) => call[0] === CSRF_COOKIE_NAME);
    expect(csrfCookieCall).toBeDefined();
    expect(csrfCookieCall![1]).toBe('csrf-1');
    expect(csrfCookieCall![2]).toMatchObject({ httpOnly: false, path: '/' });
  });

  it('logs in and sets cookies the same way', async () => {
    authService.login.mockResolvedValue({
      message: 'Login successful',
      userId: '1',
      sessionId: 'sess-2',
      csrfToken: 'csrf-2',
      expiresAt: new Date().toISOString(),
    });
    const res = fakeResponse();

    await controller.login({ email: 'a@b.com', password: 'password123' }, fakeRequest(), res as never);

    expect(authService.login).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'password123' },
      { userAgent: 'jest-agent', ip: '127.0.0.1' },
    );
    expect(res.cookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, 'sess-2', expect.objectContaining({ httpOnly: true }));
  });

  it('reads the current user from the request session set by the guard', async () => {
    authService.getMe.mockResolvedValue({ id: '1', email: 'a@b.com' });

    await controller.me(fakeAuthenticatedRequest('sess-1'));
    expect(authService.getMe).toHaveBeenCalledWith('sess-1');
  });

  it('logs out, revokes the session, and clears both cookies', async () => {
    const res = fakeResponse();
    await controller.logout(fakeAuthenticatedRequest('sess-1'), res as never);

    expect(authService.logout).toHaveBeenCalledWith('sess-1');
    expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, { path: '/' });
    expect(res.clearCookie).toHaveBeenCalledWith(CSRF_COOKIE_NAME, { path: '/' });
  });

  it('delegates listSessions', async () => {
    authService.listSessions.mockResolvedValue([]);
    await controller.listSessions(fakeAuthenticatedRequest('sess-1'));
    expect(authService.listSessions).toHaveBeenCalledWith('sess-1');
  });

  it('delegates revokeSession', async () => {
    await controller.revokeSession(fakeAuthenticatedRequest('sess-1'), 'session-2');
    expect(authService.revokeSession).toHaveBeenCalledWith('sess-1', 'session-2');
  });

  it('delegates updateAccount', async () => {
    const patch = { name: 'New Name' };
    authService.updateAccount.mockResolvedValue({ id: '1', name: 'New Name' });

    await controller.updateAccount(fakeAuthenticatedRequest('sess-1'), patch);
    expect(authService.updateAccount).toHaveBeenCalledWith('sess-1', patch);
  });

  it('delegates changePassword', async () => {
    const body = { currentPassword: 'old', newPassword: 'newPassword1' };
    await controller.changePassword(fakeAuthenticatedRequest('sess-1'), body);
    expect(authService.changePassword).toHaveBeenCalledWith('sess-1', body);
  });
});
