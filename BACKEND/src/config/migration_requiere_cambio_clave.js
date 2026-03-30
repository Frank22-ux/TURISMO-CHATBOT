const db = require('./database');

async function migrate() {
    try {
        console.log('Iniciando migración: Agregar columna requiere_cambio_clave...');
        
        // 1. Agregar la columna
        await db.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS requiere_cambio_clave BOOLEAN DEFAULT false;
        `);
        console.log('Columna requiere_cambio_clave añadida (o ya existía).');

        console.log('Migración completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
