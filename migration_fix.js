const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), 'BACKEND', '.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'turismo_istpet',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Iniciando migración secundaria de base de datos...');

    await client.query(`
      ALTER TABLE mensajes
      ADD COLUMN IF NOT EXISTS archivado_emisor BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS archivado_receptor BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS eliminado_emisor BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS eliminado_receptor BOOLEAN DEFAULT FALSE
    `);
    console.log('✔ Columnas de estado (archivado/eliminado) agregadas a mensajes.');

    await client.query(`
      ALTER TABLE perfil_turista
      ADD COLUMN IF NOT EXISTS banco_nombre VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tipo_cuenta VARCHAR(50),
      ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(50),
      ADD COLUMN IF NOT EXISTS identificacion VARCHAR(20)
    `);
    console.log('✔ Columnas bancarias agregadas a perfil_turista.');

    await client.query('COMMIT');
    console.log('¡Migración completada exitosamente!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
