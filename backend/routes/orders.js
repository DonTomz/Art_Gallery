const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Log that the route file is loaded
console.log('Orders routes loaded');

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Orders route is working' });
});

// Get all orders
router.get('/all', async (req, res) => {
  console.log('GET /all route hit');
  try {
    const orders = await Order.find()
      .populate({
        path: 'artworks.artworkId',
        select: 'title price imageUrl'
      })
      .lean();

    console.log(`Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('artworks.artworkId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Update order status
router.patch('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prevent cancellation of delivered orders
    if (status === 'Cancelled' && order.status === 'Delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel a delivered order' 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...(status === 'Cancelled' && {
          cancelledAt: new Date(),
          cancellationReason: req.body.reason || 'Cancelled by user'
        })
      },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
});

// Add new route for auto-cancellation
router.patch('/:orderId/auto-cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is already cancelled or completed
    if (order.status === 'Cancelled' || order.status === 'Delivered') {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled - already cancelled or delivered' 
      });
    }

    // Check if order is pending and older than 2 minutes
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - orderDate;
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

    if (order.status === 'Pending' && timeDifference > twoMinutes) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: 'Cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Auto-cancelled due to payment timeout'
        },
        { new: true }
      );

      return res.status(200).json({
        message: 'Order auto-cancelled successfully',
        order: updatedOrder
      });
    }

    // If order doesn't meet auto-cancellation criteria
    return res.status(400).json({ 
      message: 'Order does not meet auto-cancellation criteria' 
    });

  } catch (error) {
    console.error('Error in auto-cancelling order:', error);
    res.status(500).json({ 
      message: 'Error auto-cancelling order',
      error: error.message 
    });
  }
});

// Add route to check pending orders for auto-cancellation
router.get('/check-pending', async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'Pending' });
    const currentDate = new Date();
    const twoMinutes = 2 * 60 * 1000;
    
    const updatedOrders = await Promise.all(
      pendingOrders.map(async (order) => {
        const orderDate = new Date(order.createdAt);
        const timeDifference = currentDate - orderDate;

        if (timeDifference > twoMinutes) {
          return await Order.findByIdAndUpdate(
            order._id,
            { 
              status: 'Cancelled',
              cancelledAt: new Date(),
              cancellationReason: 'Auto-cancelled due to payment timeout'
            },
            { new: true }
          );
        }
        return order;
      })
    );

    res.status(200).json({
      message: 'Pending orders checked for auto-cancellation',
      updatedOrders: updatedOrders.filter(order => order.status === 'Cancelled')
    });

  } catch (error) {
    console.error('Error checking pending orders:', error);
    res.status(500).json({ 
      message: 'Error checking pending orders',
      error: error.message 
    });
  }
});

// Export the router
module.exports = router; 