import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

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
    console.log('Iniciando migración para pagos y perfil de anfitrión...');

    // Añadir campos bancarios a perfil_anfitrion
    await client.query(`
      ALTER TABLE perfil_anfitrion
      ADD COLUMN IF NOT EXISTS banco_nombre VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tipo_cuenta VARCHAR(50),
      ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(50),
      ADD COLUMN IF NOT EXISTS identificacion VARCHAR(20)
    `);
    console.log('✔ Columnas bancarias agregadas a perfil_anfitrion.');

    // Añadir campo monto_reembolsado a pagos
    await client.query(`
      ALTER TABLE pagos
      ADD COLUMN IF NOT EXISTS monto_reembolsado NUMERIC(10,2) DEFAULT 0
    `);
    console.log('✔ Columna monto_reembolsado agregada a pagos.');

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
