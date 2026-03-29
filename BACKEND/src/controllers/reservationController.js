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

const createReservation = async (req, res) => {
    try {
        const id_turista = req.user.id;
        const { token, reservationData } = req.body;

        if (!token || !reservationData) {
            return res.status(400).json({ message: 'Token de pago y datos de reserva son obligatorios' });
        }

        const reservation = await reservationService.createReservation(
            { ...reservationData, id_turista },
            token
        );

        res.status(201).json({
            message: 'Reserva creada y pago procesado con éxito',
            reservation
        });
    } catch (error) {
        console.error('Error in createReservation:', error.message);
        res.status(500).json({ message: error.message || 'Error al procesar la reserva' });
    }
};

const validateQR = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        const { codigo_qr_turista } = req.body;

        if (!codigo_qr_turista) {
            return res.status(400).json({ message: 'El código QR es obligatorio' });
        }

        const result = await reservationService.validateQR(id_anfitrion, codigo_qr_turista);
        res.json(result);
    } catch (error) {
        console.error('Error in validateQR:', error.message);
        res.status(400).json({ message: error.message || 'Error al validar el código QR' });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const id_turista = req.user.id;
        const { id } = req.params;
        const { codigo_qr_turista } = req.body;

        if (!codigo_qr_turista) {
            return res.status(400).json({ message: 'El código QR generado es obligatorio para cancelar' });
        }

        const result = await reservationService.cancelReservationByTourist(id_turista, id, codigo_qr_turista);
        res.json(result);
    } catch (error) {
        console.error('Error in cancelReservation:', error.message);
        res.status(400).json({ message: error.message || 'Error al cancelar la reserva' });
    }
};

module.exports = {
    getHostReservations,
    updateStatus,
    createReservation,
    validateQR,
    cancelReservation
};
