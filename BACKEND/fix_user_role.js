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

async function updateRole() {
  try {
    const email = 'jose22.quezada@gmail.com';
    console.log(`Updating role for ${email} to ANFITRION...`);
    
    // Update role
    const res = await pool.query(
      "UPDATE usuarios SET rol = 'ANFITRION' WHERE email = $1 RETURNING id_usuario",
      [email]
    );

    if (res.rowCount > 0) {
      const userId = res.rows[0].id_usuario;
      console.log(`Role updated successfully for user ID: ${userId}`);
      
      // Ensure profile exists
      const profileCheck = await pool.query('SELECT 1 FROM perfil_anfitrion WHERE id_anfitrion = $1', [userId]);
      if (profileCheck.rowCount === 0) {
        console.log('Creating missing host profile...');
        await pool.query('INSERT INTO perfil_anfitrion (id_anfitrion) VALUES ($1)', [userId]);
        console.log('Profile created.');
      }
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error updating role:', err);
  } finally {
    await pool.end();
  }
}

updateRole();
