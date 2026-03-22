const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/host', authMiddleware, reservationController.getHostReservations);
router.put('/:id/status', authMiddleware, reservationController.updateStatus);

module.exports = router;
