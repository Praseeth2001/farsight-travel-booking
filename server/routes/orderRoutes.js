const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { checkout, getMyOrders, getReceivedOrders } = require('../controllers/orderController');

router.post('/checkout', protect, restrictTo('tourist'), checkout);
router.get('/mine', protect, restrictTo('tourist'), getMyOrders);
router.get('/received', protect, restrictTo('owner'), getReceivedOrders);

module.exports = router;
