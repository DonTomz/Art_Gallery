const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to update user profile
router.put('/:userId', upload.fields([{ name: 'profilePic' }, { name: 'artistDocument' }]), async (req, res) => {
  const { userId } = req.params;
  const { username, email, phoneNumber, artistDescription } = req.body;
  console.log(req.body)
  try {
    const updatedData = { username, email, phoneNumber };

    // If profile picture is provided, update it
    if (req.files && req.files.profilePic) {
      updatedData.profilePic = req.files.profilePic[0].filename;
    }
    // If artist, update description and document
    if (req.body.artistDescription) {
      updatedData.artistDescription = artistDescription;
      if (req.files && req.files.artistDocument) {
        updatedData.artistDocument = req.files.artistDocument[0].filename;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Route to fetch user data by userId
router.get('/get/:userId', async (req, res) => {
    const { userId } = req.params;
    // console.log(req.params)
  
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });

  // Get saved addresses for a user
router.get('/:userId/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error });
  }
});
  
// Save a new address for a user
router.post('/:userId/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.addresses = user.addresses || [];
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ message: 'Error saving address', error });
  }
});



// Edit address
router.put('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...updatedAddress };
    await user.save();

    res.status(200).json(user.addresses[addressIndex]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});



// Delete address
router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    await user.save();

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});

module.exports = router;
