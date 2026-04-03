const db = require('../config/database');

const findAll = async (filters = {}) => {
    const { location, city, province, country, lat, lng, radius, guests, startDate, endDate } = filters;
    let params = [];
    
    // Helper to add param and return its placeholder
    const addParam = (val) => {
        params.push(val);
        return `$${params.length}`;
    };

    let pLocation = location ? addParam(`%${location}%`) : null;
    let pCity = city ? addParam(`%${city}%`) : null;
    let pProvince = province ? addParam(`%${province}%`) : null;
    let pCountry = country ? addParam(`%${country}%`) : null;
    let pLat = lat ? addParam(lat) : null;
    let pLng = lng ? addParam(lng) : null;
    let pRadius = radius ? addParam(radius) : null;
    let pGuests = guests ? addParam(guests) : null;
    let pStartDate = startDate ? addParam(startDate) : null;
    let pEndDate = endDate ? addParam(endDate) : null;

    const buildFilters = (tableAlias, activityType) => {
        let clauses = [];
        
        if (pLocation) {
            clauses.push(`(u.ciudad ILIKE ${pLocation} OR u.pais ILIKE ${pLocation} OR u.provincia ILIKE ${pLocation} OR u.direccion ILIKE ${pLocation})`);
        }

        if (pCity) {
            clauses.push(`u.ciudad ILIKE ${pCity}`);
        }

        if (pProvince) {
            clauses.push(`u.provincia ILIKE ${pProvince}`);
        }

        if (pCountry) {
            clauses.push(`u.pais ILIKE ${pCountry}`);
        }

        if (pLat && pLng && pRadius) {
            clauses.push(`(
                6371 * acos(
                    least(1.0, greatest(-1.0, 
                        cos(radians(${pLat}::numeric)) * cos(radians(u.latitud::numeric)) * 
                        cos(radians(u.longitud::numeric) - radians(${pLng}::numeric)) + 
                        sin(radians(${pLat}::numeric)) * sin(radians(u.latitud::numeric))
                    ))
                )
            ) <= ${pRadius}`);
        }

        if (pGuests) {
            clauses.push(`(${tableAlias}.capacidad >= ${pGuests})`);
        }

        if (pStartDate && pEndDate) {
            clauses.push(`
                NOT EXISTS (
                    SELECT 1 
                    FROM reservas r 
                    WHERE r.id_actividad = ${tableAlias}.id_actividad 
                      AND r.tipo_actividad = '${activityType}'
                      AND r.estado IN ('PENDIENTE', 'CONFIRMADA')
                      AND r.fecha_experiencia BETWEEN ${pStartDate}::date AND ${pEndDate}::date
                    GROUP BY r.fecha_experiencia
                    HAVING SUM(r.cantidad_personas) + COALESCE(${pGuests}::integer, 1) > ${tableAlias}.capacidad
                )
            `);
        }

        return clauses.length > 0 ? ' AND ' + clauses.join(' AND ') : '';
    };

    let distanceSelect = '';
    if (pLat && pLng) {
        distanceSelect = `, (
            6371 * acos(
                least(1.0, greatest(-1.0, 
                    cos(radians(${pLat}::numeric)) * cos(radians(u.latitud::numeric)) * 
                    cos(radians(u.longitud::numeric) - radians(${pLng}::numeric)) + 
                    sin(radians(${pLat}::numeric)) * sin(radians(u.latitud::numeric))
                ))
            )
        ) AS distance`;
    }

    let orderByClause = '';
    if (pLat && pLng) {
        orderByClause = ` ORDER BY distance ASC, avg_rating DESC, vistas DESC`;
    } else {
        orderByClause = ` ORDER BY avg_rating DESC, vistas DESC`;
    }

    let limitClause = '';
    if (filters.limit) {
        let pLimit = addParam(parseInt(filters.limit));
        limitClause = ` LIMIT ${pLimit}`;
    }

    let query = `
        (SELECT 
            'T-' || at.id_actividad as id, 
            at.titulo as title, 
            at.precio as original_price,
            CASE 
                WHEN at.precio_oferta IS NOT NULL AND (at.fecha_fin_oferta IS NULL OR at.fecha_fin_oferta > CURRENT_TIMESTAMP)
                THEN at.precio_oferta 
                ELSE at.precio 
            END as price,
            at.precio_oferta,
            at.fecha_fin_oferta,
            u.ciudad || ', ' || u.pais as location,
            ip.url_imagen as image,
            'TURISTICA' as tipo,
            at.capacidad,
            u.latitud,
            u.longitud,
            at.vistas,
            COALESCE(AVG(v.puntuacion), 0) AS avg_rating,
            u2.nombre as nombre_anfitrion,
            at.id_anfitrion
            ${distanceSelect}
        FROM actividades_turisticas at
        JOIN ubicaciones u ON at.id_ubicacion = u.id_ubicacion
        LEFT JOIN usuarios u2 ON at.id_anfitrion = u2.id_usuario
        LEFT JOIN imagen_portada ip ON at.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'TURISTICA'
        LEFT JOIN valoraciones v ON (v.id_actividad = at.id_actividad AND v.tipo_actividad = 'TURISTICA')
        WHERE at.estado = 'ACTIVA' ${buildFilters('at', 'TURISTICA')}
        GROUP BY at.id_actividad, u.id_ubicacion, ip.url_imagen, u2.nombre, at.id_anfitrion
        ${orderByClause}
        ${limitClause})
        
        UNION ALL
        
        (SELECT 
            'A-' || aa.id_actividad as id, 
            aa.titulo as title, 
            aa.precio as original_price,
            CASE 
                WHEN aa.precio_oferta IS NOT NULL AND (aa.fecha_fin_oferta IS NULL OR aa.fecha_fin_oferta > CURRENT_TIMESTAMP)
                THEN aa.precio_oferta 
                ELSE aa.precio 
            END as price,
            aa.precio_oferta,
            aa.fecha_fin_oferta,
            u.ciudad || ', ' || u.pais as location,
            ip.url_imagen as image,
            'ALIMENTARIA' as tipo,
            aa.capacidad,
            u.latitud,
            u.longitud,
            aa.vistas,
            COALESCE(AVG(v.puntuacion), 0) AS avg_rating,
            u2.nombre as nombre_anfitrion,
            aa.id_anfitrion
            ${distanceSelect}
        FROM actividades_alimentarias aa
        JOIN ubicaciones u ON aa.id_ubicacion = u.id_ubicacion
        LEFT JOIN usuarios u2 ON aa.id_anfitrion = u2.id_usuario
        LEFT JOIN imagen_portada ip ON aa.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'ALIMENTARIA'
        LEFT JOIN valoraciones v ON (v.id_actividad = aa.id_actividad AND v.tipo_actividad = 'ALIMENTARIA')
        WHERE aa.estado = 'ACTIVA' ${buildFilters('aa', 'ALIMENTARIA')}
        GROUP BY aa.id_actividad, u.id_ubicacion, ip.url_imagen, u2.nombre, aa.id_anfitrion
        ${orderByClause}
        ${limitClause})
    `;

    try {
        const { rows } = await db.query(query, params);
        return rows;
    } catch (err) {
        console.error('Error in search query:', err);
        throw err;
    }
};


