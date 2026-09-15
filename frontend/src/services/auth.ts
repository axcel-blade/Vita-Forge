import { apiRequest } from './http';
import type { User as UserType } from '../types/user';

export interface AuthResponse {
  message: string;
  userId: string;
  access_token: string;
  refresh_token: string;
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

export function refresh(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  });
}

export function getProfile(token?: string): Promise<UserType> {
  return apiRequest<UserType>('/auth/me', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    auth: !token,
  });
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: true });
  } catch {
    // Token may already be expired/invalid — clearing local state below still logs the user out.
  }
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

export interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
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
