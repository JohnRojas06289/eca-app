import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);
const HASH_BYTES = 64;

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePassword(password) {
  return String(password ?? '');
}

function readEnvString(name) {
  const rawValue = String(process.env[name] ?? '').trim();
  if (
    rawValue.length >= 2 &&
    ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'")))
  ) {
    return rawValue.slice(1, -1).trim();
  }
  return rawValue;
}

export async function hashPassword(password) {
  const plainPassword = normalizePassword(password);
  if (plainPassword.length < 8) {
    throw createHttpError('La contraseña debe tener al menos 8 caracteres.', 400);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(plainPassword, salt, HASH_BYTES);

  return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const plainPassword = normalizePassword(password);
  const [salt, expectedHex] = String(storedHash ?? '').split(':');

  if (!salt || !expectedHex) return false;

  const derivedKey = await scryptAsync(plainPassword, salt, HASH_BYTES);
  const expectedKey = Buffer.from(expectedHex, 'hex');
  const actualKey = Buffer.from(derivedKey);

  if (expectedKey.length !== actualKey.length) return false;

  return crypto.timingSafeEqual(expectedKey, actualKey);
}

function getTokenSecret() {
  return (
    readEnvString('AUTH_TOKEN_SECRET') ||
    readEnvString('GEMINI_API_KEY') ||
    'eca-app-dev-secret'
  );
}

export function createAccessToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      email: user.email,
      iat: Date.now(),
    }),
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifyAccessToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

