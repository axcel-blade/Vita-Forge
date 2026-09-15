import {
  CoverLetterVersionRecord,
  DataStore,
  ResumeVersionRecord,
  StoredProfileRecord,
  StoredUserRecord,
} from './data-store';

export class MemoryDataStore implements DataStore {
  private readonly usersByEmail = new Map<string, StoredUserRecord>();
  private readonly usersById = new Map<string, StoredUserRecord>();
  private readonly profiles = new Map<string, StoredProfileRecord>();
  private readonly versions = new Map<string, ResumeVersionRecord[]>();
  private readonly coverLetterVersions = new Map<string, CoverLetterVersionRecord[]>();

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

  async listCoverLetterVersions(userId: string): Promise<CoverLetterVersionRecord[]> {
    return [...(this.coverLetterVersions.get(userId) ?? [])].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createCoverLetterVersion(
    userId: string,
    payload: Record<string, unknown>,
    label?: string,
  ): Promise<CoverLetterVersionRecord> {
    const record: CoverLetterVersionRecord = {
      id: crypto.randomUUID(),
      userId,
      payload: { ...payload },
      label: label ?? null,
      createdAt: new Date(),
    };
    const existing = this.coverLetterVersions.get(userId) ?? [];
    existing.push(record);
    this.coverLetterVersions.set(userId, existing);
    return record;
  }

  async getCoverLetterVersion(userId: string, versionId: string): Promise<CoverLetterVersionRecord | null> {
    return (this.coverLetterVersions.get(userId) ?? []).find((entry) => entry.id === versionId) ?? null;
  }
}
