const db = require('./BACKEND/src/config/database');

async function test() {
  const id = 'T-1';
  const isTuristica = id.startsWith('T-');
  const numericId = id.split('-')[1];
  console.log({ id, isTuristica, numericId });
  
  try {
    const res = await db.query('SELECT * FROM actividades_turisticas WHERE id_actividad = $1', [numericId]);
    console.log("SUCCESS=" + res.rows.length);
  } catch (err) {
    console.error("FAIL=" + err.message);
  }
  process.exit(0);
}

test();
