const db = require('../config/database');

const createMessage = async (messageData) => {
    const { id_emisor, id_receptor, contenido, es_archivo, nombre_archivo, tamano_archivo } = messageData;
    const { rows } = await db.query(
        `INSERT INTO mensajes (id_emisor, id_receptor, contenido, es_archivo, nombre_archivo, tamano_archivo)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id_emisor, id_receptor, contenido, es_archivo || false, nombre_archivo || null, tamano_archivo || null]
    );
    return rows[0];
};

const getMessagesBetweenUsers = async (user1Id, user2Id) => {
    // We only fetch messages that haven't been deleted by the requesting user (user1Id)
    const { rows } = await db.query(
        `SELECT *, (id_emisor = $1) as es_mio FROM mensajes 
         WHERE ((id_emisor = $1 AND id_receptor = $2 AND eliminado_emisor = FALSE) 
            OR (id_emisor = $2 AND id_receptor = $1 AND eliminado_receptor = FALSE))
         ORDER BY fecha_envio ASC`,
        [user1Id, user2Id]
    );
    return rows;
};

const getConversationsForUser = async (userId) => {
    const { rows } = await db.query(
        `WITH LastMessages AS (
            SELECT 
                CASE WHEN id_emisor = $1 THEN id_receptor ELSE id_emisor END as partner_id,
                contenido, 
                fecha_envio,
                CASE WHEN id_emisor = $1 THEN archivado_emisor ELSE archivado_receptor END as is_archived,
                CASE WHEN id_emisor = $1 THEN eliminado_emisor ELSE eliminado_receptor END as is_deleted,
                ROW_NUMBER() OVER(PARTITION BY CASE WHEN id_emisor = $1 THEN id_receptor ELSE id_emisor END ORDER BY fecha_envio DESC) as rn
            FROM mensajes
            WHERE id_emisor = $1 OR id_receptor = $1
        ),
        PartnerFilter AS (
            SELECT * FROM LastMessages WHERE partner_id IS NOT NULL AND is_deleted = FALSE
        )
        SELECT 
            lm.partner_id as id_receptor, 
            COALESCE(u.nombre, 'Usuario') as nombre_otro, 
            u.rol, 
            u.telefono,
            COALESCE(pa.idiomas, pt.idiomas, 'No especificado') as idiomas,
            lm.contenido as ultimo_mensaje, 
            lm.fecha_envio as ultimo_tiempo,
            lm.is_archived
        FROM PartnerFilter lm
        LEFT JOIN usuarios u ON lm.partner_id = u.id_usuario
        LEFT JOIN perfil_anfitrion pa ON lm.partner_id = pa.id_anfitrion
        LEFT JOIN perfil_turista pt ON lm.partner_id = pt.id_turista
        WHERE lm.rn = 1
        ORDER BY lm.fecha_envio DESC`,
        [userId]
    );
    return rows;
};

const updateMessageStatus = async (id_mensaje, status) => {
    const { rows } = await db.query(
        `UPDATE mensajes SET estado = $1 WHERE id_mensaje = $2 RETURNING *`,
        [status, id_mensaje]
    );
    return rows[0];
};

const updateMessageContent = async (id_mensaje, newContent) => {
    const { rows } = await db.query(
        `UPDATE mensajes SET contenido = $1, editado = TRUE WHERE id_mensaje = $2 RETURNING *`,
        [newContent, id_mensaje]
    );
    return rows[0];
};

const deleteMessage = async (id_mensaje, userId) => {
    await db.query(
        `UPDATE mensajes 
         SET eliminado_emisor = CASE WHEN id_emisor = $2 THEN TRUE ELSE eliminado_emisor END,
             eliminado_receptor = CASE WHEN id_receptor = $2 THEN TRUE ELSE eliminado_receptor END
         WHERE id_mensaje = $1`,
        [id_mensaje, userId]
    );
};

const archiveConversation = async (userId, partnerId, archive = true) => {
    await db.query(
        `UPDATE mensajes 
         SET archivado_emisor = CASE WHEN id_emisor = $1 THEN $3 ELSE archivado_emisor END,
             archivado_receptor = CASE WHEN id_receptor = $1 THEN $3 ELSE archivado_receptor END
         WHERE (id_emisor = $1 AND id_receptor = $2) OR (id_emisor = $2 AND id_receptor = $1)`,
        [userId, partnerId, archive]
    );
};

const deleteConversation = async (userId, partnerId) => {
    await db.query(
        `UPDATE mensajes 
         SET eliminado_emisor = CASE WHEN id_emisor = $1 THEN TRUE ELSE eliminado_emisor END,
             eliminado_receptor = CASE WHEN id_receptor = $1 THEN TRUE ELSE eliminado_receptor END
         WHERE (id_emisor = $1 AND id_receptor = $2) OR (id_emisor = $2 AND id_receptor = $1)`,
        [userId, partnerId]
    );
};

const markMessagesAsRead = async (emisorId, receptorId) => {
    await db.query(
        "UPDATE mensajes SET estado = 'LEIDO' WHERE id_emisor = $1 AND id_receptor = $2 AND estado != 'LEIDO'",
        [emisorId, receptorId]
    );
};

module.exports = {
    createMessage,
    getMessagesBetweenUsers,
    getConversationsForUser,
    updateMessageStatus,
    updateMessageContent,
    deleteMessage,
    archiveConversation,
    deleteConversation,
    markMessagesAsRead
};
