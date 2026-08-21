const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    priceAtAdd: { type: Number, required: true },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    // ownerId works for both logged-in users (userId) and guests (sessionId from cookie)
    ownerId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Virtual to compute total count/price on the fly
cartSchema.virtual('totalCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.priceAtAdd, 0);
});

cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
