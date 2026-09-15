export interface StoredUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface StoredProfileDocument {
  id: string;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProfileRecord {
  resumes?: StoredProfileDocument[];
  coverLetters?: StoredProfileDocument[];
}

export interface ResumeVersionRecord {
  id: string;
  userId: string;
  payload: StoredProfileRecord;
  label: string | null;
  createdAt: Date;
}

export interface SessionRecord {
  id: string;
  userId: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface SessionMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/** Persistence port used by auth and profile services. */
export interface DataStore {
  findUserByEmail(email: string): Promise<StoredUserRecord | null>;
  findUserById(id: string): Promise<StoredUserRecord | null>;
  createUser(user: StoredUserRecord): Promise<StoredUserRecord>;
  updateUser(id: string, patch: Partial<Pick<StoredUserRecord, 'name' | 'email' | 'passwordHash'>>): Promise<StoredUserRecord>;
  getProfile(userId: string): Promise<StoredProfileRecord | null>;
  upsertProfile(userId: string, profile: StoredProfileRecord): Promise<StoredProfileRecord>;
  deleteProfile(userId: string): Promise<void>;
  listVersions(userId: string): Promise<ResumeVersionRecord[]>;
  createVersion(userId: string, payload: StoredProfileRecord, label?: string): Promise<ResumeVersionRecord>;
  getVersion(userId: string, versionId: string): Promise<ResumeVersionRecord | null>;
  createSession(userId: string, meta: SessionMeta): Promise<SessionRecord>;
  getSession(sessionId: string): Promise<SessionRecord | null>;
  touchSession(sessionId: string): Promise<void>;
  listActiveSessions(userId: string): Promise<SessionRecord[]>;
  revokeSession(userId: string, sessionId: string): Promise<boolean>;
}

export const DATA_STORE = 'DATA_STORE';
