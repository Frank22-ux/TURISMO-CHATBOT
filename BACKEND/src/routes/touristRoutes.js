const express = require('express');
const router = express.Router();
const touristController = require('../controllers/touristController');
const reservationController = require('../controllers/reservationController');
const paymentController = require('../controllers/paymentController');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/dashboard-stats', authMiddleware, touristController.getDashboardStats);
router.get('/notifications', authMiddleware, notificationController.getTouristNotifications);
router.get('/payments', authMiddleware, paymentController.getTouristPayments);
router.get('/reservations', authMiddleware, touristController.getMyReservations);
router.post('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);
router.get('/profile', authMiddleware, touristController.getProfile);
router.put('/profile', authMiddleware, touristController.updateProfile);
router.put('/profile/bank', authMiddleware, touristController.updateBankProfile);

module.exports = router;
