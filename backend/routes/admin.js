const express = require('express');
const User = require('../models/User'); // Assuming the model now handles all users, artists, and admins

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
router.put('/artists/approve/:id', async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') {
      return res.status(404).json({ message: 'Artist not found' });
    }

    artist.isApproved = true;  // Assuming you have `isApproved` in the unified User model
    await artist.save();

    res.status(200).json({ message: 'Artist approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving artist', error });
  }
});

// Delete a user (generalized for any role)
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
