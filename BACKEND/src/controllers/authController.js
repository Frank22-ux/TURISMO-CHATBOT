const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        // identifier can be email or phone. Support 'password' from new frontend.
        const { identifier, email, phone, contraseña, password } = req.body;
        const loginValue = identifier || email || phone;
        const passwordValue = contraseña || password;

        const result = await authService.login(loginValue, passwordValue);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'El correo electrónico es requerido' });
        }
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const id_usuario = req.user.id; // from authMiddleware
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Contraseña actual y nueva contraseña son requeridas' });
        }

        const result = await authService.changePassword(id_usuario, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    changePassword
};
