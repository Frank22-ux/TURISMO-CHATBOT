const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function check() {
  try {
    console.log('--- DATABASE STRUCTURE CHECK ---');
    console.log('Database:', process.env.DB_NAME);
    
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (res.rows.length === 0) {
        console.error('CRITICAL: Table "usuarios" NOT FOUND in public schema.');
    } else {
        console.log('Columns in "usuarios" table:');
        res.rows.forEach(row => {
          console.log(`- ${row.column_name} (${row.data_type})`);
        });
    }

  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await pool.end();
  }
}

check();
