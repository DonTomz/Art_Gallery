const express = require('express');
const Artwork = require('../models/Artwork');

const router = express.Router();

// POST route to add artwork
router.post('/add-artwork', async (req, res) => {
  const { title, artist, description, price, imageUrl, category } = req.body;

  try {
    const newArtwork = new Artwork({
      title,
      artist,
      description,
      price,
      imageUrl,
      category,
      availability: true,  // Default is available
    });
    
    await newArtwork.save();
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add artwork', error });
  }
});

module.exports = router;
