import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';

describe('UsersService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let authorization: string;

  beforeEach(async () => {
    authService = new AuthService();
    usersService = new UsersService(authService);
    const tokens = await authService.register({
      email: 'ada@example.com',
      password: 'password123',
      name: 'Ada',
    });
    authorization = `Bearer ${tokens.access_token}`;
  });

  it('returns a null profile before anything is saved', async () => {
    const result = await usersService.getProfile(authorization);
    expect(result.user.email).toBe('ada@example.com');
    expect(result.profile).toBeNull();
  });

  it('creates and reads a resume profile', async () => {
    const created = await usersService.upsertProfile(authorization, {
      resume: { profile: { fullName: 'Ada Lovelace' } },
    });

    expect(created.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });

    const fetched = await usersService.getProfile(authorization);
    expect(fetched.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });
  });

  it('rejects unauthenticated profile access', async () => {
    await expect(usersService.getProfile()).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates a restore point and rolls the profile back', async () => {
    await usersService.upsertProfile(authorization, {
      resume: { profile: { fullName: 'Ada Lovelace' } },
    });
    const version = await usersService.createVersion(authorization, 'checkpoint');
    await usersService.upsertProfile(authorization, {
      resume: { profile: { fullName: 'Changed' } },
    });
    const restored = await usersService.restoreVersion(authorization, version.id);
    expect(restored.profile?.resume).toEqual({ profile: { fullName: 'Ada Lovelace' } });
  });

  it('rejects a cover letter snapshot when none has been saved', async () => {
    await expect(usersService.createCoverLetterVersion(authorization)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates and lists cover letter versions', async () => {
    await usersService.upsertProfile(authorization, {
      coverLetter: { fullName: 'Ada Lovelace', body: 'Draft one' },
    });
    await usersService.createCoverLetterVersion(authorization, 'first draft');

    await usersService.upsertProfile(authorization, {
      coverLetter: { fullName: 'Ada Lovelace', body: 'Draft two' },
    });
    await usersService.createCoverLetterVersion(authorization, 'second draft');

    const versions = await usersService.listCoverLetterVersions(authorization);
    expect(versions).toHaveLength(2);
    expect(versions.map((v) => v.label).sort()).toEqual(['first draft', 'second draft']);
  });
});
