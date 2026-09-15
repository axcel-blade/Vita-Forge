import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';

describe('UsersService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let sessionId: string;

  beforeEach(async () => {
    authService = new AuthService();
    usersService = new UsersService(authService);
    const result = await authService.register({
      email: 'ada@example.com',
      password: 'password123',
      name: 'Ada',
    });
    sessionId = result.sessionId;
  });

  it('returns a null profile before anything is saved', async () => {
    const result = await usersService.getProfile(sessionId);
    expect(result.user.email).toBe('ada@example.com');
    expect(result.profile).toBeNull();
  });

  it('creates and reads a resume profile', async () => {
    const created = await usersService.upsertProfile(sessionId, {
      resume: { profile: { fullName: 'Ada Lovelace' } },
    });

    expect(created.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });

    const fetched = await usersService.getProfile(sessionId);
    expect(fetched.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });
  });

  it('rejects unauthenticated profile access', async () => {
    await expect(usersService.getProfile()).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates a restore point and rolls the profile back', async () => {
    await usersService.upsertProfile(sessionId, {
      resume: { profile: { fullName: 'Ada Lovelace' } },
    });
    const version = await usersService.createVersion(sessionId, 'checkpoint');
    await usersService.upsertProfile(sessionId, {
      resume: { profile: { fullName: 'Changed' } },
    });
    const restored = await usersService.restoreVersion(sessionId, version.id);
    expect(restored.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });
  });
});
