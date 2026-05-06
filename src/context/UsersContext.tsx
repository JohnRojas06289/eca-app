import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { HAS_API_BASE_URL } from '@/src/config/env';
import {
  fetchUsers,
  fetchUserById,
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
  phone?: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
  totalKg?: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  cedula?: string | null;
  role?: UserRole;
  status?: UserStatus;
  association?: string | null;
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
  loadUserById: (id: string) => Promise<AppUser | null>;
  getUserById: (id: string) => AppUser | undefined;
}

function parseApiDate(value?: string): Date | null {
  if (!value) return null;
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatJoinedAt(value?: string): string {
  const date = parseApiDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
}

function apiUserToAppUser(u: ApiUser): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    cedula: u.cedula ?? '',
    role: (u.role as UserRole) ?? 'citizen',
    status: (u.status as UserStatus) ?? 'active',
    association: u.association,
    joinedAt: formatJoinedAt(u.createdAt),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function upsertUserInList(users: AppUser[], nextUser: AppUser): AppUser[] {
  const existingIndex = users.findIndex((user) => user.id === nextUser.id);
  if (existingIndex === -1) {
    return [nextUser, ...users];
  }

  const updatedUsers = [...users];
  updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...nextUser };
  return updatedUsers;
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
    if (!canFetch) {
      setUsers([]);
      setError(null);
      return;
    }

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
      phone: input.phone,
      cedula: input.cedula,
      role: input.role,
      status: input.status,
      association: input.association,
      password: input.password,
    });
    const appUser = apiUserToAppUser(apiUser);
    setUsers((prev) => upsertUserInList(prev, appUser));
    return appUser;
  }, [token]);

  const updateUser = useCallback(async (id: string, patch: UpdateUserInput): Promise<void> => {
    const apiUser = await updateApiUser(token, id, patch);
    const updated = apiUserToAppUser(apiUser);
    setUsers((prev) => upsertUserInList(prev, updated));
  }, [token]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    await deleteApiUser(token, id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, [token]);

  const loadUserById = useCallback(async (id: string): Promise<AppUser | null> => {
    if (!canFetch || !id) return null;
    const apiUser = await fetchUserById(token, id);
    const appUser = apiUserToAppUser(apiUser);
    setUsers((prev) => upsertUserInList(prev, appUser));
    return appUser;
  }, [canFetch, token]);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  return (
    <UsersContext.Provider value={{ users, isLoading, error, reload, createUser, updateUser, deleteUser, loadUserById, getUserById }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider');
  return ctx;
}
