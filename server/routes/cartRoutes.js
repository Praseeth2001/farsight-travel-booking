const express = require('express');
const router = express.Router();
const resolveOwner = require('../middleware/resolveOwner');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');

router.use(resolveOwner); // attaches req.ownerId to every cart request

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeCartItem);

module.exports = router;
