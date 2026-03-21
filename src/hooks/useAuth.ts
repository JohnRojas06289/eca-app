import { useState, useEffect, useCallback } from 'react';
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

const AUTH_STORAGE_KEY = '@eca_ziparecicla_auth';

// ── Sesión de admin quemada para demo/desarrollo ────────────
const DEMO_ADMIN: AuthUser = {
  id: 'admin-001',
  name: 'Carlos Administrador',
  role: 'admin',
  token: 'demo-admin-token',
  cedula: '9000000001',
  phone: '+57 310 000 0001',
};

/**
 * Hook de autenticación global.
 * Lee y persiste la sesión en AsyncStorage.
 *
 * Estados de `user`:
 *   undefined  → cargando (todavía no se leyó AsyncStorage)
 *   null       → no autenticado
 *   AuthUser   → autenticado
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const json = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (json) {
        setUser(JSON.parse(json) as AuthUser);
      } else {
        // Sesión de admin quemada — reemplazar con null cuando haya API real
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
        setUser(DEMO_ADMIN);
      }
    } catch {
      setUser(DEMO_ADMIN);
    }
  }

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

  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: user !== null && user !== undefined,
    signIn,
    signOut,
    updateUser,
  };
}
