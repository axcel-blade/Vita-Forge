import { apiRequest } from './http';

export interface SyncedProfileDocument {
  id: string;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SyncedProfile {
  resumes?: SyncedProfileDocument[];
  coverLetters?: SyncedProfileDocument[];
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  profile: SyncedProfile | null;
}

export function uploadProfile(profile: SyncedProfile): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/profile', {
    method: 'POST',
    body: profile,
    auth: true,
  });
}

export function getProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/profile', {
    method: 'GET',
    auth: true,
  });
}

export function deleteProfile(): Promise<void> {
  return apiRequest('/users/profile', {
    method: 'DELETE',
    auth: true,
  });
}

export interface ResumeVersion {
  id: string;
  label: string | null;
  createdAt: string;
}

export function listProfileVersions(): Promise<ResumeVersion[]> {
  return apiRequest<ResumeVersion[]>('/users/profile/versions', {
    method: 'GET',
    auth: true,
  });
}

export function createProfileVersion(label?: string): Promise<ResumeVersion> {
  return apiRequest<ResumeVersion>('/users/profile/versions', {
    method: 'POST',
    body: { label },
    auth: true,
  });
}

export function restoreProfileVersion(versionId: string): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/profile/versions/restore', {
    method: 'POST',
    body: { versionId },
    auth: true,
  });
}
