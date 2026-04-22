const { Pool } = require('pg');

// NOTE: dotenv is loaded in server.js BEFORE this module is required.
// Do NOT call dotenv.config() here — it would run before server.js can load it
// with the correct path, causing DATABASE_URL to be undefined on Render.

// ─── CRITICAL: This is the only DB configuration for production ───────────────
// If DATABASE_URL is missing on Render → pg reads PGHOST from the Docker
// environment which defaults to "base" → getaddrinfo ENOTFOUND base
//
// Solution: DATABASE_URL MUST be set in Render's Environment Variables dashboard.
// The .env file is in .gitignore and is NOT deployed to Render.
// ─────────────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Fail fast in production: better to crash with a clear message than to
// silently connect to the wrong host and return cryptic 500 errors.
if (IS_PRODUCTION && !DATABASE_URL) {
  console.error('═══════════════════════════════════════════════════════');
  console.error('  FATAL: DATABASE_URL is not set in Render environment!');
  console.error('  Go to Render Dashboard → Environment → Add:');
  console.error('  DATABASE_URL = postgresql://user:pass@host:5432/db');
  console.error('═══════════════════════════════════════════════════════');
  process.exit(1);
}

let poolConfig;

if (DATABASE_URL) {
  // Render (Supabase) or local dev against Supabase
  poolConfig = {
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  const safeUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
  console.log('[DB] Mode: DATABASE_URL →', safeUrl);
} else {
  // Local-only PostgreSQL (DATABASE_URL not set at all)
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'turismo_istpet',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 5432,
  };
  console.log('[DB] Mode: local →', poolConfig.host, '/', poolConfig.database);
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB] Idle client error:', err.message);
});

pool.query('SELECT 1')
  .then(() => console.log('[DB] Connection OK ✓'))
  .catch((err) => {
    console.error('[DB] Connection FAILED ✗', err.message);
    if (!DATABASE_URL) {
      console.error('[DB] Hint: DATABASE_URL is not set. Set it in Render Dashboard.');
    }
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
