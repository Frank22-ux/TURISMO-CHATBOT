const db = require('../config/database');

const createReview = async (id_reserva, autor_id, receptor_id, rol_autor, puntuacion, comentario) => {
    const { rows } = await db.query(
        `INSERT INTO resenas (id_reserva, autor_id, receptor_id, rol_autor, puntuacion, comentario)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id_reserva, autor_id, receptor_id, rol_autor, puntuacion, comentario]
    );
    return rows[0];
};

const getReviewsByReceptorId = async (receptor_id) => {
    const { rows } = await db.query(
        `SELECT r.*, u.nombre as autor_nombre, 
         CASE WHEN r.rol_autor = 'TURISTA' THEN pt.url_foto_perfil ELSE pa.url_foto_perfil END as autor_avatar,
         CASE WHEN res.tipo_actividad = 'TURISTICA' THEN at.titulo ELSE aa.titulo END as actividad_titulo
         FROM resenas r
         JOIN usuarios u ON r.autor_id = u.id_usuario
         JOIN reservas res ON r.id_reserva = res.id_reserva
         LEFT JOIN actividades_turisticas at ON res.id_actividad = at.id_actividad AND res.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON res.id_actividad = aa.id_actividad AND res.tipo_actividad = 'ALIMENTARIA'
         LEFT JOIN perfil_turista pt ON r.autor_id = pt.id_turista AND r.rol_autor = 'TURISTA'
         LEFT JOIN perfil_anfitrion pa ON r.autor_id = pa.id_anfitrion AND r.rol_autor = 'ANFITRION'
         WHERE r.receptor_id = $1
         ORDER BY r.fecha_creacion DESC`,
        [receptor_id]
    );
    return rows;
};

const checkReviewExists = async (id_reserva, autor_id) => {
    const { rows } = await db.query(
        'SELECT 1 FROM resenas WHERE id_reserva = $1 AND autor_id = $2',
        [id_reserva, autor_id]
    );
    return rows.length > 0;
};

module.exports = {
    createReview,
    getReviewsByReceptorId,
    checkReviewExists
};
