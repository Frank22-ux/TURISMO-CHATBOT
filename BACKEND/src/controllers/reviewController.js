const reviewRepository = require('../repositories/reviewRepository');
const db = require('../config/database');

const createReview = async (req, res) => {
    try {
        const { id_reserva, puntuacion, comentario } = req.body;
        const autor_id = req.user.userId || req.user.id; 
        const rol_autor = req.user.role || req.user.rol; 

        // Get reservation details
        const { rows: reservationRows } = await db.query(
            `SELECT r.*, 
            COALESCE(at.id_anfitrion, aa.id_anfitrion) as id_anfitrion
            FROM reservas r
            LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
            LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
            WHERE r.id_reserva = $1`,
            [id_reserva]
        );

        if (reservationRows.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        const reserva = reservationRows[0];

        // Check if 24 hours have passed
        const experienceDate = new Date(reserva.fecha_experiencia);
        const now = new Date();
        const diffHours = (now - experienceDate) / (1000 * 60 * 60);

        if (diffHours < 24) {
             return res.status(400).json({ message: 'Deben pasar 24 horas después de la experiencia para poder calificar.' });
        }

        // Determine receptor_id
        let receptor_id;
        if (rol_autor === 'TURISTA') {
            if (reserva.id_turista !== autor_id) return res.status(403).json({ message: 'No puedes calificar esta reserva' });
            receptor_id = reserva.id_anfitrion;
        } else if (rol_autor === 'ANFITRION') {
            if (reserva.id_anfitrion !== autor_id) return res.status(403).json({ message: 'No puedes calificar esta reserva' });
            receptor_id = reserva.id_turista;
        } else {
            return res.status(403).json({ message: 'Rol inválido para calificar' });
        }

        // Check if already reviewed
        const exists = await reviewRepository.checkReviewExists(id_reserva, autor_id);
        if (exists) {
            return res.status(400).json({ message: 'Ya has enviado una calificación para esta reserva' });
        }

        const review = await reviewRepository.createReview(id_reserva, autor_id, receptor_id, rol_autor, puntuacion, comentario);
        res.status(201).json({ message: 'Calificación enviada con éxito', review });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la calificación' });
    }
};

const getReceivedReviews = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const reviews = await reviewRepository.getReviewsByReceptorId(userId);
        
        let promedio = 0;
        if (reviews.length > 0) {
            promedio = reviews.reduce((acc, rev) => acc + rev.puntuacion, 0) / reviews.length;
        }
        
        res.json({ reviews, promedio: parseFloat(promedio.toFixed(1)), total: reviews.length });
    } catch (error) {
         console.error('Error fetching received reviews:', error);
         res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    createReview,
    getReceivedReviews
};
