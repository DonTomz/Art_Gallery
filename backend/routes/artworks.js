const express = require('express');
const Artwork = require('../models/Artwork');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname ,'../uploads/')); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with original extension
  }
});

const upload = multer({ storage: storage });

// Route to insert artwork with image upload
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { title, artist, description, price, category } = req.body;
    
    // Get the image path if an image is uploaded
    const imageUrl = req.file ? `${req.file.filename}` : '';

    // Create new artwork with the imageUrl
    const artwork = new Artwork({
      title,
      artist,
      description,
      price,
      category,
      imageUrl, // Save image URL in the database
    });

    // Save the artwork to the database
    await artwork.save();

    res.status(201).json({ message: 'Artwork added successfully!', artwork });
  } catch (error) {
    console.error('Error adding artwork:', error);
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

// Get artworks by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const artworks = await Artwork.find({ category: category });
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks', error });
  }
});

router.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const artwork = await Artwork.findById(id);
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: 'Artwork not found' });
  }
});

module.exports = router;
