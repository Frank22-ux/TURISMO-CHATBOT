const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Use NODE_ENV to detect production, not the presence of DATABASE_URL
// (DATABASE_URL may exist locally for dev against Supabase, but NODE_ENV is authoritative)
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 5432,
      }
);

pool.on('error', (err) => {
  // Log but do NOT exit — let the pool recover from transient errors
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// Test connection on startup
pool.query('SELECT 1').then(() => {
  console.log(`[DB] Connected successfully (${isProduction ? 'Supabase/Production' : 'Local PostgreSQL'})`);
}).catch((err) => {
  console.error('[DB] Connection test failed:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};