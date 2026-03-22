const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const migration = `
  ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS eliminado_emisor BOOLEAN DEFAULT FALSE;
  ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS eliminado_receptor BOOLEAN DEFAULT FALSE;
  ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS archivado_emisor BOOLEAN DEFAULT FALSE;
  ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS archivado_receptor BOOLEAN DEFAULT FALSE;
`;

pool.query(migration)
  .then(() => {
    console.log('Migration successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
