const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get deliveries for a specific delivery agent
router.get('/:userId', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryAgentId: req.params.userId });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deliveries', error });
  }
});

module.exports = router; 