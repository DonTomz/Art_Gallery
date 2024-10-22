const express = require('express');
const User = require('../models/User');
const Artwork = require('../models/Artwork')

const router = express.Router();

// Get all users and artists based on role
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    const artists = await User.find({ role: 'artist' });  // Fetch artists from the same User model
    res.status(200).json({ users, artists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users or artists', error });
  }
});

// Approve an artist (single model approach)
router.put('/artist/approve/:id', async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') {
      return res.status(404).json({ message: 'Artist not found' });
    }

    artist.isApproved = true;
    await artist.save();

    res.status(200).json({ message: 'Artist approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving artist', error });
  }
});

// Disapprove an artist (single model approach)
router.put('/artist/disapprove/:id', async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') {
      return res.status(404).json({ message: 'Artist not found' });
    }

    artist.isApproved = false;
    await artist.save();

    res.status(200).json({ message: 'Artist approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving artist', error });
  }
});

// Block a user (generalized for any role)
router.put('/user/block/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlock = true;
    await user.save();

    res.status(200).json({ message: 'User account blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error });
  }
});

// Unblock a user (generalized for any role)
router.put('/user/unblock/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlock = false;
    await user.save();

    res.status(200).json({ message: 'User account unblocked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error });
  }
});

// Get all artworks
router.get('/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks' });
  }
});

// Toggle artwork visibility on homepage
router.put('/artworks/togglehomepage/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    artwork.show = !artwork.show; // Toggle the field
    await artwork.save();

    res.status(200).json({ message: 'Artwork visibility updated', artwork });
  } catch (error) {
    res.status(500).json({ message: 'Error updating artwork visibility', error });
  }
});


module.exports = router;