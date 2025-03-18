const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: [String], required: true }, // Store multiple image URLs
  show: { type: Boolean, default: true },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Artwork", artworkSchema);
