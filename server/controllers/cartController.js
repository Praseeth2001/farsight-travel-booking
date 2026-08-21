const Cart = require('../models/Cart');
const Package = require('../models/Package');
const { emitCartUpdate } = require('../socket');

// Helper: fetch cart, populate package details, and broadcast via socket
async function respondWithCart(res, ownerId, statusCode = 200) {
  const cart = await Cart.findOne({ ownerId }).populate('items.package');
  const payload = cart
    ? { items: cart.items, totalCount: cart.totalCount, totalPrice: cart.totalPrice, ownerId }
    : { items: [], totalCount: 0, totalPrice: 0, ownerId };

  // Push the update to every open tab/device for this owner
  emitCartUpdate(ownerId, payload);

  res.status(statusCode).json(payload);
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ ownerId: req.ownerId }).populate('items.package');
    if (!cart) return res.json({ items: [], totalCount: 0, totalPrice: 0, ownerId: req.ownerId });
    res.json({ items: cart.items, totalCount: cart.totalCount, totalPrice: cart.totalPrice, ownerId: req.ownerId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart  { packageId, quantity }
exports.addToCart = async (req, res) => {
  try {
    // Guests and tourists can add to cart; owners/admins can't (they list packages, not book them)
    if (req.user && req.user.role !== 'tourist') {
      return res.status(403).json({ message: 'Only tourist accounts can add packages to cart.' });
    }

    const { packageId, quantity = 1 } = req.body;
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    let cart = await Cart.findOne({ ownerId: req.ownerId });
    if (!cart) {
      cart = new Cart({ ownerId: req.ownerId, items: [] });
    }

    const existingItem = cart.items.find((i) => i.package.toString() === packageId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        package: packageId,
        quantity: Number(quantity),
        priceAtAdd: pkg.discountPrice || pkg.price,
      });
    }

    await cart.save();
    await respondWithCart(res, req.ownerId, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/cart/item/:itemId  { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ ownerId: req.ownerId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await respondWithCart(res, req.ownerId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/item/:itemId
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ ownerId: req.ownerId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.deleteOne();
    await cart.save();
    await respondWithCart(res, req.ownerId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
