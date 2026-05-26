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
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('API no configurada.', 0);
  }

  const { token, timeoutMs = 15000, ...fetchOptions } = options;
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: fetchOptions.signal ?? controller.signal,
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
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado. Intenta de nuevo.', 408);
    }
    if (error instanceof TypeError) {
      throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.', 0);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
