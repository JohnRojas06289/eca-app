import crypto from 'node:crypto';

function createHttpError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
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

function getTursoConfig() {
  const databaseUrl = readEnvString('TURSO_DATABASE_URL').replace('libsql://', 'https://');
  const authToken = readEnvString('TURSO_AUTH_TOKEN');

  return {
    databaseUrl,
    authToken,
    configured: databaseUrl.length > 0 && authToken.length > 0,
  };
}

export function getDatabaseConfigStatus() {
  const { databaseUrl, authToken, configured } = getTursoConfig();
  return {
    configured,
    hasDatabaseUrl: databaseUrl.length > 0,
    hasAuthToken: authToken.length > 0,
  };
}

function assertDatabaseConfigured() {
  const config = getTursoConfig();
  if (!config.configured) {
    throw createHttpError(
      'La base de datos Turso no está configurada. Define TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.',
      503,
    );
  }
  return config;
}

function toHrana(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (typeof value === 'boolean') return { type: 'integer', value: value ? '1' : '0' };
  if (typeof value === 'number') {
    return { type: Number.isInteger(value) ? 'integer' : 'float', value: String(value) };
  }
  return { type: 'text', value: String(value) };
}

async function rawQuery(sql, args = []) {
  const { databaseUrl, authToken } = assertDatabaseConfigured();

  const response = await fetch(`${databaseUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toHrana) } },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    throw createHttpError(`Turso HTTP ${response.status}: ${await response.text()}`, 502);
  }

  const data = await response.json();
  const result = data.results?.[0];
  if (result?.type === 'error') {
    throw createHttpError(result.error?.message ?? 'Error de Turso.', 502);
  }

  const { cols = [], rows = [] } = result?.response?.result ?? {};
  return rows.map((row) =>
    Object.fromEntries(cols.map((col, index) => [col.name, row[index]?.value ?? null])),
  );
}

let schemaReadyPromise = null;

export async function ensureDatabaseReady() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await rawQuery(`CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_role TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

      await rawQuery(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
      )`);

      await rawQuery(`CREATE INDEX IF NOT EXISTS idx_chat_messages_cid
        ON chat_messages(conversation_id, id)`);

      await rawQuery(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        cedula TEXT,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        association TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

      await rawQuery(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

      await rawQuery(`ALTER TABLE users ADD COLUMN cedula TEXT`).catch(() => {});
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  return schemaReadyPromise;
}

async function query(sql, args = []) {
  await ensureDatabaseReady();
  return rawQuery(sql, args);
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export async function upsertConversation({ conversationId, userId, userRole }) {
  await query(
    `INSERT INTO conversations (id, user_id, user_role) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       user_id = COALESCE(excluded.user_id, conversations.user_id),
       user_role = COALESCE(excluded.user_role, conversations.user_role)`,
    [conversationId, userId ?? null, userRole ?? null],
  );
}

export async function saveMessage({ conversationId, sender, content }) {
  await query(
    `INSERT INTO chat_messages (conversation_id, sender, content) VALUES (?, ?, ?)`,
    [conversationId, sender, content],
  );
}

export async function getConversationMessages(conversationId, limit = 20) {
  const rows = await query(
    `SELECT sender, content FROM chat_messages
     WHERE conversation_id = ? ORDER BY id DESC LIMIT ?`,
    [conversationId, limit],
  );
  return rows.reverse();
}

export async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const rows = await query(
    `SELECT id, name, email, phone, cedula, role, password_hash, association, status, created_at, updated_at
     FROM users WHERE email = ? LIMIT 1`,
    [normalizedEmail],
  );

  return rows[0] ?? null;
}

export async function getUserById(id) {
  const rows = await query(
    `SELECT id, name, email, phone, cedula, role, password_hash, association, status, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [String(id ?? '')],
  );

  return rows[0] ?? null;
}

export async function createUser({
  name,
  email,
  phone,
  cedula,
  role,
  passwordHash,
  association = null,
}) {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser) {
    throw createHttpError('Ya existe una cuenta registrada con ese correo.', 409);
  }

  const userId = crypto.randomUUID();

  await query(
    `INSERT INTO users (
      id, name, email, phone, cedula, role, password_hash, association, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      userId,
      String(name ?? '').trim(),
      normalizedEmail,
      phone ? String(phone).trim() : null,
      cedula ? String(cedula).trim() : null,
      String(role ?? 'citizen').trim(),
      String(passwordHash ?? ''),
      association ? String(association).trim() : null,
    ],
  );

  return getUserById(userId);
}
