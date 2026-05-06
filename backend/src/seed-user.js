import 'dotenv/config';
import { createUser, getUserByEmail } from './db.js';
import { hashPassword } from './auth.js';

const ALLOWED_ROLES = new Set(['citizen', 'recycler', 'admin', 'supervisor', 'superadmin']);

function readArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function readValue(name, fallback = '') {
  return (
    readArg(name) ||
    process.env[`SEED_${name.toUpperCase().replace(/-/g, '_')}`] ||
    fallback
  );
}

function normalizeRole(value) {
  const role = String(value ?? '').trim().toLowerCase();
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error('El rol debe ser citizen, recycler, admin, supervisor o superadmin.');
  }
  return role;
}

async function main() {
  const name = String(readValue('name')).trim();
  const email = String(readValue('email')).trim().toLowerCase();
  const phone = String(readValue('phone')).trim();
  const cedula = String(readValue('cedula')).trim();
  const password = String(readValue('password')).trim();
  const association = String(readValue('association')).trim();
  const role = normalizeRole(readValue('role', 'admin'));

  if (!name || !email || !password) {
    throw new Error(
      'Faltan datos. Usa por ejemplo: npm run seed:admin -- --name="Admin" --email="admin@eca.com" --password="Password1" --phone="3001234567"',
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    console.log(`ℹ️ Ya existe un usuario con el correo ${email}.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    name,
    email,
    phone,
    cedula: cedula || null,
    role,
    passwordHash,
    association: association || null,
  });

  console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
}

main().catch((error) => {
  console.error('❌ No fue posible crear el usuario.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
