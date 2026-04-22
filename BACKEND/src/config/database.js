const { Pool } = require('pg');
const path = require('path');

// Load .env ONLY if variables are not already set (override:false means Render's
// dashboard environment variables always take priority over any .env file in the repo).
require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
  override: false,
});

// ─── Root cause of ENOTFOUND "base" ──────────────────────────────────────────
// When DATABASE_URL is absent and DB_HOST is undefined, the 'pg' driver reads
// the PGHOST system environment variable. On Render's container environment that
// variable is "base" (the internal Docker service name), producing ENOTFOUND.
//
// Fix: check DATABASE_URL first. If present, always use it (works in both Render
// and local-vs-Supabase dev). Only fall back to individual params when DATABASE_URL
// is completely absent (purely local PostgreSQL).
// ─────────────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;

let poolConfig;

if (DATABASE_URL) {
  // Production (Render + Supabase) OR local dev pointing at Supabase
  poolConfig = {
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  console.log('[DB] Using DATABASE_URL connection string');
} else {
  // Purely local PostgreSQL (no DATABASE_URL in env at all)
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432,
  };
  console.log('[DB] Using local PostgreSQL config (DB_HOST:', poolConfig.host, ')');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  // Log but do NOT exit — let the pool recover from transient errors
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// Verify the connection works on startup so deployment logs show clear status
pool.query('SELECT 1').then(() => {
  console.log('[DB] Connection verified successfully');
}).catch((err) => {
  console.error('[DB] Connection test FAILED:', err.message);
  // Log the config being used (without password) for debugging
  if (DATABASE_URL) {
    const safeUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
    console.error('[DB] CONNECTION_STRING (redacted):', safeUrl);
  } else {
    console.error('[DB] Host:', poolConfig.host, '| DB:', poolConfig.database);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
