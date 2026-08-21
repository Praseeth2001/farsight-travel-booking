const Review = require('../models/Review');
const Order = require('../models/Order');
const Package = require('../models/Package');

// Recomputes a package's average rating and review count from its actual reviews.
// Called after every create so Package.rating never drifts out of sync.
async function recalculatePackageRating(packageId) {
  const stats = await Review.aggregate([
    { $match: { package: packageId } },
    { $group: { _id: '$package', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Package.findByIdAndUpdate(packageId, {
    rating: Math.round(avgRating * 10) / 10, // one decimal place
    reviewCount: count,
  });
}

// POST /api/reviews  { packageId, orderId, rating, comment }
// Only a tourist with a 'booked' order containing this package can review it,
// and only once per package.
exports.createReview = async (req, res) => {
  try {
    const { packageId, orderId, rating, comment } = req.body;

    if (!packageId || !orderId || !rating) {
      return res.status(400).json({ message: 'packageId, orderId, and rating are required.' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id, status: 'booked' });
    if (!order) {
      return res.status(403).json({ message: 'No matching booking found for this order.' });
    }

    const hasPackage = order.items.some((item) => item.package.toString() === packageId);
    if (!hasPackage) {
      return res.status(403).json({ message: 'You can only review packages you have booked.' });
    }

    const review = await Review.create({
      user: req.user.id,
      package: packageId,
      order: orderId,
      rating,
      comment,
    });

    await recalculatePackageRating(packageId);

    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this package.' });
    }
    res.status(400).json({ message: err.message });
  }
};

// GET /api/packages/:packageId/reviews
exports.getPackageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ package: req.params.packageId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
