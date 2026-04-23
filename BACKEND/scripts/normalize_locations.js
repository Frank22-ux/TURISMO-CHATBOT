const { Pool } = require('pg');
const { reverseGeocode, isStreetAddress } = require('../src/utils/geocoding');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function normalizeExistingLocations() {
    console.log('--- Iniciando normalización de ubicaciones ---');
    
    try {
        const { rows: locations } = await pool.query('SELECT id_ubicacion, ciudad, provincia, latitud, longitud FROM ubicaciones');
        console.log(`Se encontraron ${locations.length} ubicaciones.`);

        let updatedCount = 0;

        for (const loc of locations) {
            const { id_ubicacion, ciudad, latitud, longitud } = loc;
            
            // Si la ciudad parece una dirección o está vacía, intentar normalizar
            if (isStreetAddress(ciudad) || !ciudad) {
                console.log(`\nRevisando [ID ${id_ubicacion}]: "${ciudad}"`);
                
                if (!latitud || !longitud || parseFloat(latitud) === 0) {
                    console.log('  (!) Sin coordenadas válidas, saltando.');
                    continue;
                }

                const normalized = await reverseGeocode(latitud, longitud);
                
                if (normalized && normalized.ciudad) {
                    console.log(`  (+) Normalizado a: ${normalized.ciudad}, ${normalized.provincia}`);
                    
                    await pool.query(
                        'UPDATE ubicaciones SET ciudad = $1, provincia = $2 WHERE id_ubicacion = $3',
                        [normalized.ciudad, normalized.provincia, id_ubicacion]
                    );
                    updatedCount++;
                    
                    // Pequeña pausa para no saturar la API de Mapbox (aunque el límite es alto)
                    await new Promise(resolve => setTimeout(resolve, 200));
                } else {
                    console.log('  (x) No se pudo obtener datos de Mapbox.');
                }
            }
        }

        console.log(`\n--- Proceso finalizado ---`);
        console.log(`Ubicaciones actualizadas: ${updatedCount}`);

    } catch (error) {
        console.error('Error durante la normalización:', error);
    } finally {
        await pool.end();
    }
}

normalizeExistingLocations();
