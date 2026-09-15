import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  getProfile as fetchAuthProfile,
  logout as logoutRequest,
  type LoginData,
  type RegisterData,
} from './auth';
import { setUnauthorizedHandler } from './http';
import { isApiError } from './error-handling';
import { syncLocalBundleAfterAuth } from './profile-sync';
import { enableRemoteProfileMode } from '../features/shared/services/profileBundle';
import type { User as UserType } from '../types/user';

interface AuthContextType {
  user: UserType | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Any authenticated request that comes back 401 (missing/expired/invalid session cookie)
  // clears local state so ProtectedRoute redirects to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      enableRemoteProfileMode(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      // The HttpOnly session cookie (if any) is sent automatically — this either resolves
      // with the current user (valid, unexpired session) or throws a 401 (none/expired/invalid).
      try {
        setUser(await fetchAuthProfile());
        await syncLocalBundleAfterAuth();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      await loginRequest(data);
      setUser(await fetchAuthProfile());
      await syncLocalBundleAfterAuth();
    } catch (error: unknown) {
      throw new Error(isApiError(error) ? error.message : 'Login failed');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await registerRequest(data);
      setUser(await fetchAuthProfile());
      await syncLocalBundleAfterAuth();
    } catch (error: unknown) {
      throw new Error(isApiError(error) ? error.message : 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    enableRemoteProfileMode(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        setUser,
        isAuthenticated: Boolean(user),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default useAuth;
