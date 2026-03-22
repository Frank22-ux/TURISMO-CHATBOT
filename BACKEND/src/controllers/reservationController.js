const reservationService = require('../services/reservationService');

const getHostReservations = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const reservations = await reservationService.getHostReservations(id_anfitrion);
        res.json(reservations);
    } catch (error) {
        console.error('Error in getHostReservations:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (!estado) {
            return res.status(400).json({ message: 'El estado es obligatorio' });
        }

        const reservation = await reservationService.updateStatus(id, estado);
        res.json(reservation);
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getHostReservations,
    updateStatus
};
