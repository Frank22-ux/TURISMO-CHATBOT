require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
pool.query("UPDATE perfil_anfitrion SET url_documento_legal_frontal = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'")
  .then(()=>console.log('Update Complete'))
  .catch(console.error)
  .finally(()=>pool.end());
