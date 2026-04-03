const db = require('../config/database');

const findProfileByHostId = async (id_anfitrion) => {
    const { rows } = await db.query(
        `SELECT u.nombre, u.email, u.fecha_nacimiento, p.* 
         FROM usuarios u 
         LEFT JOIN perfil_anfitrion p ON u.id_usuario = p.id_anfitrion 
         WHERE u.id_usuario = $1`,
        [id_anfitrion]
    );
    return rows[0];
};

const updateProfile = async (id_anfitrion, profileData) => {
    const { 
        nombre, email, fecha_nacimiento,
        telefono, biografia, idiomas, experiencia_anios,
        avatar, cover_photo,
        url_documento_legal_frontal, url_documento_legal_posterior,
        descuento_paquete
    } = profileData;
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Update core user data (nombre, email, fecha_nacimiento)
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
                id_anfitrion
            ]
        );

        // 2. Update or Insert profile specific data
        const { rows: profileUpdate } = await client.query(
            `INSERT INTO perfil_anfitrion (
                id_anfitrion, telefono, correo_contacto, biografia, idiomas, 
                experiencia_anios, url_foto_perfil, url_foto_portada,
                url_documento_legal_frontal, url_documento_legal_posterior,
                descuento_paquete
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id_anfitrion) DO UPDATE SET
                telefono = EXCLUDED.telefono,
                correo_contacto = EXCLUDED.correo_contacto,
                biografia = EXCLUDED.biografia,
                idiomas = EXCLUDED.idiomas,
                experiencia_anios = EXCLUDED.experiencia_anios,
                url_foto_perfil = EXCLUDED.url_foto_perfil,
                url_foto_portada = EXCLUDED.url_foto_portada,
                url_documento_legal_frontal = EXCLUDED.url_documento_legal_frontal,
                url_documento_legal_posterior = EXCLUDED.url_documento_legal_posterior,
                descuento_paquete = EXCLUDED.descuento_paquete
            RETURNING *`,
            [
                id_anfitrion, 
                telefono || null, 
                email || null, 
                biografia || null, 
                idiomas || '', 
                parseInt(experiencia_anios) || 0, 
                avatar || null, 
                cover_photo || null, 
                url_documento_legal_frontal || null, 
                url_documento_legal_posterior || null,
                parseFloat(descuento_paquete) || 0
            ]
        );
        
        await client.query('COMMIT');
        // Return combined data to frontend
        return {
            id_usuario: id_anfitrion,
            nombre,
            email,
            fecha_nacimiento,
            ...profileUpdate[0]
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in host updateProfile transaction:', error);
        throw error;
    } finally {
        client.release();
    }
};

const getDashboardStats = async (id_anfitrion) => {
    // 1. Total views
    const { rows: viewRows } = await db.query(
        `SELECT SUM(vistas) as total_views FROM (
            SELECT vistas FROM actividades_turisticas WHERE id_anfitrion = $1
            UNION ALL
            SELECT vistas FROM actividades_alimentarias WHERE id_anfitrion = $1
        ) as combined_vistas`,
        [id_anfitrion]
    );

    // 2. Monthly earnings (CONFIRMADO this month)
    const { rows: earningRows } = await db.query(
        `SELECT COALESCE(SUM(p.monto_anfitrion), 0) as monthly_earnings
         FROM pagos p
         JOIN reservas r ON p.id_reserva = r.id_reserva
         LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
         WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
         AND p.estado = 'CONFIRMADO'
         AND date_trunc('month', p.fecha_pago) = date_trunc('month', CURRENT_DATE)`,
        [id_anfitrion]
    );

    // 3. Average rating
    const { rows: ratingRows } = await db.query(
        `SELECT AVG(v.puntuacion) as avg_rating
         FROM valoraciones v
         LEFT JOIN actividades_turisticas at ON v.id_actividad = at.id_actividad AND v.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON v.id_actividad = aa.id_actividad AND v.tipo_actividad = 'ALIMENTARIA'
         WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)`,
        [id_anfitrion]
    );

    // 4. New bookings (PENDIENTE)
    const { rows: bookingRows } = await db.query(
        `SELECT COUNT(*) as new_bookings
         FROM reservas r
         LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
         WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
         AND r.estado = 'PENDIENTE'`,
        [id_anfitrion]
    );

    // 5. Recent reservations (Last 5)
    const { rows: recentReservations } = await db.query(
        `SELECT r.*, u.nombre as turista_nombre, COALESCE(at.titulo, aa.titulo) as actividad_titulo
         FROM reservas r
         JOIN usuarios u ON r.id_turista = u.id_usuario
         LEFT JOIN actividades_turisticas at ON r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA'
         LEFT JOIN actividades_alimentarias aa ON r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA'
         WHERE (at.id_anfitrion = $1 OR aa.id_anfitrion = $1)
         ORDER BY r.fecha_solicitud DESC
         LIMIT 5`,
        [id_anfitrion]
    );

    return {
        totalViews: parseInt(viewRows[0].total_views) || 0,
        monthlyEarnings: parseFloat(earningRows[0].monthly_earnings) || 0,
        avgRating: parseFloat(ratingRows[0].avg_rating) || 0,
        newBookings: parseInt(bookingRows[0].new_bookings) || 0,
        recentReservations
    };
};
const initializeProfile = async (id_anfitrion) => {
    await db.query(
        'INSERT INTO perfil_anfitrion (id_anfitrion) VALUES ($1) ON CONFLICT (id_anfitrion) DO NOTHING',
        [id_anfitrion]
    );
};

const updateBankProfile = async (id_anfitrion, bankData) => {
    const { banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais } = bankData;
    const { rows } = await db.query(
        `UPDATE perfil_anfitrion 
         SET banco_nombre = COALESCE($1, banco_nombre),
             tipo_cuenta = COALESCE($2, tipo_cuenta),
             numero_cuenta = COALESCE($3, numero_cuenta),
             identificacion = COALESCE($4, identificacion),
             banco_swift = COALESCE($5, banco_swift),
             banco_direccion = COALESCE($6, banco_direccion),
             banco_pais = COALESCE($7, banco_pais)
         WHERE id_anfitrion = $8
         RETURNING *`,
        [banco_nombre, tipo_cuenta, numero_cuenta, identificacion, banco_swift, banco_direccion, banco_pais, id_anfitrion]
    );
    return rows[0];
};

module.exports = {
    findProfileByHostId,
    updateProfile,
    initializeProfile,
    updateBankProfile,
    getDashboardStats
};
