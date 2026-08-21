const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const resolveOwner = require('../middleware/resolveOwner');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');

// optionalAuth attaches req.user if a valid token is present (logged-in tourist),
// then resolveOwner uses req.user.id if available, otherwise falls back to the guest cookie
router.use(optionalAuth, resolveOwner);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeCartItem);

module.exports = router;
