const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    artworks: [
        {
            artworkId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Artwork',
                required: true,
            },
            artworkName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending', // Possible values: 'Pending', 'Ordered', 'Shipped', 'Delivered', 'Cancelled'
    },
    paymentId: {
        type: String,
        required: false, // Optional, set after payment is made
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
