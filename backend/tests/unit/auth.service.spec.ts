import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { MemoryDataStore } from '../../src/repositories/memory-data-store';
import { SESSION_TTL_MS } from '../../src/auth/session.constants';

describe('AuthService', () => {
  let store: MemoryDataStore;
  let authService: AuthService;

  beforeEach(() => {
    store = new MemoryDataStore();
    authService = new AuthService(store);
  });

  describe('register', () => {
    it('registers a user and issues a session', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.message).toBe('Registration successful');
      expect(result.userId).toEqual(expect.any(String));
      expect(result.sessionId).toEqual(expect.any(String));
      expect(result.csrfToken).toEqual(expect.any(String));
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects a duplicate email', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'other-password',
          name: 'Other',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('stores a hashed password, never the plaintext', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const storedUser = await store.findUserByEmail('test@example.com');
      expect(storedUser?.passwordHash).not.toBe('password123');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    it('issues a session for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.message).toBe('Login successful');
      expect(result.sessionId).toEqual(expect.any(String));
      expect(result.csrfToken).toEqual(expect.any(String));
    });

    it('rejects unknown emails', async () => {
      await expect(
        authService.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects the wrong password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('regenerates the session id on every successful login (session-fixation prevention)', async () => {
      const first = await authService.login({ email: 'test@example.com', password: 'password123' });
      const second = await authService.login({ email: 'test@example.com', password: 'password123' });

      expect(first.sessionId).not.toBe(second.sessionId);
      // The old session must still be independently valid until explicitly revoked/expired.
      await expect(authService.getMe(first.sessionId)).resolves.toBeDefined();
    });
  });

  describe('getMe / session validation', () => {
    it('returns the current user for a valid session', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const result = await authService.getMe(sessionId);

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.id).toEqual(expect.any(String));
    });

    it('rejects a missing session id', async () => {
      await expect(authService.getMe()).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown/invalid session id', async () => {
      await expect(authService.getMe('not-a-real-session')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a revoked session', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await authService.logout(sessionId);

      await expect(authService.getMe(sessionId)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a session past its 30-day inactivity expiry', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const session = await store.getSession(sessionId);
      expect(session).not.toBeNull();
      // Simulate 30+ days of inactivity by forcing expiresAt into the past.
      session!.expiresAt = new Date(Date.now() - 1000);

      await expect(authService.getMe(sessionId)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('does not allow an expired session to be silently renewed', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const session = await store.getSession(sessionId);
      session!.expiresAt = new Date(Date.now() - 1000);

      await expect(authService.getMe(sessionId)).rejects.toBeInstanceOf(UnauthorizedException);
      // A second attempt must still fail — touchSession is never reached for an expired session.
      await expect(authService.getMe(sessionId)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('slides the 30-day expiry forward on every authenticated use', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const before = (await store.getSession(sessionId))!.expiresAt.getTime();

      await new Promise((resolve) => setTimeout(resolve, 5));
      await authService.getMe(sessionId);

      const after = (await store.getSession(sessionId))!.expiresAt.getTime();
      expect(after).toBeGreaterThan(before);
      expect(after - Date.now()).toBeGreaterThan(SESSION_TTL_MS - 5000);
    });
  });

  describe('logout', () => {
    it('revokes the current session only', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await authService.logout(sessionId);

      await expect(authService.getMe(sessionId)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('is a no-op for a missing session id', async () => {
      await expect(authService.logout(undefined)).resolves.toBeUndefined();
    });
  });

  describe('sessions', () => {
    it('records a session with device metadata on login', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const { sessionId } = await authService.login(
        { email: 'test@example.com', password: 'password123' },
        { userAgent: 'jest-agent', ip: '127.0.0.1' },
      );

      const sessions = await authService.listSessions(sessionId);
      expect(sessions).toHaveLength(2); // register + login each create a session
      const current = sessions.find((s) => s.isCurrent);
      expect(current?.userAgent).toBe('jest-agent');
      expect(current?.ip).toBe('127.0.0.1');
      expect(current?.expiresAt).toEqual(expect.any(String));
    });

    it('rejects revoking a session that does not belong to the caller', async () => {
      const { sessionId: ownerSessionId } = await authService.register({
        email: 'owner@example.com',
        password: 'password123',
        name: 'Owner',
      });

      const { sessionId: attackerSessionId } = await authService.register({
        email: 'attacker@example.com',
        password: 'password123',
        name: 'Attacker',
      });

      await expect(authService.revokeSession(attackerSessionId, ownerSessionId)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('revokes every other session but keeps the current one', async () => {
      const { sessionId: session1 } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const { sessionId: session2 } = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      await authService.changePassword(session1, {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      });

      await expect(authService.getMe(session1)).resolves.toBeDefined();
      await expect(authService.getMe(session2)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects the wrong current password', async () => {
      const { sessionId } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await expect(
        authService.changePassword(sessionId, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
