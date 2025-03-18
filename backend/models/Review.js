const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  artworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a user can only review an order once
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 