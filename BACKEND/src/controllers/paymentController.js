const db = require('../config/database');

const getTouristPayments = async (req, res) => {
    try {
        const id_turista = req.user.id;
        
        const { rows } = await db.query(
            `SELECT p.*, r.fecha_experiencia, r.estado as estado_reserva,
                    COALESCE(at.titulo, aa.titulo) as actividad_titulo,
                    u.nombre as anfitrion_nombre
             FROM pagos p
             JOIN reservas r ON p.id_reserva = r.id_reserva
             LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
             LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
             LEFT JOIN usuarios u ON COALESCE(at.id_anfitrion, aa.id_anfitrion) = u.id_usuario
             WHERE r.id_turista = $1
             ORDER BY p.fecha_pago DESC`,
            [id_turista]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tourist payments:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los pagos' });
    }
};

const getHostPayments = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        
        const { rows } = await db.query(
            `SELECT p.*, r.fecha_experiencia, r.estado as estado_reserva,
                    COALESCE(at.titulo, aa.titulo) as actividad_titulo,
                    u.nombre as turista_nombre
             FROM pagos p
             JOIN reservas r ON p.id_reserva = r.id_reserva
             LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
             LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
             JOIN usuarios u ON r.id_turista = u.id_usuario
             WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
             ORDER BY p.fecha_pago DESC`,
            [id_anfitrion]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching host payments:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los pagos' });
    }
};

module.exports = {
    getTouristPayments,
    getHostPayments
};
