const express = require('express');
const Artwork = require('../models/Artwork');
const multer = require('multer');
const path = require('path');
const Cartdata = require('../models/Cartdata');
const User = require('../models/User');

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
    const { title, artist, description, price, category,stock, artistId } = req.body;

    
    // Get the image path if an image is uploaded
    const imageUrl = req.file ? `${req.file.filename}` : '';

    // Create new artwork with the imageUrl
    const artwork = new Artwork({
      title,
      artist,
      description,
      price,
      category,
      imageUrl, 
      stock,
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
    const category = req.params.category;
    const artworks = await Artwork.find({ category, show: true });
    
    if (!artworks || artworks.length === 0) {
      return res.status(404).json({ message: 'No artworks found for this category' });
    }

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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



// Route to get all artworks uploaded by the logged-in artist
router.get('/mine/:id',  async (req, res) => {
  const artistId = req.params.id;
  try {
     // Assuming `req.user` has the logged-in artist's ID
    console.log(artistId)

    // Find artworks uploaded by the artist
    const artworks = await Artwork.find({ artistId: artistId });

    if (artworks.length === 0) {
      return res.status(404).json({ message: 'No artworks found for this artist' });
    }

    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks', error });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    
    // Handle invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid artwork ID format' });
    }

    res.status(500).json({ message: 'Error fetching artwork', error: error.message });
  }
});

module.exports = router;

// Edit artwork route
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
    };

    // If a new image was uploaded, update the imageUrl
    if (req.file) {
      updateData.imageUrl = req.file.filename;
    }

    // Find and update the artwork
    const artwork = await Artwork.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return updated document and run schema validators
    );

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.json(artwork);
  } catch (error) {
    console.error('Error updating artwork:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid artwork ID format' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }

    res.status(500).json({ message: 'Error updating artwork', error: error.message });
  }
});




router.post('/cart/add', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;
  try {
    // First, fetch the artwork to check the artist
    const artwork = await Artwork.findById(artworkId);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if the logged-in user is the artist of the artwork
    if (artwork.artistId === userId) {
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
    console.error('Error updating quantity:', error); // Log the exact error
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
  console.log(req.body)

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
  try {
    const userId = req.params.userId;
    // Clear the cart for the user
    await Cartdata.deleteMany({ userId: userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error });
  }
});

module.exports = router;
