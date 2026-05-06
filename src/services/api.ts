import { API_BASE_URL } from '@/src/config/env';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('API no configurada.', 0);
  }

  const { token, ...fetchOptions } = options;
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
    body: fetchOptions.body == null ? undefined : JSON.stringify(fetchOptions.body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || payload?.message || `Error HTTP ${response.status}`,
      response.status,
    );
  }

  return payload as T;
}
