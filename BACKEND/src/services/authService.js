const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

const register = async (userData) => {
    const { nombre, email, rol, contraseña, telefono, fecha_nacimiento } = userData;
    
    // Server-side validation for phone number
    if (telefono) {
        // Regex: ensures it starts with + and has 7-15 digits after prefix
        const phoneRegex = /^\+[0-9]{7,18}$/;
        if (!phoneRegex.test(telefono)) {
            throw new Error('Formato de teléfono inválido. Debe incluir prefijo y entre 7 a 15 números.');
        }
    }
    
    // Server-side validation for password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(contraseña)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedContraseña = await bcrypt.hash(contraseña, salt);

    // Create user
    const newUser = await authRepository.create({
        nombre,
        email,
        rol,
        contraseña: hashedContraseña,
        telefono,
        fecha_nacimiento
    });

    // If host, initialize profile
    if (rol === 'ANFITRION') {
        await authRepository.createProfile(newUser.id_usuario);
    }

    // Generate token
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

    // Generate token
    const token = jwt.sign(
        { id: user.id_usuario, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { contraseña: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

module.exports = {
    register,
    login
};
