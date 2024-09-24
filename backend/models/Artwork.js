const mongoose = require('mongoose');

// Define the Artwork schema
const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: String,  // Can be String or Number depending on how you want to store price
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,  // e.g., 'painting', 'sculpture', 'digital art'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  availability: {
    type: Boolean,
    default: true, // Indicates if it's available for sale
  }
});

// Create the Artwork model using the schema
const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;
