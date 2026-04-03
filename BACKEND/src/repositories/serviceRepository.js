const db = require('../config/database');

const findByHost = async (hostId) => {
    const query = `
        SELECT 
            aa.id_actividad, 
            aa.titulo, 
            aa.precio, 
            aa.estado,
            u.ciudad,
            u.provincia,
            u.pais,
            ip.url_imagen as portada
        FROM actividades_alimentarias aa
        JOIN ubicaciones u ON aa.id_ubicacion = u.id_ubicacion
        LEFT JOIN imagen_portada ip ON aa.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'ALIMENTARIA'
        WHERE aa.id_anfitrion = $1
        ORDER BY aa.fecha_creacion DESC
    `;
    const { rows } = await db.query(query, [hostId]);
    return rows;
};

const findFullById = async (id) => {
    const query = `
        SELECT 
            aa.*, 
            u.pais, u.ciudad, u.direccion, u.latitud, u.longitud, u.provincia,
            ip.url_imagen as portada,
            (SELECT json_agg(url_imagen) FROM imagenes_galeria WHERE id_actividad = aa.id_actividad AND tipo_actividad = 'ALIMENTARIA') as galeria
        FROM actividades_alimentarias aa
        JOIN ubicaciones u ON aa.id_ubicacion = u.id_ubicacion
        LEFT JOIN imagen_portada ip ON aa.id_actividad = ip.id_actividad AND ip.tipo_actividad = 'ALIMENTARIA'
        WHERE aa.id_actividad = $1
    `;
    try {
        const { rows } = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        console.error('DATABASE ERROR in findFullById:', error);
        throw error;
    }
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

const createService = async (data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        id_anfitrion, id_categoria, id_ubicacion,
        menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi,
        servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
        accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
        hora_inicio, hora_fin, dias_disponibles
    } = data;

    const query = `
        INSERT INTO actividades_alimentarias (
            titulo, descripcion, precio, duracion_horas, capacidad, 
            id_anfitrion, id_categoria, id_ubicacion,
            menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi,
            servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
            accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
            metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
            porcentaje_ganancia, tipo_reserva,
            hora_inicio, hora_fin, dias_disponibles
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
        RETURNING id_actividad
    `;
    
    const { rows } = await db.query(query, [
        titulo, descripcion, precio, duracion_horas, capacidad, 
        id_anfitrion, id_categoria, id_ubicacion,
        menu_vegano || false, menu_vegetariano || false, menu_sin_gluten || false, 
        permite_mascotas || false, wifi || false,
        servicio_local ?? true, servicio_para_llevar || false, servicio_delivery || false,
        nivel_picante || 0, accesibilidad_silla_ruedas || false, 
        accesibilidad_adultos_mayores || false, estacionamiento || false,
        metodos_pago || '', descuentos_promociones || '', 
        musica_en_vivo || false, zona_infantil || false, eventos_privados || false,
        data.porcentaje_ganancia || 10, data.tipo_reserva || 'MANUAL',
        hora_inicio || '08:00:00',
        hora_fin || '18:00:00',
        dias_disponibles || '0,1,2,3,4,5,6'
    ]);
    return rows[0].id_actividad;
};

const createImage = async (serviceId, imageUrl) => {
    const query = `
        INSERT INTO imagen_portada (tipo_actividad, id_actividad, url_imagen)
        VALUES ('ALIMENTARIA', $1, $2)
    `;
    await db.query(query, [serviceId, imageUrl]);
};

const createGalleryImage = async (serviceId, imageUrl) => {
    const query = `
        INSERT INTO imagenes_galeria (tipo_actividad, id_actividad, url_imagen)
        VALUES ('ALIMENTARIA', $1, $2)
    `;
    await db.query(query, [serviceId, imageUrl]);
};

const findById = async (id) => {
    const { rows } = await db.query('SELECT * FROM actividades_alimentarias WHERE id_actividad = $1', [id]);
    return rows[0];
};

const deleteService = async (id) => {
    await db.query('DELETE FROM actividades_alimentarias WHERE id_actividad = $1', [id]);
};

const updateStatus = async (id, status) => {
    await db.query('UPDATE actividades_alimentarias SET estado = $1 WHERE id_actividad = $2', [status, id]);
};

const updateService = async (id, data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        id_categoria, menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi,
        servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
        accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
        porcentaje_ganancia, tipo_reserva,
        hora_inicio, hora_fin, dias_disponibles
    } = data;
    const query = `
        UPDATE actividades_alimentarias
        SET titulo = $1, descripcion = $2, precio = $3, duracion_horas = $4, 
            capacidad = $5, id_categoria = $6, menu_vegano = $7, menu_vegetariano = $8,
            menu_sin_gluten = $9, permite_mascotas = $10, wifi = $11,
            servicio_local = $13, servicio_para_llevar = $14, servicio_delivery = $15,
            nivel_picante = $16, accesibilidad_silla_ruedas = $17, 
            accesibilidad_adultos_mayores = $18, estacionamiento = $19,
            metodos_pago = $20, descuentos_promociones = $21,
            musica_en_vivo = $22, zona_infantil = $23, eventos_privados = $24,
            porcentaje_ganancia = $25, tipo_reserva = $26,
            precio_oferta = $27, fecha_fin_oferta = $28,
            hora_inicio = $29, hora_fin = $30, dias_disponibles = $31
        WHERE id_actividad = $12
    `;
    try {
        await db.query(query, [
            titulo, descripcion, precio, duracion_horas, capacidad, id_categoria,
            menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi, id,
            servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
            accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
            metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
            porcentaje_ganancia, tipo_reserva,
            data.precio_oferta || null,
            data.fecha_fin_oferta || null,
            hora_inicio || '08:00:00',
            hora_fin || '18:00:00',
            dias_disponibles || '0,1,2,3,4,5,6'
        ]);
    } catch (error) {
        console.error('DATABASE ERROR in updateService:', error);
        throw error;
    }
};

const updateLocation = async (id, data) => {
    const { pais, ciudad, direccion, latitud, longitud, provincia } = data;
    const query = `
        UPDATE ubicaciones
        SET pais = $1, ciudad = $2, direccion = $3, latitud = $4, longitud = $5, provincia = $6
        WHERE id_ubicacion = $7
    `;
    try {
        await db.query(query, [pais, ciudad, direccion, latitud, longitud, provincia, id]);
    } catch (error) {
        console.error('DATABASE ERROR in updateLocation:', error);
        throw error;
    }
};

const clearPortada = async (serviceId) => {
    await db.query("DELETE FROM imagen_portada WHERE id_actividad = $1 AND tipo_actividad = 'ALIMENTARIA'", [serviceId]);
};

const clearGallery = async (serviceId) => {
    await db.query("DELETE FROM imagenes_galeria WHERE id_actividad = $1 AND tipo_actividad = 'ALIMENTARIA'", [serviceId]);
};

module.exports = {
    findByHost,
    findFullById,
    createLocation,
    createService,
    createImage,
    createGalleryImage,
    findById,
    deleteService,
    updateStatus,
    updateService,
    updateLocation,
    clearPortada,
    clearGallery
};
