import { apiRequest } from './api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cedula?: string;
  role: string;
  association?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ListUsersResponse {
  users: ApiUser[];
}

interface UserResponse {
  user: ApiUser;
}

export async function fetchUsers(token: string): Promise<ApiUser[]> {
  const data = await apiRequest<ListUsersResponse>('/api/users', { token });
  return data.users;
}

export async function fetchUserById(token: string, id: string): Promise<ApiUser> {
  const data = await apiRequest<UserResponse>(`/api/users/${id}`, { token });
  return data.user;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  cedula?: string;
  role: string;
  status?: string;
  association?: string;
  password: string;
}

export async function createApiUser(token: string, payload: CreateUserPayload): Promise<ApiUser> {
  const data = await apiRequest<UserResponse>('/api/admin/users', {
    method: 'POST',
    token,
    body: payload,
  });
  return data.user;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  cedula?: string | null;
  role?: string;
  status?: string;
  association?: string | null;
  password?: string;
}

export async function updateApiUser(token: string, id: string, payload: UpdateUserPayload): Promise<ApiUser> {
  const data = await apiRequest<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
  return data.user;
}

export async function deleteApiUser(token: string, id: string): Promise<void> {
  await apiRequest(`/api/users/${id}`, { method: 'DELETE', token });
}