const findByHost = async (hostId) => {
    const query = `
        SELECT 
            at.*,
            at.id_actividad as id, 
            at.titulo as title, 
            at.precio as price, 
            u.pais, u.ciudad, u.provincia, u.direccion, u.latitud, u.longitud,
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
        hora_inicio, hora_fin, dias_disponibles
    } = activityData;

    const query = `
        INSERT INTO actividades_turisticas (
            titulo, descripcion, precio, duracion_horas, capacidad, 
            nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
            porcentaje_ganancia, tipo_reserva, incluye_recorrido, incluye_transporte, requiere_equipo,
            hora_inicio, hora_fin, dias_disponibles
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id_actividad
    `;
    
    const { rows } = await db.query(query, [
        titulo, descripcion, precio, duracion_hours, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
        activityData.porcentaje_ganancia || 10, 
        activityData.tipo_reserva || 'MANUAL',
        activityData.incluye_recorrido ?? true,
        activityData.incluye_transporte || false,
        activityData.requiere_equipo || false,
        hora_inicio || '08:00:00',
        hora_fin || '18:00:00',
        dias_disponibles || '0,1,2,3,4,5,6'
    ]);
    return rows[0].id_actividad;
};

const createImage = async (activityId, imageUrl) => {
    const query = `
        INSERT INTO imagen_portada (tipo_actividad, id_actividad, url_imagen)
        VALUES ('TURISTICA', $1, $2)
    `;
    await db.query(query, [activityId, imageUrl]);
};

const createGalleryImage = async (activityId, imageUrl) => {
    const query = `
        INSERT INTO imagenes_galeria (tipo_actividad, id_actividad, url_imagen)
        VALUES ('TURISTICA', $1, $2)
    `;
    await db.query(query, [activityId, imageUrl]);
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
                u2.nombre as nombre_anfitrion,
                ip.url_imagen as portada,
                (SELECT json_agg(url_imagen) FROM imagenes_galeria WHERE id_actividad = at.id_actividad AND tipo_actividad = 'TURISTICA') as galeria
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
                u2.nombre as nombre_anfitrion,
                ip.url_imagen as portada,
                (SELECT json_agg(url_imagen) FROM imagenes_galeria WHERE id_actividad = aa.id_actividad AND tipo_actividad = 'ALIMENTARIA') as galeria
            FROM actividades_alimentarias aa
            JOIN ubicaciones u ON aa.id_ubicacion = u.id_ubicacion
            JOIN usuarios u2 ON aa.id_anfitrion = u2.id_usuario
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
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        porcentaje_ganancia, tipo_reserva,
        incluye_recorrido, incluye_transporte, requiere_equipo,
        hora_inicio, hora_fin, dias_disponibles
    } = data;
    const query = `
        UPDATE actividades_turisticas
        SET titulo = $1, descripcion = $2, precio = $3, duracion_horas = $4, 
            capacidad = $5, nivel_dificultad = $6, id_categoria = $7, id_clasificacion = $8,
            porcentaje_ganancia = $9, tipo_reserva = $10,
            incluye_recorrido = $11, incluye_transporte = $12, requiere_equipo = $13,
            precio_oferta = $14, fecha_fin_oferta = $15,
            hora_inicio = $16, hora_fin = $17, dias_disponibles = $18
        WHERE id_actividad = $19
    `;
    await db.query(query, [
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        porcentaje_ganancia, tipo_reserva,
        incluye_recorrido, incluye_transporte, requiere_equipo,
        data.precio_oferta || null,
        data.fecha_fin_oferta || null,
        hora_inicio || '08:00:00',
        hora_fin || '18:00:00',
        dias_disponibles || '0,1,2,3,4,5,6',
        id
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
    await db.query("DELETE FROM imagen_portada WHERE id_actividad = $1 AND tipo_actividad = 'TURISTICA'", [activityId]);
};

const clearGallery = async (activityId) => {
    await db.query("DELETE FROM imagenes_galeria WHERE id_actividad = $1 AND tipo_actividad = 'TURISTICA'", [activityId]);
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
