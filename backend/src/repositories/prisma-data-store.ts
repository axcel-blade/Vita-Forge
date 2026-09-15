import type { Prisma } from '@prisma/client';
import {
  CoverLetterVersionRecord,
  DataStore,
  ResumeVersionRecord,
  StoredProfileRecord,
  StoredUserRecord,
} from './data-store';
import { PrismaService } from './prisma.service';

function asUser(row: { id: string; email: string; name: string | null; passwordHash: string | null }): StoredUserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? '',
    passwordHash: row.passwordHash ?? '',
  };
}

function asProfile(payload: Prisma.JsonValue): StoredProfileRecord {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return payload as StoredProfileRecord;
}

function asJsonObject(payload: Prisma.JsonValue): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return payload as Record<string, unknown>;
}

export class PrismaDataStore implements DataStore {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    if (!this.prisma.client) {
      throw new Error('Prisma client is not configured');
    }
    return this.prisma.client;
  }

  async findUserByEmail(email: string): Promise<StoredUserRecord | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? asUser(row) : null;
  }

  async findUserById(id: string): Promise<StoredUserRecord | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? asUser(row) : null;
  }

  async createUser(user: StoredUserRecord): Promise<StoredUserRecord> {
    const row = await this.db.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
      },
    });
    return asUser(row);
  }

  async getProfile(userId: string): Promise<StoredProfileRecord | null> {
    const row = await this.db.resumeProfile.findUnique({ where: { userId } });
    return row ? asProfile(row.payload) : null;
  }

  async upsertProfile(userId: string, profile: StoredProfileRecord): Promise<StoredProfileRecord> {
    const current = (await this.getProfile(userId)) ?? {};
    const next = { ...current, ...profile };
    await this.db.resumeProfile.upsert({
      where: { userId },
      create: { userId, payload: next as Prisma.InputJsonValue },
      update: { payload: next as Prisma.InputJsonValue },
    });
    return next;
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.db.resumeProfile.deleteMany({ where: { userId } });
  }

  async listVersions(userId: string): Promise<ResumeVersionRecord[]> {
    const rows = await this.db.resumeVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      payload: asProfile(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    }));
  }

  async createVersion(
    userId: string,
    payload: StoredProfileRecord,
    label?: string,
  ): Promise<ResumeVersionRecord> {
    const row = await this.db.resumeVersion.create({
      data: {
        userId,
        payload: payload as Prisma.InputJsonValue,
        label: label ?? null,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      payload: asProfile(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    };
  }

  async getVersion(userId: string, versionId: string): Promise<ResumeVersionRecord | null> {
    const row = await this.db.resumeVersion.findFirst({ where: { id: versionId, userId } });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.userId,
      payload: asProfile(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    };
  }

  async listCoverLetterVersions(userId: string): Promise<CoverLetterVersionRecord[]> {
    const rows = await this.db.coverLetterVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      payload: asJsonObject(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    }));
  }

  async createCoverLetterVersion(
    userId: string,
    payload: Record<string, unknown>,
    label?: string,
  ): Promise<CoverLetterVersionRecord> {
    const row = await this.db.coverLetterVersion.create({
      data: {
        userId,
        payload: payload as Prisma.InputJsonValue,
        label: label ?? null,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      payload: asJsonObject(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    };
  }

  async getCoverLetterVersion(userId: string, versionId: string): Promise<CoverLetterVersionRecord | null> {
    const row = await this.db.coverLetterVersion.findFirst({ where: { id: versionId, userId } });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.userId,
      payload: asJsonObject(row.payload),
      label: row.label,
      createdAt: row.createdAt,
    };
  }
}
