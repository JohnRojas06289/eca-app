import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import {
  createUser,
  ensureDatabaseReady,
  getConversationMessages,
  getDatabaseConfigStatus,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  saveMessage,
  upsertConversation,
} from './db.js';
import { createAccessToken, hashPassword, verifyPassword, verifyAccessToken } from './auth.js';

const app = express();

const ALLOWED_ROLES = new Set(['citizen', 'recycler', 'admin', 'supervisor', 'superadmin']);

function readEnvString(name, fallback = '') {
  const rawValue = String(process.env[name] ?? '').trim();
  const normalizedValue =
    rawValue.length >= 2 &&
    ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'")))
      ? rawValue.slice(1, -1).trim()
      : rawValue;

  return normalizedValue || fallback;
}

const PORT = Number(readEnvString('PORT', '4000'));
const GEMINI_API_KEY = readEnvString('GEMINI_API_KEY');
const GEMINI_MODEL = readEnvString('GEMINI_MODEL', 'gemini-2.5-flash');

const SYSTEM_PROMPT_BASE = `Eres el asistente inteligente de ZipaRecicla, la app oficial de la ECA (Estación de Clasificación y Aprovechamiento de Residuos Sólidos) del municipio de Zipaquirá, Colombia.

La ECA recibe, clasifica y comercializa materiales reciclables: cartón, plástico PET, vidrio, metal, papel de archivo y chatarra.
Los recicladores entregan material, el admin registra y valida pesajes, y la ECA vende los materiales clasificados a compradores mayoristas.

Tu función es ayudar en el día a día del centro según el rol del usuario:
- Consultas sobre materiales, inventario y precios vigentes
- Registro y seguimiento de pesajes
- Reportes operativos y financieros
- Guía sobre separación en la fuente y rutas de recolección para ciudadanos
- Alertas de stock bajo o recicladores inactivos

Reglas de respuesta:
- Habla en español colombiano, de forma cálida, clara y directa
- Respuestas concisas — máximo 4 oraciones, usa listas cortas si ayuda a la claridad
- Precios en formato $XX.XXX COP/kg
- Pesos en kilogramos (kg)
- Si no tienes un dato exacto, dilo con honestidad y orienta al usuario a dónde encontrarlo en la app
- Nunca inventes cifras ni supongas datos que no tienes`;

const ROLE_CONTEXT = {
  admin: `Estás hablando con CARLOS, el ADMINISTRADOR de la ECA.
Puede registrar pesajes, validar entregas, gestionar usuarios, consultar reportes completos y ajustar precios.
Dale respuestas técnicas y operativas. Puede manejar datos numéricos detallados.`,

  recycler: `Estás hablando con JUAN, un RECICLADOR de base registrado en la ECA.
Su interés principal: cuánto pesa su material, qué precio le pagan por kilo y cómo confirmar sus pesajes.
Usa lenguaje sencillo y directo. Evita tecnicismos. Si hay cifras, explícalas en términos de ganancias.`,

  supervisor: `Estás hablando con ANA, la SUPERVISORA MUNICIPAL de la ECA.
Su foco está en métricas agregadas: total de compras vs ventas, margen operativo, número de recicladores activos, cumplimiento de metas ambientales.
Dale respuestas con visión gerencial. Puede interpretar cifras y comparativos.`,

  citizen: `Estás hablando con un CIUDADANO de Zipaquirá.
Solo quiere saber cómo separar bien sus residuos, cuándo pasa el camión y cómo llevar material a la ECA.
Usa lenguaje muy simple y amigable. Sin tecnicismos. Motívalo a reciclar.`,
};

function buildSystemPrompt(userRole) {
  const roleCtx = ROLE_CONTEXT[userRole] ?? `Estás hablando con un usuario de la aplicación ZipaRecicla.`;
  return `${SYSTEM_PROMPT_BASE}\n\nContexto del usuario actual:\n${roleCtx}`;
}

function normalizeRole(value, fallback = 'citizen') {
  const role = String(value ?? '').trim().toLowerCase();
  return ALLOWED_ROLES.has(role) ? role : fallback;
}

