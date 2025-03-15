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

    // Validate and ensure each artwork has an artworkType
    const validatedArtworks = artworks.map(artwork => ({
      ...artwork,
      artworkType: artwork.artworkType || 'original' // Provide default if not specified
    }));

    // Log the validated artworks for debugging
    console.log('Validated artworks:', validatedArtworks);

    // Create new order with validated artworks
    const newOrder = new Order({
      userId,
      userEmail,
      userName,
      address,
      phoneNumber,
      artworks: validatedArtworks,
      totalPrice,
      status: 'Pending'
    });

    // Log the new order for debugging
    console.log('New order before save:', newOrder);

    const savedOrder = await newOrder.save();
    res.status(201).json({ id: savedOrder._id, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    // Send more detailed error information
    res.status(500).json({ 
      message: 'Error creating order', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
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
    
    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create update object
    const updateData = {};

    // Handle status update
    if (req.body.status) {
      updateData.status = req.body.status;
      if (req.body.status === 'Cancelled') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = req.body.reason || 'Cancelled by user';
      }
    }

    // Handle delivery status update
    if (req.body.deliveryStatus) {
      updateData.deliveryStatus = req.body.deliveryStatus;
      // Only add tracking details if not cancelling
      if (req.body.deliveryStatus !== 'Cancelled') {
        updateData.$push = {
          trackingDetails: {
            status: req.body.deliveryStatus,
            location: req.body.location || 'Current Location',
            description: `Package ${req.body.deliveryStatus.toLowerCase()}`,
            timestamp: new Date()
          }
        };
      }
    }

    // If no valid update parameters
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'No valid update parameters provided'
      });
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ 
      message: 'Error updating order', 
      error: error.message 
    });
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

// Add this new route to get tracking details
router.get('/orders/:orderId/tracking', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Simulate fetching tracking details from courier partner API
    const trackingInfo = {
      orderId: order._id,
      trackingId: order.trackingId,
      courierPartner: order.courierPartner,
      currentStatus: order.deliveryStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      trackingDetails: order.trackingDetails,
    };

    res.json(trackingInfo);
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    res.status(500).json({ message: 'Error fetching tracking details' });
  }
});

// Get unassigned orders
router.get('/orders/unassigned', async (req, res) => {
  try {
    const orders = await Order.find({ 
      deliveryPartnerId: { $exists: false },  // No delivery partner assigned
      status: 'Paid',                         // Order is paid
      deliveryStatus: { $ne: 'Delivered' }    // Not yet delivered
    }).populate('artworks');                  // Include artwork details
    
    console.log('Fetched unassigned orders:', orders); // Debug log
    res.json(orders);
  } catch (error) {
    console.error('Error fetching unassigned orders:', error);
    res.status(500).json({ message: 'Error fetching unassigned orders' });
  }
});

// Get orders assigned to a delivery partner
router.get('/orders/delivery/:deliveryPartnerId', async (req, res) => {
  try {
    const orders = await Order.find({ 
      deliveryPartnerId: req.params.deliveryPartnerId,
      status: 'Paid'
    }).populate('artworks');
    
    console.log('Fetched delivery partner orders:', orders); // Debug log
    res.json(orders);
  } catch (error) {
    console.error('Error fetching delivery partner orders:', error);
    res.status(500).json({ message: 'Error fetching delivery partner orders' });
  }
});

// Assign order to delivery partner
router.post('/orders/:orderId/assign', async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        deliveryPartnerId,
        deliveryStatus: 'Picked up',
        trackingDetails: [{
          status: 'Picked up',
          location: 'Warehouse',
          description: 'Order picked up by delivery partner',
          timestamp: new Date()
        }]
      },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({ message: 'Error assigning order' });
  }
});

// Get all orders
router.get('/orders/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('artworks.artworkId')
      .sort({ createdAt: -1 });
    
    console.log('Fetched all orders:', orders);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get all orders directly from Order model
router.get('/orders/fetch', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'artworks.artworkId',
        select: 'title price'  // Only get necessary artwork fields
      })
      .select({
        _id: 1,
        userName: 1,
        address: 1,
        phoneNumber: 1,
        totalPrice: 1,
        status: 1,
        deliveryStatus: 1,
        artworks: 1,
        createdAt: 1,
        deliveryPartnerId: 1
      })
      .sort({ createdAt: -1 });

    console.log('Orders fetched from database:', orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Database fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch orders from database' });
  }
});

module.exports = router;
