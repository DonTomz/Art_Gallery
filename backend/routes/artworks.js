const express = require('express');
const Artwork = require('../models/Artwork');
const multer = require('multer');
const path = require('path');
const Cartdata = require('../models/Cartdata');
const User = require('../models/User');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const upload = require('../config/multerStorage')

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with original extension
  }
});



// Route to insert artwork with image upload
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const { title, artist, description, price, category, stock, artistId } = req.body;

    // Extract uploaded image URLs from Cloudinary
    const imageUrls = req.files.map((file) => file.path);

    const newArtwork = new Artwork({
      title,
      artist,
      description,
      price,
      category,
      stock,
      artistId,
      imageUrl: imageUrls, // Store image URLs in the database
    });

    await newArtwork.save();
    res.status(201).json({ message: "Artwork added successfully", artwork: newArtwork });
  } catch (error) {
    console.error("Error adding artwork:", error);
    res.status(500).json({ error: "Failed to add artwork" });
  }
});

// Route to fetch artworks where show is true
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find({ show: true }); // Fetch only artworks where show is true
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get artworks by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category; // This should be a string
    const artworks = await Artwork.find({ category, show: true }); // Ensure category is treated as a string

    if (!artworks || artworks.length === 0) {
      return res.status(404).json({ message: 'No artworks found for this category' });
    }

    res.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get artwork by ID
router.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid artwork ID format' });
  }

  try {
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ message: 'Error fetching artwork', error: error.message });
  }
});

// Route to get all artworks uploaded by the logged-in artist
router.get('/mine/:id', async (req, res) => {
  const artistId = req.params.id;
  if (!mongoose.isValidObjectId(artistId)) {
    return res.status(400).json({ message: 'Invalid artist ID format' });
  }

  try {
    const artworks = await Artwork.find({ artistId: artistId });

    if (artworks.length === 0) {
      return res.status(404).json({ message: 'No artworks found for this artist' });
    }

    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks', error });
  }
});

// Route to update artwork
router.put('/edit/:id', upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid artwork ID format' });
  }

  try {
    const updateData = {
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
    };

    // Get the image paths if images are uploaded
    if (req.files) {
      const imageUrls = req.files.map((file) => file.path);
      updateData.imageUrl = imageUrls; // Update imageUrl to the new array of images
    }

    // Update the artwork in the database
    const updatedArtwork = await Artwork.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedArtwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.status(200).json({ message: 'Artwork updated successfully!', artwork: updatedArtwork });
  } catch (error) {
    console.error('Error updating artwork:', error.message);
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});

// Route to add artwork to cart
router.post('/cart/add', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;
  try {
    // Validate ObjectId
    if (!mongoose.isValidObjectId(artworkId)) {
      return res.status(400).json({ message: 'Invalid artwork ID format' });
    }

    // First, fetch the artwork to check the artist
    const artwork = await Artwork.findById(artworkId);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if the logged-in user is the artist of the artwork
    if (artwork.artistId.toString() === userId) {
      return res.status(403).json({ 
        message: 'You cannot purchase your own artwork',
        error: 'SELF_PURCHASE_DENIED'
      });
    }

    // Continue with cart operations if the user is not the artist
    let cart = await Cartdata.findOne({ userId });

    if (!cart) {
      // If the cart doesn't exist, create a new one and add the item
      cart = new Cartdata({ userId, items: [{ artworkId, quantity }] });
    } else {
      // Find if the item is already in the cart
      const itemIndex = cart.items.findIndex(item => 
        item.artworkId.toString() === artworkId
      );

      if (itemIndex !== -1) {
        // If the item is found in the cart, send a message indicating it is already in the cart
        return res.status(200).json({ 
          message: 'Artwork already in the cart',
          error: 'ALREADY_IN_CART'
        });
      } else {
        // If the item is not in the cart, add it
        cart.items.push({ artworkId, quantity });
      }
    }

    // Save the cart
    await cart.save();
    
    res.status(200).json({ 
      message: 'Artwork added to cart successfully',
      cart 
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Error adding artwork to cart', 
      error: error.message 
    });
  }
});

// Route to get the user's cart
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

// Route to update quantity in cart
router.post('/cart/update-quantity', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;

  try {
    // Validate ObjectId
    if (!mongoose.isValidObjectId(artworkId)) {
      return res.status(400).json({ message: 'Invalid artwork ID format' });
    }

    // Fetch the artwork to check stock availability
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      console.error('Artwork not found');
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if requested quantity exceeds available stock
    if (quantity > artwork.stock) {
      return res.status(400).json({ message: `Only ${artwork.stock} items available in stock` });
    }

    // Find the user's cart
    let cart = await Cartdata.findOne({ userId });
    if (!cart) {
      console.error('Cart not found for user:', userId);
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);
    if (itemIndex !== -1) {
      // Update the quantity of the item
      cart.items[itemIndex].quantity = quantity;
      await cart.save(); 
      console.log('Cart updated successfully');
      res.status(200).json(cart);
    } else {
      console.error('Item not found in cart for artworkId:', artworkId);
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// Route to remove item from cart
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

// Route to get the count of items in the user's cart
router.get('/cart/count/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the cart for the user
    const cart = await Cartdata.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ count: 0 }); // No cart found, return count as 0
    }

    // Calculate the total count of items in the cart
    const totalCount = cart.items.length;
    
    res.status(200).json({ count: totalCount });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.status(500).json({ message: 'Error fetching cart count' });
  }
});

// POST: Add to wishlist
router.post('/wishlist/add', async (req, res) => {
  const { userId, artworkId } = req.body;
  console.log(req.body);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the artwork is already in the wishlist
    if (user.wishlist.includes(artworkId)) {
      return res.status(400).json({ message: 'Artwork already in wishlist' });
    }

    // Add the artwork to the user's wishlist
    user.wishlist.push(artworkId);
    await user.save();

    res.status(200).json({ message: 'Artwork added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Fetch wishlist for a user
router.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId).populate('wishlist'); // Populate the wishlist with artwork details

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user's wishlist
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST: Remove artwork from wishlist
router.post('/wishlist/remove', async (req, res) => {
  const { userId, artworkId } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the artwork is in the wishlist
    const artworkIndex = user.wishlist.indexOf(artworkId);
    if (artworkIndex === -1) {
      return res.status(400).json({ message: 'Artwork not in wishlist' });
    }

    // Remove the artwork from the wishlist
    user.wishlist.splice(artworkIndex, 1); // Remove the artwork by its index
    await user.save();

    res.status(200).json({ message: 'Artwork removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to clear the cart for a user
router.delete('/cart/clear/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    // Clear the cart for the user
    await Cartdata.deleteMany({ userId: userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error });
  }
});

// Route to fetch all categories
router.get('/category', async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories
    res.status(200).json(categories); // Send categories as response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

module.exports = router;