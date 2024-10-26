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




// router.post('/cart/add', async (req, res) => {
//   const { userId, artworkId, quantity } = req.body;
//   try {
//     let cart = await Cartdata.findOne({ userId });
    
//     if (!cart) {
//       cart = new Cartdata({ userId, items: [{ artworkId, quantity }] });
//     } else {
//       const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);
//       if (itemIndex !== -1) {
//         cart.items[itemIndex].quantity += quantity;
//       } else {
//         cart.items.push({ artworkId, quantity });
//       }
//     }
//     await cart.save();
//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding to cart' });
//   }
// });

router.post('/cart/add', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;
  try {
    let cart = await Cartdata.findOne({ userId });

    if (!cart) {
      // If the cart doesn't exist, create a new one and add the item
      cart = new Cartdata({ userId, items: [{ artworkId, quantity }] });
    } else {
      // Find if the item is already in the cart
      const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);

      if (itemIndex !== -1) {
        // If the item is found in the cart, send a message indicating it is already in the cart
        return res.status(200).json({ message: 'Artwork already in the cart' });
      } else {
        // If the item is not in the cart, add it
        cart.items.push({ artworkId, quantity });
      }
    }

    // Save the cart after adding the new item
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
