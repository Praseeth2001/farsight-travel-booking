const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // denormalized for fast "bookings received" queries
    quantity: { type: Number, required: true, min: 1 },
    priceAtBooking: { type: Number, required: true },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ 'items.owner': 1 });

module.exports = mongoose.model('Order', orderSchema);
