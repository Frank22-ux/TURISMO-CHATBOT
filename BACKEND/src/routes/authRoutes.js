const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.put('/change-password', authMiddleware, authController.changePassword);

router.post('/reactivate-account', authController.reactivateAccount);

module.exports = router;
