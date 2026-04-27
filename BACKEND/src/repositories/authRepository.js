const db = require('../config/database');

const findByEmail = async (email) => {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return rows[0];
};

const findById = async (id_usuario) => {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
    return rows[0];
};

const findByIdentifier = async (identifier) => {
    // Search by email or phone
    const { rows } = await db.query(
        'SELECT * FROM usuarios WHERE email = $1 OR telefono = $1', 
        [identifier]
    );
    return rows[0];
};

const create = async (user) => {
    const { nombre, email, rol, contraseña, telefono, fecha_nacimiento, requiere_cambio_clave } = user;
    const { rows } = await db.query(
        'INSERT INTO usuarios (nombre, email, rol, contraseña, telefono, fecha_nacimiento, requiere_cambio_clave) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [nombre, email, rol, contraseña, telefono, fecha_nacimiento, requiere_cambio_clave !== undefined ? requiere_cambio_clave : false]
    );
    return rows[0];
};

const createProfile = async (id_anfitrion) => {
    await db.query(
        'INSERT INTO perfil_anfitrion (id_anfitrion) VALUES ($1)',
        [id_anfitrion]
    );
};

const updatePassword = async (id_usuario, hashedContraseña) => {
    // Al actualizar clave, ya no requiere cambio y limpiamos tokens de recuperación
    await db.query(
        'UPDATE usuarios SET contraseña = $1, requiere_cambio_clave = false, token_recuperacion = NULL, token_expiracion = NULL WHERE id_usuario = $2',
        [hashedContraseña, id_usuario]
    );
};

const setRequiresPasswordChange = async (id_usuario, status) => {
    await db.query(
        'UPDATE usuarios SET requiere_cambio_clave = $1 WHERE id_usuario = $2',
        [status, id_usuario]
    );
};

const updateLastConnection = async (id_usuario) => {
    await db.query(
        'UPDATE usuarios SET ultima_conexion = CURRENT_TIMESTAMP WHERE id_usuario = $1',
        [id_usuario]
    );
};

const suspendUserWithCode = async (id_usuario, codigo) => {
    await db.query(
        'UPDATE usuarios SET estado = $1, codigo_reactivacion = $2 WHERE id_usuario = $3',
        ['SUSPENDIDO', codigo, id_usuario]
    );
};

const reactivateUser = async (id_usuario) => {
    await db.query(
        'UPDATE usuarios SET estado = $1, codigo_reactivacion = NULL, ultima_conexion = CURRENT_TIMESTAMP WHERE id_usuario = $2',
        ['ACTIVO', id_usuario]
    );
};

const updateResetToken = async (id_usuario, token, expiration) => {
    await db.query(
        'UPDATE usuarios SET token_recuperacion = $1, token_expiracion = $2 WHERE id_usuario = $3',
        [token, expiration, id_usuario]
    );
};

const findByResetToken = async (token) => {
    const { rows } = await db.query(
        'SELECT * FROM usuarios WHERE token_recuperacion = $1 AND token_expiracion > CURRENT_TIMESTAMP',
        [token]
    );
    return rows[0];
};

module.exports = {
    findByEmail,
    findById,
    findByIdentifier,
    create,
    createProfile,
    updatePassword,
    setRequiresPasswordChange,
    updateLastConnection,
    suspendUserWithCode,
    reactivateUser,
    updateResetToken,
    findByResetToken
};
