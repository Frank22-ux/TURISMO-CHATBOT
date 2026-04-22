const path = require('path');
// Load .env with an explicit path so it works regardless of CWD (important on Render)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

const PORT = process.env.PORT || 3000;

// Safety check: abort early in production if DATABASE_URL is missing
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('[FATAL] DATABASE_URL is not set. Cannot start in production without a database.');
    process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
