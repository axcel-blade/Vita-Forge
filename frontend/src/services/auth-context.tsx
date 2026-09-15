import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  getProfile as fetchAuthProfile,
  logout as logoutRequest,
  refresh as refreshRequest,
  type AuthResponse,
  type LoginData,
  type RegisterData,
} from './auth';
import { clearToken, getRefreshToken, getStoredToken, storeRefreshToken, storeToken } from './token';
import { isApiError } from './error-handling';
import { syncLocalBundleAfterAuth } from './profile-sync';
import { enableRemoteProfileMode } from '../features/shared/services/profileBundle';
import type { User as UserType } from '../types/user';

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: UserType) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function persistSession(response: AuthResponse) {
  storeToken(response.access_token);
  storeRefreshToken(response.refresh_token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      let accessToken = getStoredToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && refreshToken) {
        try {
          const refreshed = await refreshRequest(refreshToken);
          persistSession(refreshed);
          accessToken = refreshed.access_token;
        } catch {
          clearToken();
          setIsLoading(false);
          return;
        }
      }

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      setToken(accessToken);
      try {
        setUser(await fetchAuthProfile(accessToken));
        await syncLocalBundleAfterAuth();
      } catch {
        if (refreshToken) {
          try {
            const refreshed = await refreshRequest(refreshToken);
            persistSession(refreshed);
            setToken(refreshed.access_token);
            setUser(await fetchAuthProfile(refreshed.access_token));
            return;
          } catch {
            // fall through
          }
        }
        clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await loginRequest(data);
      persistSession(response);
      setToken(response.access_token);
      setUser(await fetchAuthProfile(response.access_token));
      await syncLocalBundleAfterAuth();
      return response;
    } catch (error: unknown) {
      throw new Error(isApiError(error) ? error.message : 'Login failed');
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await registerRequest(data);
      persistSession(response);
      setToken(response.access_token);
      setUser(await fetchAuthProfile(response.access_token));
      await syncLocalBundleAfterAuth();
      return response;
    } catch (error: unknown) {
      throw new Error(isApiError(error) ? error.message : 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    clearToken();
    enableRemoteProfileMode(false);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        setUser,
        isAuthenticated: Boolean(token && user),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default useAuth;
