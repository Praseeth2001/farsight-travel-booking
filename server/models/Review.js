const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // proof of a completed booking
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per package
reviewSchema.index({ user: 1, package: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
