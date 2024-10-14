const express = require('express');
const Artwork = require('../models/Artwork');
const multer = require('multer');
const path = require('path');
const Cartdata = require('../models/Cartdata');

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
    const { title, artist, description, price, category, artistId } = req.body;

    
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
      artistId
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

router.post('/cart/add', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;
  console.log(req.body)

  try {
    let cart = await Cartdata.findOne({ userId });
    
    if (!cart) {
      cart = new Cartdata({ userId, items: [{ artworkId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);
      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ artworkId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});



router.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const cart = await Cartdata.findOne({ userId }).populate('items.artworkId');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});


router.post('/cart/update-quantity', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;

  try {
    let cart = await Cartdata.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);
    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

router.delete('/cart/remove', async (req, res) => {
  const { userId, artworkId } = req.body;

  try {
    let cart = await Cartdata.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.artworkId.toString() !== artworkId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Error removing item' });
  }
});


module.exports = router;
