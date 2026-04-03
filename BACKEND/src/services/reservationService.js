const reservationRepository = require('../repositories/reservationRepository');
const activityRepository = require('../repositories/activityRepository');
const paymentService = require('./paymentService');
const messageRepository = require('../repositories/messageRepository');

const getHostReservations = async (id_anfitrion) => {
    return await reservationRepository.findReservationsByHostId(id_anfitrion);
};

const updateStatus = async (id_reserva, estado) => {
    return await reservationRepository.updateReservationStatus(id_reserva, estado);
};

const createReservation = async (data, paymentToken) => {
    const { id_actividad, id_turista, fecha_experiencia, cantidad_personas, cantidad_adultos, cantidad_ninos, cantidad_tercera_edad, total } = data;

    // 1. Obtener detalles de la actividad para calcular comisiones
    const activity = await activityRepository.findFullById(id_actividad);
    if (!activity) throw new Error('Actividad no encontrada');

    const porcentaje = activity.porcentaje_ganancia || 10;
    const monto_plataforma = (total * porcentaje) / 100;
    const monto_anfitrion = total - monto_plataforma;

    // 2. Procesar el cobro con Kushki
    const paymentResponse = await paymentService.processCharge(paymentToken, total, {
        id_actividad,
        id_turista,
        fecha_experiencia
    });

    if (!paymentResponse.success) {
        throw new Error(paymentResponse.error);
    }

    // Generar códigos alfanuméricos de 10 caracteres
    const generateCode = () => Math.random().toString(36).substring(2, 12).toUpperCase();
    const codigo_qr_turista = generateCode();
    const codigo_verificacion_anfitrion = generateCode();

    // 3. Crear la reserva en la DB
    const reservation = await reservationRepository.createReservation({
        tipo_actividad: activity.tipo,
        id_actividad: activity.id_actividad,
        id_turista,
        fecha_experiencia,
        cantidad_personas,
        cantidad_adultos,
        cantidad_ninos,
        cantidad_tercera_edad,
        total,
        descuento_aplicado: data.descuento_aplicado || 0,
        estado: 'APROBADA', // Al ser pago inmediato, la aprobamos
        codigo_qr_turista,
        codigo_verificacion_anfitrion
    });

    // 4. Registrar el pago
    await reservationRepository.createPayment({
        id_reserva: reservation.id_reserva,
        monto_total: total,
        monto_anfitrion,
        monto_plataforma,
        estado: 'CONFIRMADO'
    });

    return reservation;
};

const validateQR = async (id_anfitrion, codigo_qr_turista) => {
    const reservation = await reservationRepository.findReservationByQR(codigo_qr_turista);
    
    if (!reservation) {
        throw new Error('Código QR no encontrado');
    }

    if (reservation.id_anfitrion !== id_anfitrion) {
        throw new Error('Este código no pertenece a ninguna de tus actividades');
    }

    if (reservation.estado_qr === 'USADO') {
        throw new Error('Este código ya fue utilizado');
    }

    // Marcar como usado
    await reservationRepository.updateQRStatus(reservation.id_reserva, 'USADO');

    return {
        mensaje: 'Código verificado correctamente',
        codigo_verificacion_anfitrion: reservation.codigo_verificacion_anfitrion,
        reserva: reservation
    };
};

const cancelReservationByTourist = async (id_turista, id_reserva, codigo_qr_turista) => {
    // Para simplificar, buscamos la reserva y validamos
    const reservation = await reservationRepository.findReservationByQR(codigo_qr_turista);
    
    if (!reservation || reservation.id_reserva !== parseInt(id_reserva)) {
        throw new Error('Código QR inválido para esta reserva');
    }

    if (reservation.id_turista !== id_turista) {
        throw new Error('No tienes permiso para cancelar esta reserva');
    }

    if (reservation.estado === 'CANCELADA') {
        throw new Error('La reserva ya ha sido cancelada');
    }

    const fechaExperiencia = new Date(reservation.fecha_experiencia);
    const ahora = new Date();
    
    const diffTime = fechaExperiencia - ahora;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Política de reembolso fija: 30% del total por cualquier motivo
    const porcentajeReembolso = 30;

    const montoReembolsado = (reservation.total * porcentajeReembolso) / 100;

    // Actualizar el estado de la reserva
    const updatedReservation = await reservationRepository.updateReservationStatus(id_reserva, 'CANCELADA');
    
    // Registrar el reembolso en los pagos
    await reservationRepository.updatePaymentRefund(id_reserva, montoReembolsado);

    // Enviar mensaje automático al anfitrión
    try {
        await messageRepository.createMessage({
            id_emisor: id_turista,
            id_receptor: reservation.id_anfitrion,
            contenido: `Hola, he cancelado mi reserva #${id_reserva.toString().padStart(6, '0')} para "${reservation.actividad_titulo}". El sistema ha procesado la devolución y te ha retenido la diferencia proporcional según las políticas de reembolso.`,
            es_archivo: false
        });
    } catch (msgErr) {
        console.error('Error enviando mensaje de cancelacion automático', msgErr);
    }

    return {
        mensaje: 'Reserva cancelada exitosamente',
        porcentaje_reembolso: porcentajeReembolso,
        monto_reembolsado: montoReembolsado,
        reserva: updatedReservation
    };
};

const createPackageReservation = async (data, paymentToken) => {
    const { id_turista, hostId, discountPercentage, items, total } = data;

    // 1. Procesar el cobro UNICO con Kushki por el TOTAL del paquete
    const paymentResponse = await paymentService.processCharge(paymentToken, total, {
        hostId,
        id_turista,
        packageSize: items.length
    });

    if (!paymentResponse.success) {
        throw new Error(paymentResponse.error);
    }

    const generateCode = () => Math.random().toString(36).substring(2, 12).toUpperCase();
    const reservations = [];

    // 2. Crear cada reserva individualmente
    for (const item of items) {
        const activity = await activityRepository.findFullById(item.id_actividad);
        if (!activity) continue;

        const porcentajePlataforma = activity.porcentaje_ganancia || 10;
        const monto_plataforma = (item.final_total * porcentajePlataforma) / 100;
        const monto_anfitrion = item.final_total - monto_plataforma;

        const codigo_qr_turista = generateCode();
        const codigo_verificacion_anfitrion = generateCode();

        const reservation = await reservationRepository.createReservation({
            tipo_actividad: activity.tipo,
            id_actividad: activity.id_actividad,
            id_turista,
            fecha_experiencia: item.fecha_experiencia,
            cantidad_personas: item.cantidad_personas,
            cantidad_adultos: item.cantidad_adultos,
            cantidad_ninos: item.cantidad_ninos,
            cantidad_tercera_edad: item.cantidad_tercera_edad,
            total: item.final_total,
            descuento_aplicado: discountPercentage || 0,
            estado: 'APROBADA',
            codigo_qr_turista,
            codigo_verificacion_anfitrion
        });

        await reservationRepository.createPayment({
            id_reserva: reservation.id_reserva,
            monto_total: item.final_total,
            monto_anfitrion,
            monto_plataforma,
            estado: 'CONFIRMADO'
        });

        reservations.push(reservation);
    }

    return reservations;
};

module.exports = {
    getHostReservations,
    updateStatus,
    createReservation,
    validateQR,
    cancelReservationByTourist,
    createPackageReservation
};
