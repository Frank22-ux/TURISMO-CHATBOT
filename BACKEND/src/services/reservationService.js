const reservationRepository = require('../repositories/reservationRepository');

const getHostReservations = async (id_anfitrion) => {
    return await reservationRepository.findReservationsByHostId(id_anfitrion);
};

const updateStatus = async (id_reserva, estado) => {
    return await reservationRepository.updateReservationStatus(id_reserva, estado);
};

module.exports = {
    getHostReservations,
    updateStatus
};
