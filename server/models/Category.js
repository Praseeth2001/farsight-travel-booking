const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String }, // icon class or image URL
    image: { type: String }, // banner/thumbnail image
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
