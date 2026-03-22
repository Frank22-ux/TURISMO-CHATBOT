const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function updateDb() {
  try {
    console.log('Adding classifications...');
    await pool.query(`
      INSERT INTO clasificaciones_turisticas (nombre) VALUES
      ('EXTREMA'),
      ('INFANTIL'),
      ('PAREJAS'),
      ('GRUPOS'),
      ('EXCLUSIVA')
      ON CONFLICT (nombre) DO NOTHING;
    `);
    console.log('Database updated successfully');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await pool.end();
  }
}

updateDb();
