const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { createReview, getPackageReviews } = require('../controllers/reviewController');

router.post('/', protect, restrictTo('tourist'), createReview);
router.get('/package/:packageId', getPackageReviews); // public

module.exports = router;
