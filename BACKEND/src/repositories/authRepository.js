const db = require('../config/database');

const findByEmail = async (email) => {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
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
    const { nombre, email, rol, contraseña, telefono, fecha_nacimiento } = user;
    const { rows } = await db.query(
        'INSERT INTO usuarios (nombre, email, rol, contraseña, telefono, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nombre, email, rol, contraseña, telefono, fecha_nacimiento]
    );
    return rows[0];
};

const createProfile = async (id_anfitrion) => {
    await db.query(
        'INSERT INTO perfil_anfitrion (id_anfitrion) VALUES ($1)',
        [id_anfitrion]
    );
};

module.exports = {
    findByEmail,
    findByIdentifier,
    create,
    createProfile
};
