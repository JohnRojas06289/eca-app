import type { AuthUser, UserRole } from '@/src/hooks/useAuth';
import { apiRequest } from './api';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  role: Extract<UserRole, 'citizen' | 'recycler'>;
  password: string;
}

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'recycler' || value === 'supervisor' || value === 'citizen' || value === 'superadmin') {
    return value;
  }
  return 'citizen';
}

function normalizeAuthUser(raw: any, fallbackEmail: string): AuthUser {
  const user = raw?.user ?? raw;
  const token = raw?.token ?? user?.token ?? raw?.accessToken ?? user?.accessToken ?? '';
  const email = user?.email ?? fallbackEmail;

  return {
    id: String(user?.id ?? email),
    name: String(user?.name ?? user?.fullName ?? email.split('@')[0] ?? 'Usuario'),
    role: normalizeRole(user?.role),
    token: String(token),
    email,
    phone: user?.phone,
    association: user?.association,
    avatarUrl: user?.avatarUrl,
  };
}

export async function loginWithApi(payload: LoginPayload): Promise<AuthUser> {
  const response = await apiRequest<any>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });

  return normalizeAuthUser(response, payload.email);
}

export async function registerWithApi(payload: RegisterPayload): Promise<void> {
  await apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}
