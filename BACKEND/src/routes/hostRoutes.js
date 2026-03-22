const express = require('express');
const router = express.Router();
const hostController = require('../controllers/hostController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/profile', authMiddleware, hostController.getProfile);
router.put('/profile', authMiddleware, hostController.updateProfile);
router.get('/activities', authMiddleware, hostController.getMyActivities);
router.post('/activities', authMiddleware, hostController.createActivity);
router.get('/activities/:id', authMiddleware, hostController.getActivityDetails);
router.put('/activities/:id', authMiddleware, hostController.updateActivity);
router.delete('/activities/:id', authMiddleware, hostController.deleteActivity);
router.put('/activities/:id/status', authMiddleware, hostController.updateActivityStatus);

router.get('/services', authMiddleware, hostController.getMyServices);
router.get('/services/:id', authMiddleware, hostController.getServiceDetails);
router.post('/services', authMiddleware, hostController.createService);
router.put('/services/:id', authMiddleware, hostController.updateService);
router.delete('/services/:id', authMiddleware, hostController.deleteService);
router.put('/services/:id/status', authMiddleware, hostController.updateServiceStatus);

// Reservations (Delegated to reservationController)
const reservationController = require('../controllers/reservationController');
router.get('/reservations', authMiddleware, reservationController.getHostReservations);
router.put('/reservations/:id/status', authMiddleware, reservationController.updateStatus);

router.get('/dashboard-stats', authMiddleware, hostController.getDashboardStats);

module.exports = router;
