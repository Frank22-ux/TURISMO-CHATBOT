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

module.exports = {
    register,
    login
};
