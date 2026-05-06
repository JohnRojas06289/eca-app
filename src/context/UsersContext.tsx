import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { HAS_API_BASE_URL } from '@/src/config/env';
import {
  fetchUsers,
  createApiUser,
  updateApiUser,
  deleteApiUser,
  type ApiUser,
} from '@/src/services/users';

export type UserRole = 'recycler' | 'citizen' | 'admin' | 'supervisor' | 'superadmin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  joinedAt: string;
  totalKg?: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  cedula?: string;
  role?: UserRole;
  status?: UserStatus;
  association?: string;
  password?: string;
}

interface UsersContextValue {
  users: AppUser[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<AppUser>;
  updateUser: (id: string, patch: UpdateUserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => AppUser | undefined;
}

function apiUserToAppUser(u: ApiUser): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    cedula: u.cedula ?? '',
    role: (u.role as UserRole) ?? 'citizen',
    status: (u.status as UserStatus) ?? 'active',
    association: u.association,
    joinedAt: new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
  };
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const token = authUser?.token ?? '';

  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = HAS_API_BASE_URL && !!token &&
    ['admin', 'superadmin', 'supervisor'].includes(authUser?.role ?? '');

  const reload = useCallback(async () => {
    if (!canFetch) return;
    setIsLoading(true);
    setError(null);
    try {
      const apiUsers = await fetchUsers(token);
      setUsers(apiUsers.map(apiUserToAppUser));
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, [token, canFetch]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createUser = useCallback(async (input: CreateUserInput): Promise<AppUser> => {
    const apiUser = await createApiUser(token, {
      name: input.name,
      email: input.email,
      cedula: input.cedula,
      role: input.role,
      status: input.status,
      association: input.association,
      password: input.password,
    });
    const appUser = apiUserToAppUser(apiUser);
    setUsers((prev) => [appUser, ...prev]);
    return appUser;
  }, [token]);

  const updateUser = useCallback(async (id: string, patch: UpdateUserInput): Promise<void> => {
    const apiUser = await updateApiUser(token, id, patch);
    const updated = apiUserToAppUser(apiUser);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  }, [token]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    await deleteApiUser(token, id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, [token]);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  return (
    <UsersContext.Provider value={{ users, isLoading, error, reload, createUser, updateUser, deleteUser, getUserById }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider');
  return ctx;
}
