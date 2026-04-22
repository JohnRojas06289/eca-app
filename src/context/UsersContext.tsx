import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'recycler' | 'citizen' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface AppUser {
  id: string;
  name: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  joinedAt: string;
  totalKg?: number;
}

const INITIAL_USERS: AppUser[] = [
  { id: '1', name: 'Juan Pérez',       cedula: '12345678', role: 'recycler', status: 'active',   association: 'Asoc. Zipaquirá', joinedAt: 'Ene 2024', totalKg: 1250 },
  { id: '2', name: 'María González',   cedula: '87654321', role: 'recycler', status: 'pending',  association: 'Asoc. Zipaquirá', joinedAt: 'Mar 2026' },
  { id: '3', name: 'Carlos Ruiz',      cedula: '23456789', role: 'citizen',  status: 'active',   joinedAt: 'Feb 2025' },
  { id: '4', name: 'Ana Martínez',     cedula: '34567890', role: 'citizen',  status: 'active',   joinedAt: 'Jun 2025' },
  { id: '5', name: 'Pedro Sánchez',    cedula: '45678901', role: 'recycler', status: 'inactive', association: 'Asoc. Norte',     joinedAt: 'Oct 2023', totalKg: 320 },
  { id: '6', name: 'Lucía Fernández',  cedula: '56789012', role: 'admin',    status: 'active',   joinedAt: 'Ene 2023' },
  { id: '7', name: 'Diego Torres',     cedula: '67890123', role: 'citizen',  status: 'active',   joinedAt: 'Nov 2025' },
];

export interface CreateUserInput {
  name: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
}

interface UsersContextValue {
  users: AppUser[];
  createUser: (input: CreateUserInput) => AppUser;
  updateUser: (id: string, patch: Partial<Omit<AppUser, 'id'>>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => AppUser | undefined;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);

  const createUser = useCallback((input: CreateUserInput): AppUser => {
    const newUser: AppUser = {
      ...input,
      id: Date.now().toString(),
      joinedAt: new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
      totalKg: input.role === 'recycler' ? 0 : undefined,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, patch: Partial<Omit<AppUser, 'id'>>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  return (
    <UsersContext.Provider value={{ users, createUser, updateUser, deleteUser, getUserById }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider');
  return ctx;
}
