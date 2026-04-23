const activityRepository = require('../repositories/activityRepository');
const db = require('../config/database');
const { reverseGeocode, isStreetAddress } = require('../utils/geocoding');

const getAllActivities = async (filters = {}) => {
    return await activityRepository.findAll(filters);
};

const getActivitiesByHost = async (hostId) => {
    return await activityRepository.findByHost(hostId);
};

const createActivity = async (activityData) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion,
        pais, ciudad, direccion, latitud, longitud, url_imagen, galeria, provincia,
        punto_encuentro, latitud_encuentro, longitud_encuentro, direccion_encuentro
    } = activityData;

    // 1. Normalización de Ciudad/Provincia automática
    let finalCiudad = ciudad;
    let finalProvincia = provincia;

    if (latitud && longitud && (isStreetAddress(ciudad) || !ciudad)) {
        const normalized = await reverseGeocode(latitud, longitud);
        if (normalized) {
            finalCiudad = normalized.ciudad || ciudad;
            finalProvincia = normalized.provincia || provincia;
            console.log(`[Service] Ubicación normalizada: ${ciudad} -> ${finalCiudad}`);
        }
    }

    const id_ubicacion = await activityRepository.createLocation({
        pais, ciudad: finalCiudad, direccion, latitud, longitud, provincia: finalProvincia
    });

    // 2. Create Activity
    const id_actividad = await activityRepository.createActivity({
        titulo, descripcion, precio, duracion_hours: duracion_horas, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
        porcentaje_ganancia: activityData.porcentaje_ganancia,
        tipo_reserva: activityData.tipo_reserva,
        incluye_recorrido: activityData.incluye_recorrido,
        incluye_transporte: activityData.incluye_transporte,
        requiere_equipo: activityData.requiere_equipo,
        hora_inicio: activityData.hora_inicio,
        hora_fin: activityData.hora_fin,
        dias_disponibles: activityData.dias_disponibles,
        punto_encuentro,
        latitud_encuentro,
        longitud_encuentro,
        direccion_encuentro
    });

    // 3. Create Image Portada
    if (url_imagen) {
        await activityRepository.createImage(id_actividad, url_imagen);
    }

    // 4. Create Gallery Images
    if (galeria && Array.isArray(galeria)) {
        for (const imgUrl of galeria) {
            await activityRepository.createGalleryImage(id_actividad, imgUrl);
        }
    }

    return { id: id_actividad, id_ubicacion };
};

const deleteActivity = async (id, hostId) => {
    // Verify ownership
    const activity = await activityRepository.findById(id);
    if (!activity || activity.id_anfitrion !== hostId) {
        throw new Error('No tienes permiso para eliminar esta experiencia');
    }
    return await activityRepository.deleteActivity(id);
};

const updateActivityStatus = async (id, hostId, status) => {
    // Verify ownership
    const activity = await activityRepository.findById(id);
    if (!activity || activity.id_anfitrion !== hostId) {
        throw new Error('No tienes permiso para modificar esta experiencia');
    }
    return await activityRepository.updateStatus(id, status);
};

const getActivityDetails = async (id, userId = null) => {
    const activity = await activityRepository.findFullById(id);
    if (!activity) return null;

    // Check visibility of punto_encuentro
    let showMeetingPoint = false;

    if (userId) {
        // 1. If user is the host
        if (activity.id_anfitrion == userId) {
            showMeetingPoint = true;
        } else {
            // 2. If user is a tourist with a confirmed payment
            const numericId = id.includes('-') ? id.split('-')[1] : id;
            const type = id.startsWith('T-') ? 'TURISTICA' : 'ALIMENTARIA';
            
            const { rows } = await db.query(
                `SELECT 1 FROM reservas r
                 WHERE r.id_turista = $1 
                   AND r.id_actividad = $2 
                   AND r.tipo_actividad = $3
                   AND r.estado IN ('APROBADA', 'CONFIRMADA', 'COMPLETADA')
                 UNION
                 SELECT 1 FROM reservas r
                 JOIN pagos p ON r.id_reserva = p.id_reserva
                 WHERE r.id_turista = $1 
                   AND r.id_actividad = $2 
                   AND r.tipo_actividad = $3
                   AND p.estado = 'CONFIRMADO'
                 LIMIT 1`,
                [userId, numericId, type]
            );
            
            if (rows.length > 0) {
                showMeetingPoint = true;
            }
        }
    }

    if (!showMeetingPoint) {
        activity.punto_encuentro = null;
        activity.latitud_encuentro = null;
        activity.longitud_encuentro = null;
        activity.direccion_encuentro = null;
    }

    return activity;
};

const updateActivity = async (id, data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        pais, ciudad, direccion, latitud, longitud, url_imagen, galeria, provincia,
        id_ubicacion, punto_encuentro, latitud_encuentro, longitud_encuentro, direccion_encuentro
    } = data;

    // 1. Update Activity
    await activityRepository.updateActivity(id, {
        titulo, descripcion, 
        precio: parseFloat(precio), 
        duracion_horas: parseInt(duracion_horas), 
        capacidad: parseInt(capacidad), 
        nivel_dificultad, 
        id_categoria: parseInt(id_categoria), 
        id_clasificacion: parseInt(id_clasificacion),
        porcentaje_ganancia: parseInt(data.porcentaje_ganancia),
        tipo_reserva: data.tipo_reserva,
        incluye_recorrido: data.incluye_recorrido,
        incluye_transporte: data.incluye_transporte,
        requiere_equipo: data.requiere_equipo,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        dias_disponibles: data.dias_disponibles,
        punto_encuentro,
        latitud_encuentro,
        longitud_encuentro,
        direccion_encuentro
    });

    // 2. Update Location con Normalización
    if (id_ubicacion) {
        let finalCiudad = ciudad;
        let finalProvincia = provincia;

        if (latitud && longitud && (isStreetAddress(ciudad) || !ciudad)) {
            const normalized = await reverseGeocode(latitud, longitud);
            if (normalized) {
                finalCiudad = normalized.ciudad || ciudad;
                finalProvincia = normalized.provincia || provincia;
            }
        }

        await activityRepository.updateLocation(id_ubicacion, {
            pais, ciudad: finalCiudad, direccion, latitud, longitud, provincia: finalProvincia
        });
    }

    // 3. Update Images (Independent updates)
    if (url_imagen) {
        await activityRepository.clearPortada(id);
        await activityRepository.createImage(id, url_imagen);
    }
    
    if (galeria && Array.isArray(galeria)) {
        await activityRepository.clearGallery(id);
        for (const imgUrl of galeria) {
            await activityRepository.createGalleryImage(id, imgUrl);
        }
    }

    return { id };
};

const getActivityAvailability = async (id, date) => {
    const activity = await activityRepository.findById(id);
    if (!activity) throw new Error('Actividad no encontrada');
    const type = id.startsWith('T-') ? 'TURISTICA' : 'ALIMENTARIA';
    return await activityRepository.getAvailability(id, type, date);
};

module.exports = {
    getAllActivities,
    getActivitiesByHost,
    createActivity,
    deleteActivity,
    updateActivityStatus,
    getActivityDetails,
    updateActivity,
    getActivityAvailability
};
