require('dotenv').config({ path: __dirname + '/../../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  try {
    console.log('Migrating reviews table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resenas (
        id_resena SERIAL PRIMARY KEY,
        id_reserva INTEGER NOT NULL REFERENCES reservas(id_reserva) ON DELETE CASCADE,
        autor_id INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        receptor_id INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        rol_autor VARCHAR(20) NOT NULL,
        puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
        comentario TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id_reserva, autor_id)
      );
    `);
    console.log('✅ Table resenas created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