function sanitizeUser(user) {
  const role = String(user?.role ?? '').trim().toLowerCase();
  return {
    id: String(user?.id ?? ''),
    name: String(user?.name ?? ''),
    email: String(user?.email ?? ''),
    phone: user?.phone ? String(user.phone) : undefined,
    cedula: user?.cedula ? String(user.cedula) : undefined,
    role: ALLOWED_ROLES.has(role) ? role : 'citizen',
    association: user?.association ? String(user.association) : undefined,
    status: user?.status ? String(user.status) : undefined,
  };
}

function getErrorStatus(error, fallback = 500) {
  return typeof error?.status === 'number' ? error.status : fallback;
}

function getErrorMessage(error, fallback = 'Error interno del servidor.') {
  return error instanceof Error && error.message ? error.message : fallback;
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'eca-ai-backend',
    dbConfigured: getDatabaseConfigStatus().configured,
  });
});

app.get('/health/db', async (_req, res) => {
  try {
    await ensureDatabaseReady();
    return res.json({
      ok: true,
      database: 'turso',
      configured: true,
    });
  } catch (error) {
    return res.status(getErrorStatus(error, 503)).json({
      ok: false,
      database: 'turso',
      configured: getDatabaseConfigStatus().configured,
      error: {
        message: getErrorMessage(error, 'No fue posible validar la conexión a Turso.'),
      },
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = String(req.body?.phone ?? '').trim();
    const role = normalizeRole(req.body?.role, 'citizen');
    const password = String(req.body?.password ?? '');

    if (!name) {
      return res.status(400).json({ error: { message: 'El campo "name" es obligatorio.' } });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: { message: 'El campo "email" es inválido.' } });
    }
    if (!phone) {
      return res.status(400).json({ error: { message: 'El campo "phone" es obligatorio.' } });
    }
    if (!['citizen', 'recycler'].includes(role)) {
      return res.status(400).json({ error: { message: 'El rol permitido es citizen o recycler.' } });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: { message: 'La contraseña debe tener al menos 8 caracteres.' } });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, phone, role, passwordHash });

    return res.status(201).json({
      message: 'Cuenta creada correctamente.',
      user: sanitizeUser(user),
      token: createAccessToken(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({
      error: { message: getErrorMessage(error) },
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: { message: 'El campo "email" es inválido.' } });
    }
    if (!password) {
      return res.status(400).json({ error: { message: 'El campo "password" es obligatorio.' } });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: { message: 'Credenciales inválidas.' } });
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Credenciales inválidas.' } });
    }

    if (String(user.status ?? 'active') !== 'active') {
      return res.status(403).json({ error: { message: 'La cuenta no está activa.' } });
    }

    return res.json({
      token: createAccessToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({
      error: { message: getErrorMessage(error) },
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: { message: 'Falta GEMINI_API_KEY en el backend.' } });
    }

    const message = String(req.body?.message || '').trim();
    const userId = req.body?.userId ? String(req.body.userId) : null;
    const userRole = req.body?.userRole ? String(req.body.userRole) : null;

    if (!message) {
      return res.status(400).json({ error: { message: 'El campo "message" es obligatorio.' } });
    }

    const conversationId = req.body?.conversationId
      ? String(req.body.conversationId)
      : crypto.randomUUID();

    await upsertConversation({ conversationId, userId, userRole });
    await saveMessage({ conversationId, sender: 'user', content: message });

    const history = await getConversationMessages(conversationId, 20);
    const contents = history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(userRole) }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({
        error: {
          message: err?.error?.message || `Gemini HTTP ${geminiRes.status}`,
        },
      });
    }

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No obtuve respuesta.';

    await saveMessage({ conversationId, sender: 'assistant', content: reply });

      return res.json({ conversationId, reply });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({
      error: { message: getErrorMessage(error) },
    });
  }
});

function requireRole(...roles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Token no proporcionado.' } });
    }

    const token = authHeader.slice(7);
    const userPayload = verifyAccessToken(token);

    if (!userPayload) {
      return res.status(401).json({ error: { message: 'Token inválido o expirado.' } });
    }

    if (!roles.includes(userPayload.role)) {
      return res.status(403).json({ error: { message: 'Acceso denegado.' } });
    }

    req.user = userPayload;
    next();
  };
}

