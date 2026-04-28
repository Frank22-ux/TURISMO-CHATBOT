const db = require('../config/database');

const findAll = async (filters = {}) => {
    const { location, city, province, country, lat, lng, radius, guests, startDate, endDate, limit } = filters;
    let params = [];
    
    const addParam = (val) => {
        params.push(val);
        return `$${params.length}`;
    };

    // =============================================
    // LOGS DE DEPURACIÓN OBLIGATORIOS (PASO A PASO)
    // =============================================
    try {
        const rawCount = await db.query("SELECT (SELECT COUNT(*) FROM actividades_turisticas) + (SELECT COUNT(*) FROM actividades_alimentarias) as total_raw");
        console.log(`[Debug-1] Total en DB (sin filtros): ${rawCount.rows[0].total_raw}`);

        const joinedCount = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM actividades_turisticas at WHERE at.estado = 'ACTIVA') as tur_activas,
                (SELECT COUNT(*) FROM actividades_alimentarias aa WHERE aa.estado = 'ACTIVA') as ali_activas
        `);
        console.log(`[Debug-2] Activas en DB: TUR=${joinedCount.rows[0].tur_activas}, ALI=${joinedCount.rows[0].ali_activas}`);
    } catch (e) {
        console.warn("[Debug] Error en conteos previos:", e.message);
    }

    console.log(`[Search-Params]`, { lat, lng, radius, city, province, type: filters.type, limit });

    const pLat = (lat && !isNaN(parseFloat(lat)) && parseFloat(lat) !== 0) ? addParam(parseFloat(lat)) : null;
    const pLng = (lng && !isNaN(parseFloat(lng)) && parseFloat(lng) !== 0) ? addParam(parseFloat(lng)) : null;
    const pRadius = (radius && !isNaN(parseFloat(radius)) && parseFloat(radius) > 0) ? addParam(parseFloat(radius)) : null;
    
    // Validar guests para evitar NaN y usarlo como literal seguro en el SQL
    let safeGuests = parseInt(guests);
    if (isNaN(safeGuests) || safeGuests < 1) safeGuests = 1;

    const pStartDate = startDate ? addParam(startDate) : null;
    const pEndDate = endDate ? addParam(endDate) : null;
    const pLocation = location ? addParam(`%${location}%`) : null;
    const pCity = city ? addParam(`%${city}%`) : null;
    const pProvince = province ? addParam(`%${province}%`) : null;
    const pCountry = country ? addParam(`%${country}%`) : null;
    const pType = filters.type ? addParam(filters.type) : null;

    // Fórmula Haversine robusta
    let distanceFormula = '0.0';
    if (pLat && pLng) {
        distanceFormula = `(
            6371 * acos(
                LEAST(GREATEST(
                    cos(radians(${pLat})) * cos(radians(u.latitud)) *
                    cos(radians(u.longitud) - radians(${pLng})) +
                    sin(radians(${pLat})) * sin(radians(u.latitud)),
                -1), 1)
            )
        )`;
    }

    const buildAvailabilityCheck = (tableAlias, type) => {
        if (!startDate || !endDate) return 'TRUE::boolean'; 
        return `
            NOT EXISTS (
                SELECT 1 
                FROM reservas r 
                WHERE r.id_actividad = ${tableAlias}.id_actividad 
                  AND r.tipo_actividad = '${type}'
                  AND r.estado IN ('PENDIENTE', 'APROBADA', 'CONFIRMADA')
                  AND r.fecha_experiencia BETWEEN ${pStartDate}::date AND ${pEndDate}::date
                GROUP BY r.fecha_experiencia
                HAVING SUM(r.cantidad_personas) + ${safeGuests} > ${tableAlias}.capacidad
            )
        `;
    };

    let query = `
        WITH BaseActivities AS (
            SELECT 
                'TURISTICA'::text as tipo, at.id_actividad, 'T-' || at.id_actividad as id,
                at.titulo as title, at.precio as original_price,
                CASE 
                    WHEN at.precio_oferta IS NOT NULL AND (at.fecha_fin_oferta IS NULL OR at.fecha_fin_oferta > CURRENT_TIMESTAMP)
                    THEN at.precio_oferta 
                    ELSE at.precio 
                END as price,
                at.precio_oferta, at.fecha_fin_oferta,
                at.capacidad, at.vistas, at.estado, at.id_anfitrion, at.id_ubicacion,
                ${buildAvailabilityCheck('at', 'TURISTICA')} as is_available
            FROM actividades_turisticas at
            WHERE at.estado = 'ACTIVA'
            
            UNION ALL
            
            SELECT 
                'ALIMENTARIA'::text as tipo, aa.id_actividad, 'A-' || aa.id_actividad as id,
                aa.titulo as title, aa.precio as original_price,
                CASE 
                    WHEN aa.precio_oferta IS NOT NULL AND (aa.fecha_fin_oferta IS NULL OR aa.fecha_fin_oferta > CURRENT_TIMESTAMP)
                    THEN aa.precio_oferta 
                    ELSE aa.precio 
                END as price,
                aa.precio_oferta, aa.fecha_fin_oferta,
                aa.capacidad, aa.vistas, aa.estado, aa.id_anfitrion, aa.id_ubicacion,
                ${buildAvailabilityCheck('aa', 'ALIMENTARIA')} as is_available
            FROM actividades_alimentarias aa
            WHERE aa.estado = 'ACTIVA'
        )
        SELECT 
            ba.*,
            COALESCE(u.ciudad, 'Sin ciudad') || ', ' || COALESCE(u.pais, 'Sin país') as location,
            u.ciudad, u.provincia, u.pais, u.direccion, u.latitud, u.longitud,
            ip.url_imagen as image,
            us.nombre as nombre_anfitrion,
            (SELECT COALESCE(AVG(v.puntuacion), 0) FROM valoraciones v WHERE v.id_actividad = ba.id_actividad AND v.tipo_actividad = ba.tipo) as avg_rating,
            CAST(${distanceFormula} AS FLOAT) as distance
        FROM BaseActivities ba
        LEFT JOIN ubicaciones u ON ba.id_ubicacion = u.id_ubicacion
        LEFT JOIN usuarios us ON ba.id_anfitrion = us.id_usuario
        LEFT JOIN imagen_portada ip ON ba.id_actividad = ip.id_actividad AND ba.tipo = ip.tipo_actividad
        WHERE ba.is_available = TRUE
    `;

    // Filtros dinámicos con cast explícito para evitar error 42P18
    if (pType) query += ` AND ba.tipo = ${pType}::text`;
    if (safeGuests > 1) query += ` AND ba.capacidad >= ${safeGuests}`;
    if (pCity) query += ` AND u.ciudad ILIKE ${pCity}::text`;
    if (pProvince) query += ` AND u.provincia ILIKE ${pProvince}::text`;
    if (pCountry) query += ` AND u.pais ILIKE ${pCountry}::text`;
    if (pLocation) query += ` AND (u.ciudad ILIKE ${pLocation}::text OR u.pais ILIKE ${pLocation}::text OR ba.title ILIKE ${pLocation}::text)`;

    if (pRadius && pLat && pLng) {
        query += ` AND (${distanceFormula} <= ${pRadius}::float + 0.5)`;
    }

    if (pLat && pLng) {
        query += ` ORDER BY distance ASC NULLS LAST`;
    } else {
        query += ` ORDER BY ba.vistas DESC, ba.id_actividad DESC`;
    }

    if (limit) {
        let limitValue = parseInt(limit);
        if (!isNaN(limitValue) && limitValue > 0) {
            const pLimit = addParam(limitValue);
            query += ` LIMIT ${pLimit}`;
        }
    }

    try {
        console.log(`[Database-Query] SQL:`, query.substring(0, 500) + '...');
        const { rows } = await db.query(query, params);
        console.log(`[Debug-4] Recibidos ${rows.length} resultados`);
        return rows;
    } catch (err) {
        console.error('[Database-Error] Query fallida:', err.message);
        throw err;
    }
};


const findByHost = async (hostId) => {
    const query = `
        SELECT 
            at.*,
            'T-' || at.id_actividad as id, 
            at.titulo as title, 
            at.precio as price, 
            u.pais, u.ciudad, u.provincia, u.direccion, u.latitud, u.longitud,
            at.punto_encuentro,
            u.ciudad || ', ' || COALESCE(u.provincia, '') || ', ' || u.pais as location,
            ip.url_imagen as image
        FROM actividades_turisticas at
        JOIN ubicaciones u ON at.id_ubicacion = u.id_ubicacion
        LEFT JOIN imagen_portada ip ON at.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'TURISTICA'
        WHERE at.id_anfitrion = $1
        ORDER BY at.fecha_creacion DESC
    `;
    const { rows } = await db.query(query, [hostId]);
    return rows;
};

const createLocation = async (locationData) => {
    const { pais, ciudad, direccion, latitud, longitud, provincia } = locationData;
    const query = `
        INSERT INTO ubicaciones (pais, ciudad, direccion, latitud, longitud, provincia)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_ubicacion
    `;
    const { rows } = await db.query(query, [pais, ciudad, direccion, latitud || 0, longitud || 0, provincia || '']);
    return rows[0].id_ubicacion;
};

const createActivity = async (activityData) => {
    const { 
        titulo, descripcion, precio, duracion_hours, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
        hora_inicio, hora_fin, dias_disponibles, punto_encuentro, direccion_encuentro
    } = activityData;

    const query = `
        INSERT INTO actividades_turisticas (
            titulo, descripcion, precio, duracion_horas, capacidad, 
            nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
            porcentaje_ganancia, incluye_recorrido, incluye_transporte, requiere_equipo,
            hora_inicio, hora_fin, dias_disponibles, punto_encuentro,
            latitud_encuentro, longitud_encuentro, direccion_encuentro
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id_actividad
    `;
    
    const { rows } = await db.query(query, [
        titulo, descripcion, precio, duracion_hours, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
        activityData.porcentaje_ganancia || 10, 
        activityData.incluye_recorrido ?? true,
        activityData.incluye_transporte || false,
        activityData.requiere_equipo || false,
        hora_inicio || '08:00:00',
        hora_fin || '18:00:00',
        dias_disponibles || '0,1,2,3,4,5,6',
        punto_encuentro || null,
        activityData.latitud_encuentro || null,
        activityData.longitud_encuentro || null,
        direccion_encuentro || null
    ]);
    return rows[0].id_actividad;
};

const createImage = async (activityId, imageUrl) => {
    const numericId = typeof activityId === 'string' && activityId.includes('-') ? activityId.split('-')[1] : activityId;
    const query = `
        INSERT INTO imagen_portada (tipo_actividad, id_actividad, url_imagen)
        VALUES ('TURISTICA', $1, $2)
    `;
    await db.query(query, [numericId, imageUrl]);
};

const createGalleryImage = async (activityId, imageUrl) => {
    const numericId = typeof activityId === 'string' && activityId.includes('-') ? activityId.split('-')[1] : activityId;
    const query = `
        INSERT INTO imagenes_galeria (tipo_actividad, id_actividad, url_imagen)
        VALUES ('TURISTICA', $1, $2)
    `;
    await db.query(query, [numericId, imageUrl]);
};

const findFullById = async (id) => {
    const isTuristica = id.startsWith('T-');
    const isAlimentaria = id.startsWith('A-');
    const numericId = id.split('-')[1];

    if (isTuristica) {
        const query = `
            SELECT 
                at.*, 
                at.precio as original_price,
                CASE 
                    WHEN at.precio_oferta IS NOT NULL AND (at.fecha_fin_oferta IS NULL OR at.fecha_fin_oferta > CURRENT_TIMESTAMP)
                    THEN at.precio_oferta 
                    ELSE at.precio 
                END as price,
                at.titulo as title,
                'T-' || at.id_actividad as id,
                'TURISTICA' as tipo,
                u.pais, u.ciudad, u.direccion, u.latitud, u.longitud, u.provincia,
                u.ciudad || ', ' || COALESCE(u.provincia, '') || ', ' || u.pais as location,
                at.punto_encuentro, at.latitud_encuentro, at.longitud_encuentro,
                u2.nombre as nombre_anfitrion,
                ip.url_imagen as portada,
                (SELECT json_agg(url_imagen) FROM imagenes_galeria WHERE id_actividad = at.id_actividad AND tipo_actividad = 'TURISTICA') as galeria,
                COALESCE((SELECT AVG(puntuacion) FROM valoraciones WHERE id_actividad = at.id_actividad AND tipo_actividad = 'TURISTICA'), 0) as avg_rating
            FROM actividades_turisticas at
            JOIN ubicaciones u ON at.id_ubicacion = u.id_ubicacion
            LEFT JOIN usuarios u2 ON at.id_anfitrion = u2.id_usuario
            LEFT JOIN imagen_portada ip ON at.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'TURISTICA'
            WHERE at.id_actividad = $1
        `;
        const { rows } = await db.query(query, [numericId]);
        return rows[0];
    } else if (isAlimentaria) {
        const query = `
            SELECT 
                aa.*, 
                aa.precio as original_price,
                CASE 
                    WHEN aa.precio_oferta IS NOT NULL AND (aa.fecha_fin_oferta IS NULL OR aa.fecha_fin_oferta > CURRENT_TIMESTAMP)
                    THEN aa.precio_oferta 
                    ELSE aa.precio 
                END as price,
                aa.titulo as title,
                'A-' || aa.id_actividad as id,
                'ALIMENTARIA' as tipo,
                u.pais, u.ciudad, u.direccion, u.latitud, u.longitud, u.provincia,
                u.ciudad || ', ' || COALESCE(u.provincia, '') || ', ' || u.pais as location,
                aa.punto_encuentro, aa.latitud_encuentro, aa.longitud_encuentro,
                u2.nombre as nombre_anfitrion,
                ip.url_imagen as portada,
                (SELECT json_agg(url_imagen) FROM imagenes_galeria WHERE id_actividad = aa.id_actividad AND tipo_actividad = 'ALIMENTARIA') as galeria,
                COALESCE((SELECT AVG(puntuacion) FROM valoraciones WHERE id_actividad = aa.id_actividad AND tipo_actividad = 'ALIMENTARIA'), 0) as avg_rating
            FROM actividades_alimentarias aa
            JOIN ubicaciones u ON aa.id_ubicacion = u.id_ubicacion
            LEFT JOIN usuarios u2 ON aa.id_anfitrion = u2.id_usuario
            LEFT JOIN imagen_portada ip ON aa.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'ALIMENTARIA'
            WHERE aa.id_actividad = $1
        `;
        const { rows } = await db.query(query, [numericId]);
        return rows[0];
    }
    
    // Fallback for legacy numeric IDs (assume TURISTICA)
    const { rows } = await db.query('SELECT * FROM actividades_turisticas WHERE id_actividad = $1', [id]);
    return rows[0];
};

const findById = async (id) => {
    const numericId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id;
    const { rows } = await db.query('SELECT * FROM actividades_turisticas WHERE id_actividad = $1', [numericId]);
    return rows[0];
};

const deleteActivity = async (id) => {
    const numericId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id;
    await db.query('DELETE FROM actividades_turisticas WHERE id_actividad = $1', [numericId]);
};

const updateStatus = async (id, status) => {
    const numericId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id;
    await db.query('UPDATE actividades_turisticas SET estado = $1 WHERE id_actividad = $2', [status, numericId]);
};

const updateActivity = async (id, data) => {
    const numericId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id;
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        porcentaje_ganancia, tipo_reserva,
        incluye_recorrido, incluye_transporte, requiere_equipo,
        hora_inicio, hora_fin, dias_disponibles, punto_encuentro,
        latitud_encuentro, longitud_encuentro, direccion_encuentro
    } = data;
    const query = `
        UPDATE actividades_turisticas
        SET titulo = $1, descripcion = $2, precio = $3, duracion_horas = $4, 
            capacidad = $5, nivel_dificultad = $6, id_categoria = $7, id_clasificacion = $8,
            porcentaje_ganancia = $9, 
            incluye_recorrido = $10, incluye_transporte = $11, requiere_equipo = $12,
            precio_oferta = $13, fecha_fin_oferta = $14,
            hora_inicio = $15, hora_fin = $16, dias_disponibles = $17,
            punto_encuentro = $18, latitud_encuentro = $19, longitud_encuentro = $20, direccion_encuentro = $21
        WHERE id_actividad = $22
    `;
    await db.query(query, [
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        porcentaje_ganancia,
        incluye_recorrido, incluye_transporte, requiere_equipo,
        data.precio_oferta || null,
        data.fecha_fin_oferta || null,
        hora_inicio || '08:00:00',
        hora_fin || '18:00:00',
        dias_disponibles || '0,1,2,3,4,5,6',
        punto_encuentro || null,
        data.latitud_encuentro || null,
        data.longitud_encuentro || null,
        direccion_encuentro || null,
        numericId
    ]);
};

const updateLocation = async (id, data) => {
    const { pais, ciudad, direccion, latitud, longitud, provincia } = data;
    const query = `
        UPDATE ubicaciones
        SET pais = $1, ciudad = $2, direccion = $3, latitud = $4, longitud = $5, provincia = $6
        WHERE id_ubicacion = $7
    `;
    await db.query(query, [pais, ciudad, direccion, latitud, longitud, provincia, id]);
};

const clearPortada = async (activityId) => {
    const numericId = typeof activityId === 'string' && activityId.includes('-') ? activityId.split('-')[1] : activityId;
    await db.query("DELETE FROM imagen_portada WHERE id_actividad = $1 AND tipo_actividad = 'TURISTICA'", [numericId]);
};

const clearGallery = async (activityId) => {
    const numericId = typeof activityId === 'string' && activityId.includes('-') ? activityId.split('-')[1] : activityId;
    await db.query("DELETE FROM imagenes_galeria WHERE id_actividad = $1 AND tipo_actividad = 'TURISTICA'", [numericId]);
};

const updateBulkOffers = async (ids, type, offerPrice, expirationDate, percentage) => {
    const table = type === 'EXPERIENCE' ? 'actividades_turisticas' : 'actividades_alimentarias';
    let query;
    let params;

    if (offerPrice && offerPrice > 0) {
        query = `
            UPDATE ${table}
            SET precio_oferta = $1,
                fecha_fin_oferta = $2
            WHERE id_actividad = ANY($3)
        `;
        params = [offerPrice, expirationDate, ids];
    } else {
        query = `
            UPDATE ${table}
            SET precio_oferta = ROUND(precio * (1 - $1/100.0), 2),
                fecha_fin_oferta = $2
            WHERE id_actividad = ANY($3)
        `;
        params = [percentage || 0, expirationDate, ids];
    }
    await db.query(query, params);
};

const getAvailability = async (id, type, date) => {
    const numericId = id.includes('-') ? id.split('-')[1] : id;
    const table = type === 'TURISTICA' ? 'actividades_turisticas' : 'actividades_alimentarias';

    // 1. Get max capacity
    const { rows: actRows } = await db.query(`SELECT capacidad FROM ${table} WHERE id_actividad = $1`, [numericId]);
    if (actRows.length === 0) return 0;
    const maxCapacity = actRows[0].capacidad;

    // 2. Sum existing reservations for that date
    const { rows: resRows } = await db.query(
        `SELECT SUM(cantidad_personas) as reserved 
         FROM reservas 
         WHERE id_actividad = $1 
           AND tipo_actividad = $2 
           AND fecha_experiencia = $3 
           AND estado IN ('PENDIENTE', 'APROBADA', 'CONFIRMADA')`,
        [numericId, type, date]
    );

    const reserved = parseInt(resRows[0].reserved) || 0;
    const remaining = Math.max(0, maxCapacity - reserved);
    return remaining;
};

module.exports = {
    findAll,
    findByHost,
    findById,
    findFullById,
    createLocation,
    createActivity,
    createImage,
    createGalleryImage,
    deleteActivity,
    updateStatus,
    updateActivity,
    updateLocation,
    clearPortada,
    clearGallery,
    updateBulkOffers,
    getAvailability
};
