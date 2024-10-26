require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const Order = require('../models/Order')

const router = express.Router();

// Initialize Razorpay with your credentials
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,        // Key ID from your .env file
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Key Secret from your .env file
});

// Route to create an order
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body; // Amount in INR (Razorpay accepts amount in paise)
  try {
    const options = {
      amount: amount * 100, // Amount in paise (e.g., 10 INR = 1000 paise)
      currency: currency || 'INR', 
      receipt: `receipt_order_${Math.random() * 10}`, 
    };
    
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order); // Send order details to the frontend
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});

// Add this new route to create an order
router.post('/orders', async (req, res) => {
  try {
    const { userId, userEmail, userName, address, phoneNumber, artworks, totalPrice } = req.body;

    if (!userId || !userEmail || !userName || !address || !phoneNumber || !artworks || !totalPrice) {
      return res.status(400).json({ message: 'Select address' });
    }

    // Create new order
    const newOrder = new Order({
      userId,
      userEmail,
      userName,
      address,
      phoneNumber,
      artworks,
      totalPrice,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    // console.log(savedOrder)

    res.status(201).json({ id: savedOrder._id, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Add this new route to update an order
router.put('/orders/:id', async (req, res) => {
  console.log(req.body)
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

// Updated route for order updates (using PATCH)
router.patch('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Apply the updates
    Object.keys(updates).forEach((key) => {
      if (key in order) {
        order[key] = updates[key];
      }
    });

    // Save the updated order
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// Get all orders for a specific user
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .populate('artworks.artworkId', 'title price'); // Populate artwork details

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

module.exports = router;
