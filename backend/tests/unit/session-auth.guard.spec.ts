import { UnauthorizedException } from '@nestjs/common';
import { SessionAuthGuard } from '../../src/auth/session-auth.guard';
import { AuthService } from '../../src/auth/auth.service';
import { SESSION_COOKIE_NAME } from '../../src/auth/session.constants';

function fakeContext(cookies: Record<string, string>) {
  const req: { cookies: Record<string, string>; sessionId?: string } = { cookies };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    __req: req,
  } as unknown as { switchToHttp: () => { getRequest: () => typeof req }; __req: typeof req };
}

describe('SessionAuthGuard', () => {
  it('attaches the resolved session id to the request and allows the call through', async () => {
    const authService = { resolveSession: jest.fn().mockResolvedValue({ user: { id: 'u1' }, sessionId: 'sess-1' }) };
    const guard = new SessionAuthGuard(authService as unknown as AuthService);
    const ctx = fakeContext({ [SESSION_COOKIE_NAME]: 'sess-1' });

    await expect(guard.canActivate(ctx as never)).resolves.toBe(true);
    expect(authService.resolveSession).toHaveBeenCalledWith('sess-1');
    expect(ctx.__req.sessionId).toBe('sess-1');
  });

  it('propagates UnauthorizedException for a missing session cookie', async () => {
    const authService = { resolveSession: jest.fn().mockRejectedValue(new UnauthorizedException('Missing session')) };
    const guard = new SessionAuthGuard(authService as unknown as AuthService);
    const ctx = fakeContext({});

    await expect(guard.canActivate(ctx as never)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authService.resolveSession).toHaveBeenCalledWith(undefined);
  });

  it('propagates UnauthorizedException for an expired/invalid session cookie', async () => {
    const authService = {
      resolveSession: jest.fn().mockRejectedValue(new UnauthorizedException('Session expired or invalid')),
    };
    const guard = new SessionAuthGuard(authService as unknown as AuthService);
    const ctx = fakeContext({ [SESSION_COOKIE_NAME]: 'stale-session' });

    await expect(guard.canActivate(ctx as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
