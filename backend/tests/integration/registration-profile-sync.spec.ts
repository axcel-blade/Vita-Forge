import { AuthService } from '../../src/auth/auth.service';
import { MemoryDataStore } from '../../src/repositories/memory-data-store';
import { UsersService } from '../../src/users/users.service';

describe('registration → profile sync', () => {
  it('creates a user and persists resume data on the same store', async () => {
    const store = new MemoryDataStore();
    const authService = new AuthService(store);
    const usersService = new UsersService(authService, store);

    const { sessionId } = await authService.register({
      email: 'sync@example.com',
      password: 'password123',
      name: 'Sync User',
    });

    const empty = await usersService.getProfile(sessionId);
    expect(empty.profile).toBeNull();

    const saved = await usersService.upsertProfile(sessionId, {
      resume: { profile: { fullName: 'Sync User', title: 'Engineer' } },
      coverLetter: { company: 'Acme' },
    });

    expect(saved.user.email).toBe('sync@example.com');
    expect(saved.profile?.resume).toEqual({ profile: { fullName: 'Sync User', title: 'Engineer' } });

    const fetched = await usersService.getProfile(sessionId);
    expect(fetched.profile?.coverLetter).toEqual({ company: 'Acme' });

    const snapshot = await usersService.createVersion(sessionId, 'after register');
    await usersService.upsertProfile(sessionId, {
      resume: { profile: { fullName: 'Changed' } },
    });
    const restored = await usersService.restoreVersion(sessionId, snapshot.id);
    expect(restored.profile?.resume).toEqual({ profile: { fullName: 'Sync User', title: 'Engineer' } });
  });
});
