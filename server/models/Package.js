const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    duration: { type: String }, // e.g. "5 Days / 4 Nights"
    location: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    rejectionReason: { type: String }, // set by admin on reject, shown to owner
    itinerary: [itineraryDaySchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }, // powers homepage carousel
    availableSeats: { type: Number, default: 20 },
  },
  { timestamps: true }
);

packageSchema.index({ category: 1 });
packageSchema.index({ isFeatured: 1 });
packageSchema.index({ owner: 1 });
packageSchema.index({ status: 1 });

module.exports = mongoose.model('Package', packageSchema);
