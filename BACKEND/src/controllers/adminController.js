const db = require('../config/database');

const getGlobalStats = async (req, res) => {
    try {
        // 1. Conteo de usuarios por rol
        const userCountsQuery = `
            SELECT rol, COUNT(*) as count 
            FROM usuarios 
            GROUP BY rol
        `;
        const userCounts = await db.query(userCountsQuery);
        
        // 2. Ganancias totales de la plataforma
        const earningsQuery = `
            SELECT 
                COALESCE(SUM(monto_plataforma), 0) as total_plataforma,
                COALESCE(SUM(monto_anfitrion), 0) as total_anfitriones,
                COALESCE(SUM(monto_total), 0) as total_bruto
            FROM pagos 
            WHERE estado = 'CONFIRMADO'
        `;
        const earnings = await db.query(earningsQuery);

        // 3. Mejor anfitrión (Cualquier tiempo para datos de prueba)
        const bestHostQuery = `
            SELECT 
                u.nombre, 
                SUM(p.monto_total) as total_generado
            FROM pagos p
            JOIN reservas r ON p.id_reserva = r.id_reserva
            LEFT JOIN actividades_turisticas at ON (r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA')
            LEFT JOIN actividades_alimentarias aa ON (r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA')
            JOIN usuarios u ON COALESCE(at.id_anfitrion, aa.id_anfitrion) = u.id_usuario
            WHERE p.estado = 'CONFIRMADO' 
            GROUP BY u.id_usuario, u.nombre
            ORDER BY total_generado DESC
            LIMIT 1
        `;
        const bestHost = await db.query(bestHostQuery);

        // 4. Estadísticas de actividades (Experiencias y Servicios)
        const activityStatsQuery = `
            SELECT 'Experiencias' as tipo, estado, COUNT(*) as count 
            FROM actividades_turisticas 
            GROUP BY estado
            UNION ALL
            SELECT 'Servicios' as tipo, estado, COUNT(*) as count 
            FROM actividades_alimentarias 
            GROUP BY estado
        `;
        const activityStats = await db.query(activityStatsQuery);

        // 5. Actividad por mes (Registros de usuarios)
        const registrationTrendQuery = `
            SELECT 
                TO_CHAR(fecha_registro, 'YYYY-MM') as mes,
                COUNT(*) as count
            FROM usuarios
            GROUP BY mes
            ORDER BY mes ASC
        `;
        const registrationTrend = await db.query(registrationTrendQuery);

        // 6. Tendencia de reservas
        const bookingTrendQuery = `
            SELECT 
                TO_CHAR(fecha_solicitud, 'YYYY-MM') as mes,
                COUNT(*) as count
            FROM reservas
            GROUP BY mes
            ORDER BY mes ASC
        `;
        const bookingTrend = await db.query(bookingTrendQuery);

        res.status(200).json({
            users: userCounts.rows,
            earnings: earnings.rows[0],
            bestHost: bestHost.rows[0] || null,
            activities: activityStats.rows,
            registrationTrend: registrationTrend.rows,
            bookingTrend: bookingTrend.rows
        });

    } catch (error) {
        console.error('Error in getGlobalStats:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id_usuario, 
                u.nombre, 
                u.email, 
                u.telefono, 
                u.rol, 
                u.estado, 
                u.verificado,
                u.fecha_registro,
                pa.url_documento_legal_frontal,
                pa.url_documento_legal_posterior
            FROM usuarios u
            LEFT JOIN perfil_anfitrion pa ON u.id_usuario = pa.id_anfitrion
            ORDER BY u.fecha_registro DESC
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllActivities = async (req, res) => {
    try {
        const query = `
            SELECT 
                at.id_actividad, at.titulo, 'TURISTICA' as tipo, 
                u.nombre as anfitrion, at.estado, at.precio, at.fecha_creacion,
                ub.latitud, ub.longitud
            FROM actividades_turisticas at
            JOIN usuarios u ON at.id_anfitrion = u.id_usuario
            JOIN ubicaciones ub ON at.id_ubicacion = ub.id_ubicacion
            UNION ALL
            SELECT 
                aa.id_actividad, aa.titulo, 'ALIMENTARIA' as tipo, 
                u.nombre as anfitrion, aa.estado, aa.precio, aa.fecha_creacion,
                ub.latitud, ub.longitud
            FROM actividades_alimentarias aa
            JOIN usuarios u ON aa.id_anfitrion = u.id_usuario
            JOIN ubicaciones ub ON aa.id_ubicacion = ub.id_ubicacion
            ORDER BY fecha_creacion DESC
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const query = 'UPDATE usuarios SET estado = $1 WHERE id_usuario = $2 RETURNING *';
        const result = await db.query(query, [estado, id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivityStatus = async (req, res) => {
    try {
        const { id, type } = req.params;
        const { estado } = req.body;
        const table = type === 'TURISTICA' ? 'actividades_turisticas' : 'actividades_alimentarias';
        const id_col = 'id_actividad';
        
        const query = `UPDATE ${table} SET estado = $1 WHERE ${id_col} = $2 RETURNING *`;
        const result = await db.query(query, [estado, id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificado } = req.body;
        const query = 'UPDATE usuarios SET verificado = $1 WHERE id_usuario = $2 RETURNING *';
        const result = await db.query(query, [verificado, id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecentActivity = async (req, res) => {
    try {
        const query = `
            (SELECT 'USER_REG' as tipo, nombre as detalle, fecha_registro as fecha FROM usuarios)
            UNION ALL
            (SELECT 'PAYMENT' as tipo, 'Pago de $' || monto_total || ' confirmado' as detalle, fecha_pago as fecha FROM pagos WHERE estado = 'CONFIRMADO')
            UNION ALL
            (SELECT 'BOOKING' as tipo, 'Reserva de ' || cantidad_personas || ' personas' as detalle, fecha_solicitud as fecha FROM reservas)
            UNION ALL
            (SELECT 'REVIEW' as tipo, substring(comentario from 1 for 30) || '...' as detalle, fecha as fecha FROM valoraciones)
            ORDER BY fecha DESC
            LIMIT 10
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFinancialReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id_pago, p.monto_total, p.monto_anfitrion, p.monto_plataforma, 
                p.estado, p.fecha_pago, u.nombre as turista,
                COALESCE(at.titulo, aa.titulo) as actividad
            FROM pagos p
            JOIN reservas r ON p.id_reserva = r.id_reserva
            JOIN usuarios u ON r.id_turista = u.id_usuario
            LEFT JOIN actividades_turisticas at ON (r.id_actividad = at.id_actividad AND r.tipo_actividad = 'TURISTICA')
            LEFT JOIN actividades_alimentarias aa ON (r.id_actividad = aa.id_actividad AND r.tipo_actividad = 'ALIMENTARIA')
            ORDER BY p.fecha_pago DESC
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const query = `
            SELECT 
                v.id_valoracion as id, 'ACTIVITY' as tipo, v.puntuacion, v.comentario, 
                v.fecha, v.visible, u.nombre as autor, 
                COALESCE(at.titulo, aa.titulo) as destino
            FROM valoraciones v
            JOIN usuarios u ON v.id_turista = u.id_usuario
            LEFT JOIN actividades_turisticas at ON (v.id_actividad = at.id_actividad AND v.tipo_actividad = 'TURISTICA')
            LEFT JOIN actividades_alimentarias aa ON (v.id_actividad = aa.id_actividad AND v.tipo_actividad = 'ALIMENTARIA')
            UNION ALL
            SELECT 
                r.id_resena as id, 'MUTUAL' as tipo, r.puntuacion, r.comentario, 
                r.fecha_creacion as fecha, r.visible, u1.nombre as autor, u2.nombre as destino
            FROM resenas r
            JOIN usuarios u1 ON r.autor_id = u1.id_usuario
            JOIN usuarios u2 ON r.receptor_id = u2.id_usuario
            ORDER BY fecha DESC
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReviewVisibility = async (req, res) => {
    try {
        const { id, type } = req.params;
        const { visible } = req.body;
        const table = type === 'ACTIVITY' ? 'valoraciones' : 'resenas';
        const id_col = type === 'ACTIVITY' ? 'id_valoracion' : 'id_resena';
        
        const query = `UPDATE ${table} SET visible = $1 WHERE ${id_col} = $2 RETURNING *`;
        const result = await db.query(query, [visible, id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHostDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                u.nombre,
                u.email,
                pa.url_documento_legal_frontal,
                pa.url_documento_legal_posterior,
                pa.identificacion
            FROM usuarios u
            LEFT JOIN perfil_anfitrion pa ON u.id_usuario = pa.id_anfitrion
            WHERE u.id_usuario = $1 AND u.rol = 'ANFITRION'
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Anfitrión no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGlobalStats,
    getAllUsers,
    getAllActivities,
    updateUserStatus,
    updateActivityStatus,
    updateVerification,
    getRecentActivity,
    getFinancialReport,
    getAllReviews,
    updateReviewVisibility,
    getHostDocuments
};
