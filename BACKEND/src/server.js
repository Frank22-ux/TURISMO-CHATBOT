const path = require('path');
// Load .env with an explicit path — in Render this file does not exist (it's in .gitignore)
// so this is a no-op in production; vars come from Render's Environment Variables dashboard.
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ─── Startup audit: log which critical vars are present (never log values!) ───
console.log('[ENV] NODE_ENV     :', process.env.NODE_ENV || '(not set)');
console.log('[ENV] DATABASE_URL :', process.env.DATABASE_URL ? '✓ SET' : '✗ MISSING ← THIS CAUSES ENOTFOUND base');
console.log('[ENV] JWT_SECRET   :', process.env.JWT_SECRET   ? '✓ SET' : '✗ MISSING');
console.log('[ENV] FRONTEND_URL :', process.env.FRONTEND_URL || '(not set — using hardcoded Vercel URL)');
console.log('[ENV] PORT         :', process.env.PORT || '3000 (default)');
// ─────────────────────────────────────────────────────────────────────────────

// app.js requires all controllers which require database.js — pool is built here
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});
