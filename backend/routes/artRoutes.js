const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork'); // Assuming you've defined the Artwork model

// Add new artwork
router.post('/', async (req, res) => {
  const { title, artist, description, price, category, imageUrl } = req.body;
  
  try {
    const newArtwork = new Artwork({
      title,
      artist,
      description,
      price,
      category,
      imageUrl,
    });
    
    const savedArtwork = await newArtwork.save();
    res.status(201).json(savedArtwork);
  } catch (error) {
    res.status(500).json({ message: 'Error adding artwork', error });
  }
});

module.exports = router;
