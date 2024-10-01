const express = require('express');
const Artwork = require('../models/Artwork');

const router = express.Router();

// Route to insert artwork
router.post('/add', async (req, res) => {
  try {
    const artwork = new Artwork(req.body);
    await artwork.save();
    res.status(201).json({ message: 'Artwork added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add artwork' });
  }
});

// Route to fetch all artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

module.exports = router;
