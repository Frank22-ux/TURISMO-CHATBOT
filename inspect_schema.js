const db = require('./BACKEND/src/config/database');
const fs = require('fs');

async function inspect() {
  try {
    const res = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('ubicaciones', 'reservas')
    `);
    fs.writeFileSync('schema_output2.json', JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
