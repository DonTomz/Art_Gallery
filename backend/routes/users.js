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

module.exports = router;
