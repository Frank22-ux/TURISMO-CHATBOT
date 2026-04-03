const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/host', authMiddleware, reservationController.getHostReservations);
router.post('/', authMiddleware, reservationController.createReservation);
router.post('/package', authMiddleware, reservationController.createPackageReservation);
router.put('/:id/status', authMiddleware, reservationController.updateStatus);
router.post('/validate-qr', authMiddleware, reservationController.validateQR);
router.post('/:id/cancel', authMiddleware, reservationController.cancelReservation);

module.exports = router;
