import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/hooks/useAuth';
import { HAS_API_BASE_URL } from '@/src/config/env';
import { ApiError } from '@/src/services/api';
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
export type UserSyncStatus = 'synced' | 'pending_create' | 'pending_update';

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
  syncStatus?: UserSyncStatus;
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
  isSyncing: boolean;
  pendingChangesCount: number;
  reload: () => Promise<void>;
  syncPendingChanges: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<AppUser>;
  updateUser: (id: string, patch: UpdateUserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loadUserById: (id: string) => Promise<AppUser | null>;
  getUserById: (id: string) => AppUser | undefined;
}

type OfflineUserMutation =
  | {
      id: string;
      type: 'create';
      userId: string;
      payload: CreateUserInput;
      createdAt: string;
    }
  | {
      id: string;
      type: 'update';
      userId: string;
      payload: UpdateUserInput;
      createdAt: string;
    }
  | {
      id: string;
      type: 'delete';
      userId: string;
      createdAt: string;
    };

const USERS_CACHE_PREFIX = '@eca_ziparecicla_users_cache';
const USERS_QUEUE_PREFIX = '@eca_ziparecicla_users_queue';
const AUTO_SYNC_INTERVAL_MS = 15_000;

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

function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function trimToUndefined(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function trimToNull(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function sanitizeCreateInput(input: CreateUserInput): CreateUserInput {
  const role = input.role;
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: trimToUndefined(input.phone),
    cedula: input.cedula.trim(),
    role,
    status: input.status,
    association: role === 'recycler' ? trimToUndefined(input.association) : undefined,
    password: input.password.trim(),
  };
}

function sanitizeUpdateInput(patch: UpdateUserInput): UpdateUserInput {
  const next: UpdateUserInput = {};

  if (patch.name !== undefined) next.name = patch.name.trim();
  if (patch.email !== undefined) next.email = patch.email.trim().toLowerCase();
  if (patch.phone !== undefined) next.phone = trimToNull(patch.phone);
  if (patch.cedula !== undefined) next.cedula = trimToNull(patch.cedula);
  if (patch.role !== undefined) next.role = patch.role;
  if (patch.status !== undefined) next.status = patch.status;
  if (patch.association !== undefined) next.association = trimToNull(patch.association);
  if (patch.password !== undefined) next.password = patch.password.trim();

  if (next.role !== undefined && next.role !== 'recycler' && next.association === undefined) {
    next.association = null;
  }

  return next;
}

function apiUserToAppUser(u: ApiUser, syncStatus: UserSyncStatus = 'synced'): AppUser {
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
    syncStatus,
  };
}

function createOptimisticUser(input: CreateUserInput, id: string, createdAt: string): AppUser {
  return {
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    cedula: input.cedula,
    role: input.role,
    status: input.status,
    association: input.role === 'recycler' ? input.association : undefined,
    joinedAt: formatJoinedAt(createdAt),
    createdAt,
    updatedAt: createdAt,
    syncStatus: 'pending_create',
  };
}

function applyUpdatePatchToUser(user: AppUser, patch: UpdateUserInput, syncStatus: UserSyncStatus = 'pending_update'): AppUser {
  const role = patch.role ?? user.role;
  const association = patch.association !== undefined
    ? patch.association ?? undefined
    : role === 'recycler'
      ? user.association
      : undefined;

  return {
    ...user,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone ?? undefined } : {}),
    ...(patch.cedula !== undefined ? { cedula: patch.cedula ?? '' } : {}),
    ...(patch.role !== undefined ? { role: patch.role } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    association,
    updatedAt: new Date().toISOString(),
    syncStatus,
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

function replaceUserIdInList(users: AppUser[], previousId: string, nextUser: AppUser): AppUser[] {
  const existingIndex = users.findIndex((user) => user.id === previousId || user.id === nextUser.id);
  if (existingIndex === -1) {
    return [nextUser, ...users];
  }

  const updatedUsers = [...users];
  updatedUsers[existingIndex] = nextUser;
  return updatedUsers;
}

function mergeCreatePayloadWithUpdate(payload: CreateUserInput, patch: UpdateUserInput): CreateUserInput {
  const role = patch.role ?? payload.role;
  const association = role === 'recycler'
    ? patch.association !== undefined
      ? patch.association ?? undefined
      : payload.association
    : undefined;

  return {
    ...payload,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone ?? undefined } : {}),
    ...(patch.cedula !== undefined ? { cedula: patch.cedula ?? '' } : {}),
    ...(patch.role !== undefined ? { role: patch.role } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    association,
    ...(patch.password !== undefined && patch.password !== '' ? { password: patch.password } : {}),
  };
}

