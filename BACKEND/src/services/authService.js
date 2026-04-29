const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const emailTemplates = require('../utils/emailTemplates');
const emailService = require('./emailService');

const register = async (userData) => {
    const { nombre, email, rol, telefono, fecha_nacimiento } = userData;

    // Server-side validation for phone number
    if (telefono) {
        const phoneRegex = /^\+[0-9]{7,18}$/;
        if (!phoneRegex.test(telefono)) {
            throw new Error('Formato de teléfono inválido. Debe incluir prefijo y entre 7 a 15 números.');
        }
    }

    // Check if user exists by email
    const existingEmail = await authRepository.findByEmail(email);
    if (existingEmail) {
        throw new Error('El correo electrónico ya está registrado');
    }

    // Check if phone exists (if provided)
    if (telefono) {
        const existingPhone = await authRepository.findByIdentifier(telefono);
        if (existingPhone) {
            throw new Error('El número de teléfono ya está registrado');
        }
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedContraseña = await bcrypt.hash(tempPassword, salt);

    // Create user forcing a password change on first login
    const newUser = await authRepository.create({
        nombre,
        email,
        rol,
        contraseña: hashedContraseña,
        telefono,
        fecha_nacimiento,
        requiere_cambio_clave: true
    });

    // Send Welcome Email — non-blocking (registration succeeds even if email fails)
    try {
        const html = emailTemplates.getWelcomeTemplate(nombre, tempPassword);
        await emailService.sendWelcomeEmail(email, nombre, tempPassword, html);
    } catch (error) {
        console.error('[Auth] Registration email failed (non-blocking):', error.message);
    }

    // If host, initialize host profile
    if (rol === 'ANFITRION') {
        await authRepository.createProfile(newUser.id_usuario);
    }

    // Generate JWT
    const token = jwt.sign(
        { id: newUser.id_usuario, rol: newUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { contraseña: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
};

const login = async (identifier, contraseña) => {
    // Check if user exists by email or phone
    const user = await authRepository.findByIdentifier(identifier);
    if (!user) {
        throw new Error('Credenciales inválidas');
    }

    // Compare password
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
        throw new Error('Credenciales inválidas');
    }

    // Inactivity Check (30-day threshold) — skip for ADMIN to prevent lockouts
    if (user.rol !== 'ADMIN') {
        const lastConn = new Date(user.ultima_conexion || user.fecha_registro || Date.now());
        const daysInactive = (Date.now() - lastConn.getTime()) / (1000 * 60 * 60 * 24);

        if (daysInactive >= 30 || user.estado === 'SUSPENDIDO') {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await authRepository.suspendUserWithCode(user.id_usuario, code);

            // Send reactivation email — non-blocking
            try {
                const html = emailTemplates.getSuspensionReactivationTemplate(user.nombre, code);
                await emailService.sendReactivationEmail(user.email, user.nombre, html);
            } catch (error) {
                console.error('[Auth] Reactivation email failed (non-blocking):', error.message);
            }

            throw new Error('SUSPENDED_INACTIVITY');
        }
    }

    // Update last connection timestamp
    await authRepository.updateLastConnection(user.id_usuario);

    // Generate JWT including password-change flag
    const token = jwt.sign(
        { id: user.id_usuario, rol: user.rol, requiere_cambio_clave: user.requiere_cambio_clave },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { contraseña: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

const forgotPassword = async (email) => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
        throw new Error('No existe una cuenta con ese correo electrónico');
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

    // Hash and persist the new password
    const salt = await bcrypt.genSalt(10);
    const hashedContraseña = await bcrypt.hash(tempPassword, salt);
    await authRepository.updatePassword(user.id_usuario, hashedContraseña);
    await authRepository.setRequiresPasswordChange(user.id_usuario, true);

    // Send recovery email — blocking (if it fails, return error to user)
    try {
        const html = emailTemplates.getForgotPasswordTemplate(user.nombre, tempPassword);
        await emailService.sendRecoveryEmail(email, user.nombre, tempPassword, html);
        return { message: 'Contraseña temporal enviada al correo' };
    } catch (error) {
        console.error('[Auth] Recovery email failed:', error.message);
        throw new Error('Error al enviar el correo de recuperación. Intenta de nuevo en unos minutos.');
    }
};

const changePassword = async (id_usuario, currentPassword, newPassword) => {
    const user = await authRepository.findById(id_usuario);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.contraseña);
    if (!isMatch) {
        throw new Error('La contraseña actual es incorrecta');
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedContraseña = await bcrypt.hash(newPassword, salt);
    await authRepository.updatePassword(id_usuario, hashedContraseña);

    return { message: 'Contraseña actualizada exitosamente' };
};

const reactivateAccount = async (identifier, codigo) => {
    const user = await authRepository.findByIdentifier(identifier);
    if (!user) throw new Error('Usuario no encontrado');

    if (user.estado !== 'SUSPENDIDO' || !user.codigo_reactivacion) {
        throw new Error('La cuenta no requiere reactivación o código inválido');
    }

    if (user.codigo_reactivacion !== codigo) {
        throw new Error('Código de reactivación incorrecto');
    }

    await authRepository.reactivateUser(user.id_usuario);
    return { message: 'Cuenta reactivada de forma exitosa' };
};

module.exports = {
    register,
    login,
    forgotPassword,
    changePassword,
    reactivateAccount
};
