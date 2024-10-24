require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');

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
      currency: currency || 'INR', // Currency (Default: INR)
      receipt: `receipt_order_${Math.random() * 10}`, // Unique order receipt ID
    };
    
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order); // Send order details to the frontend
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});

module.exports = router;
