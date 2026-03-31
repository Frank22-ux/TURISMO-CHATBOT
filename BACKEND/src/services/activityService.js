const activityRepository = require('../repositories/activityRepository');

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
        pais, ciudad, direccion, latitud, longitud, url_imagen, galeria, provincia
    } = activityData;

    // 1. Create Location
    const id_ubicacion = await activityRepository.createLocation({
        pais, ciudad, direccion, latitud, longitud, provincia
    });

    // 2. Create Activity
    const id_actividad = await activityRepository.createActivity({
        titulo, descripcion, precio, duracion_hours: duracion_horas, capacidad, 
        nivel_dificultad, id_anfitrion, id_categoria, id_clasificacion, id_ubicacion,
        porcentaje_ganancia: activityData.porcentaje_ganancia,
        tipo_reserva: activityData.tipo_reserva,
        incluye_recorrido: activityData.incluye_recorrido,
        incluye_transporte: activityData.incluye_transporte,
        requiere_equipo: activityData.requiere_equipo
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

const getActivityDetails = async (id) => {
    return await activityRepository.findFullById(id);
};

const updateActivity = async (id, data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        nivel_dificultad, id_categoria, id_clasificacion,
        pais, ciudad, direccion, latitud, longitud, url_imagen, galeria, provincia,
        id_ubicacion
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
        requiere_equipo: data.requiere_equipo
    });

    // 2. Update Location
    if (id_ubicacion) {
        await activityRepository.updateLocation(id_ubicacion, {
            pais, ciudad, direccion, latitud, longitud, provincia
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
