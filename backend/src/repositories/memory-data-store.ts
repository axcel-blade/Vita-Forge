import { SESSION_TTL_MS } from '../auth/session.constants';
import {
  DataStore,
  ResumeVersionRecord,
  SessionMeta,
  SessionRecord,
  StoredProfileRecord,
  StoredUserRecord,
} from './data-store';

export class MemoryDataStore implements DataStore {
  private readonly usersByEmail = new Map<string, StoredUserRecord>();
  private readonly usersById = new Map<string, StoredUserRecord>();
  private readonly profiles = new Map<string, StoredProfileRecord>();
  private readonly versions = new Map<string, ResumeVersionRecord[]>();
  private readonly sessionsById = new Map<string, SessionRecord>();

  async findUserByEmail(email: string): Promise<StoredUserRecord | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async findUserById(id: string): Promise<StoredUserRecord | null> {
    return this.usersById.get(id) ?? null;
  }

  async createUser(user: StoredUserRecord): Promise<StoredUserRecord> {
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return user;
  }

  async updateUser(
    id: string,
    patch: Partial<Pick<StoredUserRecord, 'name' | 'email' | 'passwordHash'>>,
  ): Promise<StoredUserRecord> {
    const existing = this.usersById.get(id);
    if (!existing) {
      throw new Error('User not found');
    }
    const next = { ...existing, ...patch };
    this.usersById.set(id, next);
    if (patch.email && patch.email !== existing.email) {
      this.usersByEmail.delete(existing.email);
    }
    this.usersByEmail.set(next.email, next);
    return next;
  }

  async getProfile(userId: string): Promise<StoredProfileRecord | null> {
    return this.profiles.get(userId) ?? null;
  }

  async upsertProfile(userId: string, profile: StoredProfileRecord): Promise<StoredProfileRecord> {
    const next = { ...(this.profiles.get(userId) ?? {}), ...profile };
    this.profiles.set(userId, next);
    return next;
  }

  async deleteProfile(userId: string): Promise<void> {
    this.profiles.delete(userId);
  }

  async listVersions(userId: string): Promise<ResumeVersionRecord[]> {
    return [...(this.versions.get(userId) ?? [])].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createVersion(
    userId: string,
    payload: StoredProfileRecord,
    label?: string,
  ): Promise<ResumeVersionRecord> {
    const record: ResumeVersionRecord = {
      id: crypto.randomUUID(),
      userId,
      payload: { ...payload },
      label: label ?? null,
      createdAt: new Date(),
    };
    const existing = this.versions.get(userId) ?? [];
    existing.push(record);
    this.versions.set(userId, existing);
    return record;
  }

  async getVersion(userId: string, versionId: string): Promise<ResumeVersionRecord | null> {
    return (this.versions.get(userId) ?? []).find((entry) => entry.id === versionId) ?? null;
  }

  async createSession(userId: string, meta: SessionMeta): Promise<SessionRecord> {
    const now = new Date();
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      userId,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      revokedAt: null,
    };
    this.sessionsById.set(record.id, record);
    return record;
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    return this.sessionsById.get(sessionId) ?? null;
  }

  async touchSession(sessionId: string): Promise<void> {
    const session = this.sessionsById.get(sessionId);
    if (session) {
      // Sliding 30-day inactivity window: every authenticated use pushes expiry forward.
      const now = new Date();
      session.lastUsedAt = now;
      session.expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    }
  }

  async listActiveSessions(userId: string): Promise<SessionRecord[]> {
    return [...this.sessionsById.values()]
      .filter((session) => session.userId === userId && !session.revokedAt)
      .sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
  }

  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const session = this.sessionsById.get(sessionId);
    if (!session || session.userId !== userId || session.revokedAt) {
      return false;
    }
    session.revokedAt = new Date();
    return true;
  }
}
