const db = require('../config/database');

const findReservationsByHostId = async (id_anfitrion) => {
    const { rows } = await db.query(
        `SELECT r.*, u.nombre as turista_nombre, 
                COALESCE(at.titulo, aa.titulo) as actividad_titulo
         FROM reservas r
         JOIN usuarios u ON r.id_turista = u.id_usuario
         LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
         WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
         ORDER BY r.fecha_experiencia ASC`,
        [id_anfitrion]
    );
    return rows;
};

const updateReservationStatus = async (id_reserva, estado) => {
    const { rows } = await db.query(
        'UPDATE reservas SET estado = $1, fecha_respuesta = CURRENT_TIMESTAMP WHERE id_reserva = $2 RETURNING *',
        [estado, id_reserva]
    );
    return rows[0];
};

module.exports = {
    findReservationsByHostId,
    updateReservationStatus
};
