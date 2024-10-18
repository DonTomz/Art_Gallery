const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title:{ 
    type: String,
    required: true 
  },
  artist: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  stock: {
    type: Number, // New stock field
    required: true,
    min: 0 // Ensures that stock cannot be negative
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const Artwork = mongoose.model('Artwork', artworkSchema);  // <-- Changed to 'Artwork'

module.exports = Artwork;
