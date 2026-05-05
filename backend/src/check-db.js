import 'dotenv/config';
import { ensureDatabaseReady, getDatabaseConfigStatus } from './db.js';

async function main() {
  const status = getDatabaseConfigStatus();

  if (!status.configured) {
    console.error('❌ Turso no está configurado localmente.');
    console.error(`- TURSO_DATABASE_URL: ${status.hasDatabaseUrl ? 'OK' : 'FALTA'}`);
    console.error(`- TURSO_AUTH_TOKEN: ${status.hasAuthToken ? 'OK' : 'FALTA'}`);
    process.exit(1);
  }

  await ensureDatabaseReady();
  console.log('✅ Conexión a Turso verificada y esquema listo.');
}

main().catch((error) => {
  console.error('❌ Falló la verificación de Turso.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