function mergeUpdatePatches(current: UpdateUserInput, patch: UpdateUserInput): UpdateUserInput {
  return {
    ...current,
    ...patch,
  };
}

function applyPendingMutations(baseUsers: AppUser[], queue: OfflineUserMutation[]): AppUser[] {
  return queue.reduce<AppUser[]>((acc, mutation) => {
    if (mutation.type === 'create') {
      return upsertUserInList(
        acc,
        createOptimisticUser(mutation.payload, mutation.userId, mutation.createdAt),
      );
    }

    if (mutation.type === 'update') {
      return acc.map((user) =>
        user.id === mutation.userId ? applyUpdatePatchToUser(user, mutation.payload) : user,
      );
    }

    return acc.filter((user) => user.id !== mutation.userId);
  }, baseUsers.map((user) => ({ ...user, syncStatus: 'synced' })));
}

function isRetryableOfflineError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.message === 'API no configurada.') return false;
    return [0, 408, 502, 503, 504].includes(error.status);
  }

  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('offline')
  );
}

function getCacheKey(scope: string | null): string | null {
  return scope ? `${USERS_CACHE_PREFIX}:${scope}:v1` : null;
}

function getQueueKey(scope: string | null): string | null {
  return scope ? `${USERS_QUEUE_PREFIX}:${scope}:v1` : null;
}

function parseStoredUsers(value: string | null): AppUser[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as AppUser[];
  } catch {
    return [];
  }
}

function parseStoredQueue(value: string | null): OfflineUserMutation[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as OfflineUserMutation[];
  } catch {
    return [];
  }
}

