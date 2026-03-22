const express = require('express');
const router = express.Router();
const touristController = require('../controllers/touristController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/dashboard-stats', authMiddleware, touristController.getDashboardStats);
router.get('/reservations', authMiddleware, touristController.getMyReservations);
router.get('/profile', authMiddleware, touristController.getProfile);
router.put('/profile', authMiddleware, touristController.updateProfile);

module.exports = router;
