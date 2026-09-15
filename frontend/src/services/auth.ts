import { apiRequest } from './http';
import type { User as UserType } from '../types/user';

export interface AuthResponse {
  message: string;
  userId: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export function register(data: RegisterData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export function login(data: LoginData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

/** Relies on the HttpOnly session cookie; resolves the current user or rejects with a 401 ApiError. */
export function getProfile(): Promise<UserType> {
  return apiRequest<UserType>('/auth/me', {
    method: 'GET',
    auth: true,
  });
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: true });
  } catch {
    // Session may already be expired/invalid — clearing local state below still logs the user out.
  }
}

export interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export function listSessions(): Promise<Session[]> {
  return apiRequest<Session[]>('/auth/sessions', {
    method: 'GET',
    auth: true,
  });
}

export function revokeSession(sessionId: string): Promise<void> {
  return apiRequest<void>(`/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export interface UpdateAccountData {
  name?: string;
  email?: string;
}

export function updateAccount(data: UpdateAccountData): Promise<UserType> {
  return apiRequest<UserType>('/auth/account', {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function changePassword(data: ChangePasswordData): Promise<void> {
  return apiRequest<void>('/auth/change-password', {
    method: 'POST',
    body: data,
    auth: true,
  });
}
