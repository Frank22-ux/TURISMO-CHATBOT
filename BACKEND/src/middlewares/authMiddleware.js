const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no es válido' });
    }
};

// Optional: Decodes the token if present but does NOT block the request if missing.
// Allows revealing privileged data (e.g. meeting point) to authenticated tourists.
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (_) {
            // Invalid token — treat as unauthenticated
            req.user = null;
        }
    }
    next();
};

module.exports = { authMiddleware, optionalAuthMiddleware };