const adminMiddleware = requireRole('admin', 'supervisor', 'superadmin');
const superadminMiddleware = requireRole('superadmin');

app.get('/api/users', adminMiddleware, async (req, res) => {
  try {
    const users = await getUsers();
    return res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({ error: { message: getErrorMessage(error) } });
  }
});

app.get('/api/users/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({ error: { message: getErrorMessage(error) } });
  }
});

app.post('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = String(req.body?.phone ?? '').trim();
    const cedula = String(req.body?.cedula ?? '').trim();
    const association = String(req.body?.association ?? '').trim();
    const password = String(req.body?.password ?? '');
    const requestedRole = String(req.body?.role ?? 'citizen').trim().toLowerCase();
    const status = String(req.body?.status ?? 'active').trim();

    if (!name) return res.status(400).json({ error: { message: 'El campo "name" es obligatorio.' } });
    if (!email || !email.includes('@')) return res.status(400).json({ error: { message: 'El campo "email" es inválido.' } });
    if (password.length < 8) return res.status(400).json({ error: { message: 'La contraseña debe tener al menos 8 caracteres.' } });

    // Solo superadmin puede crear otro superadmin
    if (requestedRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: { message: 'Solo un superadmin puede crear otro superadmin.' } });
    }

    if (!ALLOWED_ROLES.has(requestedRole)) {
      return res.status(400).json({ error: { message: 'Rol inválido.' } });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, phone: phone || null, cedula: cedula || null, role: requestedRole, passwordHash, association: association || null });

    // Ajustar status si se envió diferente al default
    const finalUser = status !== 'active'
      ? await updateUser(user.id, { status })
      : user;

    return res.status(201).json({ message: 'Usuario creado correctamente.', user: sanitizeUser(finalUser) });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({ error: { message: getErrorMessage(error) } });
  }
});

app.put('/api/users/:id', adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const existingUser = await getUserById(id);
    if (!existingUser) return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });

    const requestedRole = req.body.role ? String(req.body.role).trim().toLowerCase() : undefined;

    // Solo superadmin puede asignar o quitar el rol superadmin
    if (requestedRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: { message: 'Solo un superadmin puede asignar ese rol.' } });
    }
    if (existingUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: { message: 'No puedes modificar a un superadmin.' } });
    }

    const updates = {};
    if (req.body.name)              updates.name        = String(req.body.name).trim();
    if (req.body.email)             updates.email       = String(req.body.email).trim().toLowerCase();
    if (req.body.phone !== undefined)       updates.phone       = req.body.phone ? String(req.body.phone).trim() : null;
    if (req.body.cedula !== undefined)      updates.cedula      = req.body.cedula ? String(req.body.cedula).trim() : null;
    if (requestedRole && ALLOWED_ROLES.has(requestedRole)) updates.role = requestedRole;
    if (req.body.association !== undefined) updates.association = req.body.association ? String(req.body.association).trim() : null;
    if (req.body.status)            updates.status      = String(req.body.status).trim();

    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        return res.status(400).json({ error: { message: 'La contraseña debe tener al menos 8 caracteres.' } });
      }
      updates.passwordHash = await hashPassword(req.body.password);
    }

    const updatedUser = await updateUser(id, updates);
    return res.json({ message: 'Usuario actualizado.', user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({ error: { message: getErrorMessage(error) } });
  }
});

app.delete('/api/users/:id', adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const existingUser = await getUserById(id);
    if (!existingUser) return res.status(404).json({ error: { message: 'Usuario no encontrado.' } });

    // Solo superadmin puede eliminar superadmins
    if (existingUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: { message: 'No puedes eliminar a un superadmin.' } });
    }

    await deleteUser(id);
    return res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(getErrorStatus(error)).json({ error: { message: getErrorMessage(error) } });
  }
});

// En local levanta el servidor. En Vercel se exporta como handler.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✅ Backend IA escuchando en http://localhost:${PORT}`);
  });
}

export default app;
