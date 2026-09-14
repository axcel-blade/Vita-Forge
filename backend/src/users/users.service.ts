import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AuthService, CurrentUserResponse } from '../auth/auth.service';
import { DATA_STORE, DataStore, StoredProfileRecord } from '../repositories/data-store';
import { MemoryDataStore } from '../repositories/memory-data-store';

export type StoredProfile = StoredProfileRecord;

export interface UserProfileResponse {
  user: CurrentUserResponse;
  profile: StoredProfile | null;
}

export interface ResumeVersionResponse {
  id: string;
  label: string | null;
  createdAt: string;
}

@Injectable()
export class UsersService {
  private readonly store: DataStore;

  constructor(
    private readonly authService: AuthService,
    @Optional() @Inject(DATA_STORE) store?: DataStore,
  ) {
    this.store = store ?? new MemoryDataStore();
  }

  async getProfile(authorization?: string): Promise<UserProfileResponse> {
    const user = await this.authService.getMe(authorization);
    return {
      user,
      profile: await this.store.getProfile(user.id),
    };
  }

  async upsertProfile(authorization: string | undefined, profile: StoredProfile): Promise<UserProfileResponse> {
    const user = await this.authService.getMe(authorization);
    const next = await this.store.upsertProfile(user.id, profile);
    return { user, profile: next };
  }

  async deleteProfile(authorization?: string): Promise<void> {
    const user = await this.authService.getMe(authorization);
    await this.store.deleteProfile(user.id);
  }

  async listVersions(authorization?: string): Promise<ResumeVersionResponse[]> {
    const user = await this.authService.getMe(authorization);
    const versions = await this.store.listVersions(user.id);
    return versions.map((version) => ({
      id: version.id,
      label: version.label,
      createdAt: version.createdAt.toISOString(),
    }));
  }

  async createVersion(authorization: string | undefined, label?: string): Promise<ResumeVersionResponse> {
    const user = await this.authService.getMe(authorization);
    const profile = await this.store.getProfile(user.id);
    if (!profile) {
      throw new NotFoundException('No profile to snapshot');
    }
    const version = await this.store.createVersion(user.id, profile, label);
    return {
      id: version.id,
      label: version.label,
      createdAt: version.createdAt.toISOString(),
    };
  }

  async restoreVersion(authorization: string | undefined, versionId: string): Promise<UserProfileResponse> {
    const user = await this.authService.getMe(authorization);
    const version = await this.store.getVersion(user.id, versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    const profile = await this.store.upsertProfile(user.id, version.payload);
    return { user, profile };
  }
}
