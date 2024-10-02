const express = require('express');
const User = require('../models/User');
const Artist = require('../models/Artist'); // Assuming you have an Artist model

const router = express.Router();

// Get all users and artists
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    const artists = await Artist.find();
    res.status(200).json({users , artists});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Get all artists
router.get('/artists', async (req, res) => {
  try {
    const artists = await Artist.find();
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artists', error });
  }
});

// Approve an artist
router.put('/artists/approve/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    artist.isApproved = true; // Assuming you have an `isApproved` field in the Artist model
    await artist.save();

    res.status(200).json({ message: 'Artist approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving artist', error });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

module.exports = router;
