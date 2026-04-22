// Cliente Turso directo via HTTP (sin @libsql/client)
const TURSO_URL = (process.env.TURSO_DATABASE_URL ?? '').replace('libsql://', 'https://');
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN ?? '';

function toHrana(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return { type: Number.isInteger(v) ? 'integer' : 'float', value: String(v) };
  return { type: 'text', value: String(v) };
}

async function query(sql, args = []) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toHrana) } },
        { type: 'close' },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const result = data.results?.[0];
  if (result?.type === 'error') throw new Error(result.error?.message ?? 'Turso error');

  const { cols = [], rows = [] } = result?.response?.result ?? {};
  return rows.map((row) =>
    Object.fromEntries(cols.map((col, i) => [col.name, row[i]?.value ?? null])),
  );
}

// Inicializar schema
await query(`CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_role TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

await query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id)
)`);

await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_cid
  ON chat_messages(conversation_id, id)`);

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
