const db = require('../config/database');

const getTouristStats = async (id_turista) => {
    // 1. Active bookings
    const { rows: activeRows } = await db.query(
        "SELECT COUNT(*) as active FROM reservas WHERE id_turista = $1 AND estado IN ('PENDIENTE', 'APROBADA') AND fecha_experiencia >= CURRENT_DATE",
        [id_turista]
    );

    // 2. Completed bookings
    const { rows: completedRows } = await db.query(
        "SELECT COUNT(*) as completed FROM reservas WHERE id_turista = $1 AND estado = 'APROBADA' AND fecha_experiencia < CURRENT_DATE",
        [id_turista]
    );

    // 3. Total spent
    const { rows: spentRows } = await db.query(
        "SELECT COALESCE(SUM(total), 0) as total_spent FROM reservas WHERE id_turista = $1 AND estado = 'APROBADA'",
        [id_turista]
    );

    // 4. Pending reviews (Reservations completed but not in valoraciones)
    const { rows: pendingReviewsRows } = await db.query(
        `SELECT COUNT(*) as pending_reviews 
         FROM reservas r
         WHERE r.id_turista = $1 
         AND r.estado = 'APROBADA' 
         AND r.fecha_experiencia < CURRENT_DATE
         AND NOT EXISTS (
            SELECT 1 FROM valoraciones v 
            WHERE v.id_turista = r.id_turista 
            AND v.id_actividad = r.id_actividad 
            AND v.tipo_actividad = r.tipo_actividad
         )`,
        [id_turista]
    );

    return {
        activeBookings: parseInt(activeRows[0].active) || 0,
        completedBookings: parseInt(completedRows[0].completed) || 0,
        totalSpent: parseFloat(spentRows[0].total_spent) || 0,
        pendingReviews: parseInt(pendingReviewsRows[0].pending_reviews) || 0
    };
};

const getTouristReservations = async (id_turista) => {
    const { rows } = await db.query(
        `SELECT r.*, COALESCE(at.titulo, aa.titulo) as actividad_titulo, 
         u.nombre as anfitrion_nombre
         FROM reservas r
         LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
         JOIN usuarios u ON (at.id_anfitrion = u.id_usuario OR aa.id_anfitrion = u.id_usuario)
         WHERE r.id_turista = $1
         ORDER BY r.fecha_experiencia DESC`,
        [id_turista]
    );
    return rows;
};

const findProfileByTouristId = async (id_turista) => {
    const { rows } = await db.query(
        `SELECT u.nombre, u.email, u.fecha_nacimiento, p.* 
         FROM usuarios u 
         LEFT JOIN perfil_turista p ON u.id_usuario = p.id_turista 
         WHERE u.id_usuario = $1`,
        [id_turista]
    );
    return rows[0];
};

const updateProfile = async (id_turista, profileData) => {
    const { 
        nombre, email, fecha_nacimiento,
        telefono, biografia, idiomas, anios_viajando,
        avatar, cover_photo,
        url_documento_legal_frontal, url_documento_legal_posterior
    } = profileData;
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Update core user data
        if (nombre || email || fecha_nacimiento) {
            await client.query(
                `UPDATE usuarios 
                 SET nombre = COALESCE($1, nombre), 
                     email = COALESCE($2, email), 
                     fecha_nacimiento = COALESCE($3, fecha_nacimiento) 
                 WHERE id_usuario = $4`,
                [
                    nombre || null, 
                    email || null, 
                    fecha_nacimiento ? (fecha_nacimiento === "" ? null : fecha_nacimiento) : null, 
                    id_turista
                ]
            );
        }

        // 2. Update or Insert profile specific data
        const profileUpdate = await client.query(
            `INSERT INTO perfil_turista (
                id_turista, telefono, correo_contacto, biografia, idiomas, experiencia_anios,
                url_foto_perfil, url_foto_portada,
                url_documento_legal_frontal, url_documento_legal_posterior
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id_turista) DO UPDATE SET
                telefono = EXCLUDED.telefono,
                correo_contacto = EXCLUDED.correo_contacto,
                biografia = EXCLUDED.biografia,
                idiomas = EXCLUDED.idiomas,
                experiencia_anios = EXCLUDED.experiencia_anios,
                url_foto_perfil = EXCLUDED.url_foto_perfil,
                url_foto_portada = EXCLUDED.url_foto_portada,
                url_documento_legal_frontal = EXCLUDED.url_documento_legal_frontal,
                url_documento_legal_posterior = EXCLUDED.url_documento_legal_posterior
            RETURNING *`,
            [
                id_turista, 
                telefono, 
                email, // mapped to correo_contacto
                biografia, 
                idiomas, 
                parseInt(anios_viajando) || 0,
                avatar || null, // mapped to url_foto_perfil
                cover_photo || null, // mapped to url_foto_portada
                url_documento_legal_frontal || null, 
                url_documento_legal_posterior || null
            ]
        );
        
        await client.query('COMMIT');
        return {
            id_usuario: id_turista,
            nombre,
            email,
            fecha_nacimiento,
            ...profileUpdate.rows[0]
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in tourist updateProfile transaction:', error);
        throw error;
    } finally {
        client.release();
    }
};

const initializeProfile = async (id_turista) => {
    await db.query(
        'INSERT INTO perfil_turista (id_turista) VALUES ($1) ON CONFLICT (id_turista) DO NOTHING',
        [id_turista]
    );
};

const updateBankProfile = async (id_turista, bankData) => {
    const { banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais } = bankData;
    const { rows } = await db.query(
        `UPDATE perfil_turista 
         SET banco_nombre = COALESCE($1, banco_nombre),
             tipo_cuenta = COALESCE($2, tipo_cuenta),
             numero_cuenta = COALESCE($3, numero_cuenta),
             identificacion = COALESCE($4, identificacion),
             banco_swift = COALESCE($5, banco_swift),
             banco_direccion = COALESCE($6, banco_direccion),
             banco_pais = COALESCE($7, banco_pais)
         WHERE id_turista = $8
         RETURNING *`,
        [banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais, id_turista]
    );
    return rows[0];
};

module.exports = {
    getTouristStats,
    getTouristReservations,
    findProfileByTouristId,
    updateProfile,
    initializeProfile,
    updateBankProfile
};
