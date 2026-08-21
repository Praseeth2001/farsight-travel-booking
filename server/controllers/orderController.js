const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Package = require('../models/Package');
const { emitCartUpdate } = require('../socket');

// POST /api/orders/checkout — converts the logged-in tourist's cart into a booked order.
// No real payment integration; this just marks the order as 'booked'.
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ ownerId: req.user.id }).populate('items.package');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Snapshot each item with its package's current owner, so "bookings received"
    // queries never need to join back through Package later.
    const orderItems = cart.items.map((item) => ({
      package: item.package._id,
      owner: item.package.owner,
      quantity: item.quantity,
      priceAtBooking: item.priceAtAdd,
    }));

    const totalPrice = orderItems.reduce((sum, i) => sum + i.quantity * i.priceAtBooking, 0);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      status: 'booked',
    });

    // Clear the cart now that it's been converted into a booking
    cart.items = [];
    await cart.save();

    // Push the now-empty cart to every open tab for this user
    emitCartUpdate(req.user.id, { items: [], totalCount: 0, totalPrice: 0, ownerId: req.user.id });

    const populatedOrder = await order.populate('items.package', 'title images duration location');
    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/mine — tourist's own booking history
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.package', 'title images duration location')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/received — owner's view of bookings made on their packages.
// Reshapes results to line-item level (one entry per booked item) since a single
// order can contain packages from multiple owners, and each owner should only see their own.
exports.getReceivedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.owner': req.user.id })
      .populate('items.package', 'title images duration location')
      .populate('user', 'name email')
      .sort('-createdAt');

    const receivedItems = [];
    orders.forEach((order) => {
      order.items
        .filter((item) => item.owner.toString() === req.user.id)
        .forEach((item) => {
          receivedItems.push({
            orderId: order._id,
            orderedAt: order.createdAt,
            status: order.status,
            customer: order.user,
            package: item.package,
            quantity: item.quantity,
            priceAtBooking: item.priceAtBooking,
          });
        });
    });

    res.json(receivedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
