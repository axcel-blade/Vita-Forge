import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('registers a user and returns a JWT', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.message).toBe('Registration successful');
      expect(result.userId).toEqual(expect.any(String));
      expect(result.access_token).toEqual(expect.any(String));
      expect(result.refresh_token).toEqual(expect.any(String));
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

    it('stores a hashed password', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const storedUser = await (authService as any).store.findUserByEmail('test@example.com');
      expect(storedUser.passwordHash).not.toBe('password123');
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

    it('returns a JWT for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.message).toBe('Login successful');
      expect(result.access_token).toEqual(expect.any(String));
      expect(result.refresh_token).toEqual(expect.any(String));
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
  });

  describe('getMe', () => {
    it('returns the current user for a valid token', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const result = await authService.getMe(`Bearer ${access_token}`);

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.id).toEqual(expect.any(String));
      expect(result).not.toHaveProperty('userId');
    });

    it('rejects a missing token', async () => {
      await expect(authService.getMe()).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an invalid token', async () => {
      await expect(authService.getMe('not-a-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('issues a new token pair from a refresh token', async () => {
      const { refresh_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const result = await authService.refresh(refresh_token);
      expect(result.message).toBe('Token refreshed');
      expect(result.access_token).toEqual(expect.any(String));
      expect(result.refresh_token).toEqual(expect.any(String));
    });

    it('rejects a missing refresh token', async () => {
      await expect(authService.refresh()).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('sessions', () => {
    it('records a session with device metadata on login', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const { access_token } = await authService.login(
        { email: 'test@example.com', password: 'password123' },
        { userAgent: 'jest-agent', ip: '127.0.0.1' },
      );

      const sessions = await authService.listSessions(`Bearer ${access_token}`);
      expect(sessions).toHaveLength(2); // register + login each create a session
      const current = sessions.find((s) => s.isCurrent);
      expect(current?.userAgent).toBe('jest-agent');
      expect(current?.ip).toBe('127.0.0.1');
    });

    it('marks the session used by the current token as current', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const sessions = await authService.listSessions(`Bearer ${access_token}`);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].isCurrent).toBe(true);
    });

    it('revokes a session so its tokens stop working', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const [session] = await authService.listSessions(`Bearer ${access_token}`);

      await authService.revokeSession(`Bearer ${access_token}`, session.id);

      await expect(authService.getMe(`Bearer ${access_token}`)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects revoking a session that does not belong to the caller', async () => {
      const { access_token: ownerToken } = await authService.register({
        email: 'owner@example.com',
        password: 'password123',
        name: 'Owner',
      });
      const [ownerSession] = await authService.listSessions(`Bearer ${ownerToken}`);

      const { access_token: attackerToken } = await authService.register({
        email: 'attacker@example.com',
        password: 'password123',
        name: 'Attacker',
      });

      await expect(
        authService.revokeSession(`Bearer ${attackerToken}`, ownerSession.id),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('logout revokes the current session only', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await authService.logout(`Bearer ${access_token}`);

      await expect(authService.getMe(`Bearer ${access_token}`)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('updateAccount', () => {
    it('updates the name and email', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const updated = await authService.updateAccount(`Bearer ${access_token}`, {
        name: 'New Name',
        email: 'new@example.com',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe('new@example.com');
    });

    it('still resolves the account after an email change using the old token', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await authService.updateAccount(`Bearer ${access_token}`, { email: 'new@example.com' });

      const me = await authService.getMe(`Bearer ${access_token}`);
      expect(me.email).toBe('new@example.com');
    });

    it('rejects changing to an email already in use', async () => {
      await authService.register({
        email: 'taken@example.com',
        password: 'password123',
        name: 'Taken',
      });
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await expect(
        authService.updateAccount(`Bearer ${access_token}`, { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('changePassword', () => {
    it('updates the password and allows login with the new one', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await authService.changePassword(`Bearer ${access_token}`, {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      });

      const login = await authService.login({ email: 'test@example.com', password: 'newPassword456' });
      expect(login.access_token).toEqual(expect.any(String));
    });

    it('rejects the wrong current password', async () => {
      const { access_token } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await expect(
        authService.changePassword(`Bearer ${access_token}`, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('revokes every other session but keeps the current one', async () => {
      const { access_token: session1 } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      const { access_token: session2 } = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      await authService.changePassword(`Bearer ${session1}`, {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      });

      await expect(authService.getMe(`Bearer ${session1}`)).resolves.toBeDefined();
      await expect(authService.getMe(`Bearer ${session2}`)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
