import { AuthService } from '../../src/auth/auth.service';
import { MemoryDataStore } from '../../src/repositories/memory-data-store';
import { UsersService } from '../../src/users/users.service';

const NOW = new Date().toISOString();

function makeDoc(id: string, data: Record<string, unknown>) {
  return { id, title: 'doc', data, createdAt: NOW, updatedAt: NOW };
}

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

    const resumeDoc = makeDoc('r1', { profile: { fullName: 'Sync User', title: 'Engineer' } });
    const coverLetterDoc = makeDoc('c1', { company: 'Acme' });

    const saved = await usersService.upsertProfile(sessionId, {
      resumes: [resumeDoc],
      coverLetters: [coverLetterDoc],
    });

    expect(saved.user.email).toBe('sync@example.com');
    expect(saved.profile?.resumes).toEqual([resumeDoc]);

    const fetched = await usersService.getProfile(sessionId);
    expect(fetched.profile?.coverLetters).toEqual([coverLetterDoc]);

    const snapshot = await usersService.createVersion(sessionId, 'after register');
    await usersService.upsertProfile(sessionId, {
      resumes: [makeDoc('r1', { profile: { fullName: 'Changed' } })],
    });
    const restored = await usersService.restoreVersion(sessionId, snapshot.id);
    expect(restored.profile?.resumes).toEqual([resumeDoc]);
  });
});
