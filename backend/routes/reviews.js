const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const auth = require('../middleware/auth');

// Create a new review
router.post('/create', auth, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or does not belong to you' });
    }

    // Check if order is delivered
    if (order.deliveryStatus !== 'Delivered') {
      return res.status(400).json({ message: 'You can only review delivered orders' });
    }

    // Check if user has already reviewed this order
    const existingReview = await Review.findOne({ userId, orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    // Create reviews for each artwork in the order
    const reviews = [];
    for (const item of order.artworks) {
      const artworkId = item.artworkId;
      
      // Create the review
      const review = new Review({
        userId,
        orderId,
        artworkId,
        rating,
        comment
      });

      await review.save();
      reviews.push(review);

      // Update artwork average rating
      await updateArtworkRating(artworkId);
    }

    res.status(201).json(reviews[0]); // Return the first review for simplicity
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reviews by a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure user can only access their own reviews
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const reviews = await Review.find({ userId })
      .populate('artworkId', 'title images')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reviews for an artwork
router.get('/artwork/:artworkId', async (req, res) => {
  try {
    const artworkId = req.params.artworkId;
    const reviews = await Review.find({ artworkId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching artwork reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific review
router.get('/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId)
      .populate('userId', 'username profilePic')
      .populate('artworkId', 'title images');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the user
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();

    // Update artwork average rating
    await updateArtworkRating(review.artworkId);

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the user
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update artwork average rating
    await updateArtworkRating(review.artworkId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update artwork rating
async function updateArtworkRating(artworkId) {
  try {
    const reviews = await Review.find({ artworkId });
    
    if (reviews.length === 0) {
      await Artwork.findByIdAndUpdate(artworkId, { 
        averageRating: 0,
        reviewCount: 0 
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Artwork.findByIdAndUpdate(artworkId, { 
      averageRating: averageRating.toFixed(1),
      reviewCount: reviews.length 
    });
  } catch (error) {
    console.error('Error updating artwork rating:', error);
  }
}

module.exports = router; 