function buildOfflineMessage(pendingChangesCount: number, hasLocalData: boolean): string {
  if (pendingChangesCount > 0) {
    return `Sin conexión. Se mantienen ${pendingChangesCount} cambio(s) pendientes por sincronizar.`;
  }
  if (hasLocalData) {
    return 'Sin conexión. Mostrando los datos guardados localmente.';
  }
  return 'Sin conexión. No se pudieron cargar los usuarios desde el servidor.';
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const token = authUser?.token ?? '';
  const storageScope = authUser?.id ?? null;
  const cacheKey = getCacheKey(storageScope);
  const queueKey = getQueueKey(storageScope);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [pendingQueue, setPendingQueue] = useState<OfflineUserMutation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const canFetch = HAS_API_BASE_URL && !!token &&
    ['admin', 'superadmin', 'supervisor'].includes(authUser?.role ?? '');

  const usersRef = useRef<AppUser[]>([]);
  const queueRef = useRef<OfflineUserMutation[]>([]);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    queueRef.current = pendingQueue;
  }, [pendingQueue]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateLocalState() {
      if (!cacheKey || !queueKey) {
        setUsers([]);
        setPendingQueue([]);
        setHydrated(true);
        return;
      }

      setHydrated(false);

      try {
        const [storedUsers, storedQueue] = await Promise.all([
          AsyncStorage.getItem(cacheKey),
          AsyncStorage.getItem(queueKey),
        ]);

        if (cancelled) return;

        setUsers(parseStoredUsers(storedUsers));
        setPendingQueue(parseStoredQueue(storedQueue));
      } catch {
        if (cancelled) return;
        setUsers([]);
        setPendingQueue([]);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    hydrateLocalState();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, queueKey]);

  useEffect(() => {
    if (!hydrated || !cacheKey) return;
    AsyncStorage.setItem(cacheKey, JSON.stringify(users)).catch(() => null);
  }, [cacheKey, hydrated, users]);

  useEffect(() => {
    if (!hydrated || !queueKey) return;
    AsyncStorage.setItem(queueKey, JSON.stringify(pendingQueue)).catch(() => null);
  }, [hydrated, pendingQueue, queueKey]);

  const syncPendingChanges = useCallback(async (): Promise<void> => {
    if (!canFetch || !token || syncInFlightRef.current || queueRef.current.length === 0) {
      return;
    }

    syncInFlightRef.current = true;
    setIsSyncing(true);

    try {
      let workingQueue = [...queueRef.current];
      let workingUsers = [...usersRef.current];

      while (workingQueue.length > 0) {
        const mutation = workingQueue[0];

        if (mutation.type === 'create') {
          const apiUser = await createApiUser(token, {
            name: mutation.payload.name,
            email: mutation.payload.email,
            phone: mutation.payload.phone,
            cedula: mutation.payload.cedula,
            role: mutation.payload.role,
            status: mutation.payload.status,
            association: mutation.payload.association,
            password: mutation.payload.password,
          });

          const syncedUser = apiUserToAppUser(apiUser);
          workingUsers = replaceUserIdInList(workingUsers, mutation.userId, syncedUser);
          workingQueue = workingQueue
            .slice(1)
            .map((item) => (item.userId === mutation.userId ? { ...item, userId: syncedUser.id } : item));
        } else if (mutation.type === 'update') {
          const apiUser = await updateApiUser(token, mutation.userId, mutation.payload);
          workingUsers = upsertUserInList(workingUsers, apiUserToAppUser(apiUser));
          workingQueue = workingQueue.slice(1);
        } else {
          await deleteApiUser(token, mutation.userId);
          workingUsers = workingUsers.filter((user) => user.id !== mutation.userId);
          workingQueue = workingQueue.slice(1);
        }

        setUsers(workingUsers);
        setPendingQueue(workingQueue);
      }

      setError(null);
    } catch (err: any) {
      if (isRetryableOfflineError(err)) {
        setError(buildOfflineMessage(queueRef.current.length, usersRef.current.length > 0));
      } else {
        setError(err?.message ?? 'No se pudieron sincronizar los cambios pendientes.');
      }
    } finally {
      syncInFlightRef.current = false;
      setIsSyncing(false);
    }
  }, [canFetch, token]);

  const reload = useCallback(async () => {
    if (!hydrated) return;

    if (!canFetch) {
      setUsers([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await syncPendingChanges();
      const apiUsers = await fetchUsers(token);
      const remoteUsers = apiUsers.map((user) => apiUserToAppUser(user));
      setUsers(applyPendingMutations(remoteUsers, queueRef.current));
      if (queueRef.current.length === 0) {
        setError(null);
      }
    } catch (err: any) {
      if (isRetryableOfflineError(err)) {
        setError(buildOfflineMessage(queueRef.current.length, usersRef.current.length > 0));
      } else {
        setError(err?.message ?? 'Error al cargar usuarios.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [canFetch, hydrated, syncPendingChanges, token]);

  useEffect(() => {
    if (!hydrated) return;
    reload();
  }, [hydrated, reload]);

  useEffect(() => {
    if (!hydrated || !canFetch) return;

    const intervalId = setInterval(() => {
      syncPendingChanges().catch(() => null);
    }, AUTO_SYNC_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [canFetch, hydrated, syncPendingChanges]);

  const createUser = useCallback(async (input: CreateUserInput): Promise<AppUser> => {
    const payload = sanitizeCreateInput(input);

    try {
      const apiUser = await createApiUser(token, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        cedula: payload.cedula,
        role: payload.role,
        status: payload.status,
        association: payload.association,
        password: payload.password,
      });
      const appUser = apiUserToAppUser(apiUser);
      setUsers((prev) => upsertUserInList(prev, appUser));
      setError(null);
      return appUser;
    } catch (err: any) {
      if (!isRetryableOfflineError(err)) throw err;

      const createdAt = new Date().toISOString();
      const optimisticUser = createOptimisticUser(payload, createLocalId('local-user'), createdAt);

      setUsers((prev) => upsertUserInList(prev, optimisticUser));
      setPendingQueue((prev) => [
        ...prev,
        {
          id: createLocalId('queue-create-user'),
          type: 'create',
          userId: optimisticUser.id,
          payload,
          createdAt,
        },
      ]);
      setError('Sin conexión. El usuario quedó guardado localmente y se sincronizará después.');

      return optimisticUser;
    }
  }, [token]);

  const updateUser = useCallback(async (id: string, patch: UpdateUserInput): Promise<void> => {
    const payload = sanitizeUpdateInput(patch);
    const hasPendingCreate = queueRef.current.some(
      (mutation) => mutation.type === 'create' && mutation.userId === id,
    );

    const applyOfflineUpdate = () => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? applyUpdatePatchToUser(user, payload) : user,
        ),
      );

      setPendingQueue((prev) => {
        const next = [...prev];
        const createIndex = next.findIndex(
          (mutation) => mutation.type === 'create' && mutation.userId === id,
        );

        if (createIndex !== -1) {
          const current = next[createIndex] as Extract<OfflineUserMutation, { type: 'create' }>;
          next[createIndex] = {
            ...current,
            payload: mergeCreatePayloadWithUpdate(current.payload, payload),
          };
          return next;
        }

        const lastUpdateIndex = [...next].reverse().findIndex(
          (mutation) => mutation.type === 'update' && mutation.userId === id,
        );

        if (lastUpdateIndex !== -1) {
          const normalizedIndex = next.length - 1 - lastUpdateIndex;
          const current = next[normalizedIndex] as Extract<OfflineUserMutation, { type: 'update' }>;
          next[normalizedIndex] = {
            ...current,
            payload: mergeUpdatePatches(current.payload, payload),
          };
          return next;
        }

        next.push({
          id: createLocalId('queue-update-user'),
          type: 'update',
          userId: id,
          payload,
          createdAt: new Date().toISOString(),
        });

        return next;
      });

      setError('Sin conexión. Los cambios del usuario se guardaron localmente y quedan pendientes por sincronizar.');
    };

    if (hasPendingCreate) {
      applyOfflineUpdate();
      return;
    }

    try {
      const apiUser = await updateApiUser(token, id, payload);
      setUsers((prev) => upsertUserInList(prev, apiUserToAppUser(apiUser)));
      setError(null);
    } catch (err: any) {
      if (!isRetryableOfflineError(err)) throw err;
      applyOfflineUpdate();
    }
  }, [token]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    const hasPendingCreate = queueRef.current.some(
      (mutation) => mutation.type === 'create' && mutation.userId === id,
    );

    const applyOfflineDelete = () => {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setPendingQueue((prev) => {
        const next = prev.filter(
          (mutation) => !(mutation.type === 'update' && mutation.userId === id),
        );

        const createIndex = next.findIndex(
          (mutation) => mutation.type === 'create' && mutation.userId === id,
        );

        if (createIndex !== -1) {
          next.splice(createIndex, 1);
          return next;
        }

        if (!next.some((mutation) => mutation.type === 'delete' && mutation.userId === id)) {
          next.push({
            id: createLocalId('queue-delete-user'),
            type: 'delete',
            userId: id,
            createdAt: new Date().toISOString(),
          });
        }

        return next;
      });
      setError('Sin conexión. La eliminación quedó pendiente y se enviará cuando vuelva la conexión.');
    };

    if (hasPendingCreate) {
      applyOfflineDelete();
      return;
    }

    try {
      await deleteApiUser(token, id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setError(null);
    } catch (err: any) {
      if (!isRetryableOfflineError(err)) throw err;
      applyOfflineDelete();
    }
  }, [token]);

  const loadUserById = useCallback(async (id: string): Promise<AppUser | null> => {
    if (!id) return null;

    const localUser = usersRef.current.find((user) => user.id === id) ?? null;
    if (!canFetch) return localUser;

    try {
      const apiUser = await fetchUserById(token, id);
      const queuedMutations = queueRef.current.filter((mutation) => mutation.userId === id);
      const mergedUser = applyPendingMutations(
        [apiUserToAppUser(apiUser)],
        queuedMutations,
      )[0] ?? (queuedMutations.some((mutation) => mutation.type === 'delete') ? null : apiUserToAppUser(apiUser));

      if (!mergedUser) return null;
      setUsers((prev) => upsertUserInList(prev, mergedUser));
      return mergedUser;
    } catch (err: any) {
      if (localUser && isRetryableOfflineError(err)) {
        return localUser;
      }
      throw err;
    }
  }, [canFetch, token]);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  return (
    <UsersContext.Provider
      value={{
        users,
        isLoading,
        error,
        isSyncing,
        pendingChangesCount: pendingQueue.length,
        reload,
        syncPendingChanges,
        createUser,
        updateUser,
        deleteUser,
        loadUserById,
        getUserById,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider');
  return ctx;
}
