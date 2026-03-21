import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'citizen' | 'recycler' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  token: string;
  cedula?: string;
  phone?: string;
  association?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (userData: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => Promise<void>;
}

const AUTH_STORAGE_KEY = '@eca_ziparecicla_auth_v2';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((json) => setUser(json ? (JSON.parse(json) as AuthUser) : null))
      .catch(() => setUser(null));
  }, []);

  const signIn = useCallback(async (userData: AuthUser) => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)).catch(() => null);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: user === undefined,
        isAuthenticated: user !== null && user !== undefined,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
