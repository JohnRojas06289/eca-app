const truthy = new Set(['1', 'true', 'yes', 'on']);
const falsy = new Set(['0', 'false', 'no', 'off']);

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === '') return fallback;
  const normalized = value.trim().toLowerCase();
  if (truthy.has(normalized)) return true;
  if (falsy.has(normalized)) return false;
  return fallback;
}

function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
export const HAS_API_BASE_URL = API_BASE_URL.length > 0;

/**
 * Demo defaults:
 * - Enabled when there is no API configured, so the deployed static frontend remains explorable.
 * - Disabled automatically when an API URL exists, unless explicitly overridden.
 */
const defaultDemoMode = !HAS_API_BASE_URL;

export const ENABLE_DEMO_LOGIN = readBoolean(
  process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN,
  defaultDemoMode,
);

export const USE_DEMO_AUTH = readBoolean(
  process.env.EXPO_PUBLIC_USE_DEMO_AUTH,
  defaultDemoMode,
);

export const ENABLE_DEMO_CHAT = readBoolean(
  process.env.EXPO_PUBLIC_ENABLE_DEMO_CHAT,
  !HAS_API_BASE_URL,
);
