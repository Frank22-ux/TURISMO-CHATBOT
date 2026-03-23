const reservationRepository = require('../repositories/reservationRepository');
const activityRepository = require('../repositories/activityRepository');
const paymentService = require('./paymentService');

const getHostReservations = async (id_anfitrion) => {
    return await reservationRepository.findReservationsByHostId(id_anfitrion);
};

const updateStatus = async (id_reserva, estado) => {
    return await reservationRepository.updateReservationStatus(id_reserva, estado);
};

const createReservation = async (data, paymentToken) => {
    const { id_actividad, id_turista, fecha_experiencia, cantidad_personas, total } = data;

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

    // 3. Crear la reserva en la DB
    const reservation = await reservationRepository.createReservation({
        tipo_actividad: activity.tipo,
        id_actividad: activity.id_actividad,
        id_turista,
        fecha_experiencia,
        cantidad_personas,
        total,
        estado: 'APROBADA' // Al ser pago inmediato, la aprobamos
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

module.exports = {
    getHostReservations,
    updateStatus,
    createReservation
};
