const db = require('../config/database');

const getTouristNotifications = async (req, res) => {
    try {
        const id_turista = req.user.id;
        
        // Mensajes no leídos (que yo recibí y están en ENVIADO o RECIBIDO)
        const msgRes = await db.query(
            "SELECT COUNT(*) FROM mensajes WHERE id_receptor = $1 AND estado IN ('ENVIADO', 'RECIBIDO')",
            [id_turista]
        );
        const unreadMessages = parseInt(msgRes.rows[0].count);

        const msgDetailsRes = await db.query(
            `SELECT m.id_mensaje, m.id_emisor, u.nombre as emisor_nombre, m.contenido, m.fecha_envio 
             FROM mensajes m 
             JOIN usuarios u ON m.id_emisor = u.id_usuario 
             WHERE m.id_receptor = $1 AND m.estado IN ('ENVIADO', 'RECIBIDO') 
             ORDER BY m.fecha_envio DESC LIMIT 5`,
            [id_turista]
        );

        res.json({
            unreadMessages,
            total: unreadMessages,
            messageDetails: msgDetailsRes.rows
        });
    } catch (error) {
        console.error('Error fetching tourist notifications:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las notificaciones' });
    }
};

const getHostNotifications = async (req, res) => {
    try {
        const id_anfitrion = req.user.id;
        
        // Mensajes no leídos
        const msgRes = await db.query(
            "SELECT COUNT(*) FROM mensajes WHERE id_receptor = $1 AND estado IN ('ENVIADO', 'RECIBIDO')",
            [id_anfitrion]
        );
        const unreadMessages = parseInt(msgRes.rows[0].count);

        // Reservas Pendientes
        const resRes = await db.query(
            `SELECT COUNT(*)
             FROM reservas r
             LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
             LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
             WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
             AND r.estado = 'PENDIENTE'`,
            [id_anfitrion]
        );
        const pendingReservations = parseInt(resRes.rows[0].count);

        const msgDetailsRes = await db.query(
            `SELECT m.id_mensaje, m.id_emisor, u.nombre as emisor_nombre, m.contenido, m.fecha_envio 
             FROM mensajes m 
             JOIN usuarios u ON m.id_emisor = u.id_usuario 
             WHERE m.id_receptor = $1 AND m.estado IN ('ENVIADO', 'RECIBIDO') 
             ORDER BY m.fecha_envio DESC LIMIT 5`,
            [id_anfitrion]
        );

        const resDetailsRes = await db.query(
            `SELECT r.id_reserva, u.nombre as turista_nombre, COALESCE(at.titulo, aa.titulo) as actividad_titulo, r.fecha_experiencia
             FROM reservas r
             JOIN usuarios u ON r.id_turista = u.id_usuario
             LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
             LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
             WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
             AND r.estado = 'PENDIENTE'
             ORDER BY r.fecha_experiencia ASC LIMIT 5`,
            [id_anfitrion]
        );

        res.json({
            unreadMessages,
            pendingReservations,
            total: unreadMessages + pendingReservations,
            messageDetails: msgDetailsRes.rows,
            reservationDetails: resDetailsRes.rows
        });
    } catch (error) {
        console.error('Error fetching host notifications:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las notificaciones' });
    }
};

module.exports = {
    getTouristNotifications,
    getHostNotifications
};
