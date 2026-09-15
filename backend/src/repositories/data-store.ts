export interface StoredUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface StoredProfileRecord {
  resume?: Record<string, unknown>;
  coverLetter?: Record<string, unknown>;
}

export interface ResumeVersionRecord {
  id: string;
  userId: string;
  payload: StoredProfileRecord;
  label: string | null;
  createdAt: Date;
}

export interface CoverLetterVersionRecord {
  id: string;
  userId: string;
  payload: Record<string, unknown>;
  label: string | null;
  createdAt: Date;
}

/** Persistence port used by auth and profile services. */
export interface DataStore {
  findUserByEmail(email: string): Promise<StoredUserRecord | null>;
  findUserById(id: string): Promise<StoredUserRecord | null>;
  createUser(user: StoredUserRecord): Promise<StoredUserRecord>;
  getProfile(userId: string): Promise<StoredProfileRecord | null>;
  upsertProfile(userId: string, profile: StoredProfileRecord): Promise<StoredProfileRecord>;
  deleteProfile(userId: string): Promise<void>;
  listVersions(userId: string): Promise<ResumeVersionRecord[]>;
  createVersion(userId: string, payload: StoredProfileRecord, label?: string): Promise<ResumeVersionRecord>;
  getVersion(userId: string, versionId: string): Promise<ResumeVersionRecord | null>;
  listCoverLetterVersions(userId: string): Promise<CoverLetterVersionRecord[]>;
  createCoverLetterVersion(
    userId: string,
    payload: Record<string, unknown>,
    label?: string,
  ): Promise<CoverLetterVersionRecord>;
  getCoverLetterVersion(userId: string, versionId: string): Promise<CoverLetterVersionRecord | null>;
}

export const DATA_STORE = 'DATA_STORE';
