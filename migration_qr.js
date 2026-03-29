const db = require('./BACKEND/src/config/database');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE reservas 
            ADD COLUMN IF NOT EXISTS codigo_qr_turista VARCHAR(10) UNIQUE,
            ADD COLUMN IF NOT EXISTS codigo_verificacion_anfitrion VARCHAR(10) UNIQUE,
            ADD COLUMN IF NOT EXISTS estado_qr VARCHAR(20) DEFAULT 'GENERADO';
        `);
        console.log("Migración completada exitosamente.");
        process.exit(0);
    } catch (error) {
        console.error("Error al migrar la base de datos:", error);
        process.exit(1);
    }
}

migrate();
