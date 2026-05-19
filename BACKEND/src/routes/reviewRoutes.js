const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/received', authMiddleware, reviewController.getReceivedReviews);
router.get('/activity/:id', reviewController.getActivityReviews);

module.exports = router;
