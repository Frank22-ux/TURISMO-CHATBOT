const serviceRepository = require('../repositories/serviceRepository');

const getServicesByHost = async (hostId) => {
    return await serviceRepository.findByHost(hostId);
};

const getServiceDetails = async (id) => {
    return await serviceRepository.findFullById(id);
};

const createService = async (data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        id_anfitrion, id_categoria,
        pais, ciudad, direccion, latitud, longitud, url_imagen, galeria, provincia,
        menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi,
        servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
        accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
        porcentaje_ganancia, tipo_reserva
    } = data;

    // Parse numeric values to ensure DB compatibility
    const parsedPrecio = parseFloat(precio) || 0;
    const parsedDuracion = parseInt(duracion_horas) || 0;
    const parsedCapacidad = parseInt(capacidad) || 0;
    const parsedCategoria = parseInt(id_categoria);
    const parsedGanancia = parseInt(data.porcentaje_ganancia) || 10;

    // 1. Create Location
    const id_ubicacion = await serviceRepository.createLocation({
        pais, ciudad, direccion, latitud, longitud, provincia
    });

    // 2. Create Service
    const id_actividad = await serviceRepository.createService({
        titulo, descripcion, precio: parsedPrecio, duracion_horas: parsedDuracion, capacidad: parsedCapacidad, 
        id_anfitrion, id_categoria: parsedCategoria, id_ubicacion,
        menu_vegano: !!menu_vegano, menu_vegetariano: !!menu_vegetariano, menu_sin_gluten: !!menu_sin_gluten, permite_mascotas: !!permite_mascotas, wifi: !!wifi,
        servicio_local: !!servicio_local, servicio_para_llevar: !!servicio_para_llevar, servicio_delivery: !!servicio_delivery, nivel_picante: parseInt(nivel_picante) || 0,
        accesibilidad_silla_ruedas: !!accesibilidad_silla_ruedas, accesibilidad_adultos_mayores: !!accesibilidad_adultos_mayores, estacionamiento: !!estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo: !!musica_en_vivo, zona_infantil: !!zona_infantil, eventos_privados: !!eventos_privados,
        porcentaje_ganancia: parsedGanancia,
        tipo_reserva: data.tipo_reserva || 'MANUAL'
    });

    // 3. Create Image Portada
    if (url_imagen) {
        await serviceRepository.createImage(id_actividad, url_imagen);
    }

    // 4. Create Gallery Images
    if (galeria && Array.isArray(galeria)) {
        for (const imgUrl of galeria) {
            await serviceRepository.createGalleryImage(id_actividad, imgUrl);
        }
    }

    return { id: id_actividad, id_ubicacion };
};

const deleteService = async (id, hostId) => {
    const service = await serviceRepository.findById(id);
    if (!service || service.id_anfitrion !== hostId) {
        throw new Error('No tienes permiso para eliminar este servicio');
    }
    return await serviceRepository.deleteService(id);
};

const updateServiceStatus = async (id, hostId, status) => {
    const service = await serviceRepository.findById(id);
    if (!service || service.id_anfitrion !== hostId) {
        throw new Error('No tienes permiso para modificar este servicio');
    }
    return await serviceRepository.updateStatus(id, status);
};

const updateService = async (id, data) => {
    const { 
        titulo, descripcion, precio, duracion_horas, capacidad, 
        id_categoria, pais, ciudad, direccion, latitud, longitud, 
        url_imagen, galeria, provincia, id_ubicacion,
        menu_vegano, menu_vegetariano, menu_sin_gluten, permite_mascotas, wifi,
        servicio_local, servicio_para_llevar, servicio_delivery, nivel_picante,
        accesibilidad_silla_ruedas, accesibilidad_adultos_mayores, estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo, zona_infantil, eventos_privados,
        porcentaje_ganancia, tipo_reserva
    } = data;

    // Parse numeric values to ensure DB compatibility
    const parsedPrecio = Math.max(parseFloat(precio) || 0, 0.01); // CHECK (precio > 0)
    const parsedDuracion = Math.max(parseInt(duracion_horas) || 0, 1); // CHECK (duracion_horas > 0)
    const parsedCapacidad = Math.max(parseInt(capacidad) || 0, 1); // CHECK (capacidad > 0)
    const parsedCategoria = parseInt(id_categoria);
    const parsedPicante = parseInt(nivel_picante) || 0;
    const parsedGanancia = Math.max(parseInt(porcentaje_ganancia) || 10, 1); // CHECK (porcentaje_ganancia >= 1)

    console.log('SERVICE LAYER: Updating service with data:', { id, parsedPrecio, parsedDuracion, parsedCapacidad });

    // 1. Update Service
    await serviceRepository.updateService(id, {
        titulo, descripcion, precio: parsedPrecio, duracion_horas: parsedDuracion, capacidad: parsedCapacidad, id_categoria: parsedCategoria,
        menu_vegano: !!menu_vegano, menu_vegetariano: !!menu_vegetariano, menu_sin_gluten: !!menu_sin_gluten, permite_mascotas: !!permite_mascotas, wifi: !!wifi,
        servicio_local: !!servicio_local, servicio_para_llevar: !!servicio_para_llevar, servicio_delivery: !!servicio_delivery, nivel_picante: parsedPicante,
        accesibilidad_silla_ruedas: !!accesibilidad_silla_ruedas, accesibilidad_adultos_mayores: !!accesibilidad_adultos_mayores, estacionamiento: !!estacionamiento,
        metodos_pago, descuentos_promociones, musica_en_vivo: !!musica_en_vivo, zona_infantil: !!zona_infantil, eventos_privados: !!eventos_privados,
        porcentaje_ganancia: parsedGanancia,
        tipo_reserva: tipo_reserva || 'MANUAL'
    });

    // 2. Update Location
    if (id_ubicacion) {
        await serviceRepository.updateLocation(id_ubicacion, {
            pais, ciudad, direccion, latitud, longitud, provincia
        });
    }

    // 3. Update Images
    if (url_imagen) {
        await serviceRepository.clearPortada(id);
        await serviceRepository.createImage(id, url_imagen);
    }
    
    if (galeria && Array.isArray(galeria)) {
        await serviceRepository.clearGallery(id);
        for (const imgUrl of galeria) {
            await serviceRepository.createGalleryImage(id, imgUrl);
        }
    }

    return { id };
};

module.exports = {
    getServicesByHost,
    getServiceDetails,
    createService,
    deleteService,
    updateServiceStatus,
    updateService
};
