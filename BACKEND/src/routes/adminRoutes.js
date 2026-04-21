const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware to check if user is ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
    }
};

router.get('/stats', authMiddleware, isAdmin, adminController.getGlobalStats);
router.get('/users', authMiddleware, isAdmin, adminController.getAllUsers);
router.get('/activities', authMiddleware, isAdmin, adminController.getAllActivities);
router.get('/recent-activity', authMiddleware, isAdmin, adminController.getRecentActivity);
router.get('/financial-report', authMiddleware, isAdmin, adminController.getFinancialReport);
router.get('/reviews', authMiddleware, isAdmin, adminController.getAllReviews);
router.get('/hosts/:id/documents', authMiddleware, isAdmin, adminController.getHostDocuments);

router.patch('/users/:id/status', authMiddleware, isAdmin, adminController.updateUserStatus);
router.patch('/users/:id/verification', authMiddleware, isAdmin, adminController.updateVerification);
router.patch('/activities/:type/:id/status', authMiddleware, isAdmin, adminController.updateActivityStatus);
router.patch('/reviews/:type/:id/visibility', authMiddleware, isAdmin, adminController.updateReviewVisibility);

module.exports = router;
