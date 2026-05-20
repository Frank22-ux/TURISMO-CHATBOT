require('dotenv').config({ path: './BACKEND/.env' });
const db = require('./BACKEND/src/config/database');

async function updateDb() {
    try {
        console.log('Updating pagos table constraint...');
        await db.query(`ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_estado_check;`);
        await db.query(`ALTER TABLE pagos ADD CONSTRAINT pagos_estado_check CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'DEVUELTO', 'CONGELADO'));`);
        console.log('Database constraint updated successfully.');
    } catch (e) {
        console.error('Error updating DB:', e);
    } finally {
        process.exit(0);
    }
}

updateDb();
