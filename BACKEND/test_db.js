const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function testInsert() {
    try {
        console.log('Attempting direct insert...');
        const res = await pool.query(
            'INSERT INTO usuarios (nombre, email, rol, contraseña, telefono, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            ['Direct Test', 'direct' + Date.now() + '@test.com', 'TURISTA', 'hashed_pass', '+123456789', '1990-01-01']
        );
        console.log('Insert successful:', res.rows[0]);
    } catch (err) {
        console.error('Insert failed:', err.message);
        if (err.detail) console.log('Detail:', err.detail);
    } finally {
        await pool.end();
    }
}

testInsert();
