const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    artworks: {
        type: [{
            artworkId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Artwork',
                required: [true, 'Artwork ID is required']
            },
            artworkName: {
                type: String,
                required: [true, 'Artwork name is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: [1, 'Quantity must be at least 1']
            },
            price: {
                type: Number,
                required: [true, 'Price is required'],
                min: [0, 'Price cannot be negative']
            },
            artworkType: {
                type: String,
                enum: {
                    values: ['original', 'print'],
                    message: '{VALUE} is not a valid artwork type'
                },
                required: true
            }
        }],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'At least one artwork is required in the order'
        }
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
        validate: {
            validator: function(v) {
                // Validate that total price matches sum of artwork prices
                if (!this.artworks) return true;
                const calculatedTotal = this.artworks.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
                return Math.abs(v - calculatedTotal) < 0.01; // Allow for small floating point differences
            },
            message: 'Total price must match sum of artwork prices'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Paid', 'Cancelled', 'Refunded'],
            message: '{VALUE} is not a valid order status'
        },
        default: 'Pending'
    },
    paymentId: {
        type: String,
        sparse: true
    },
    deliveryStatus: {
        type: String,
        enum: {
            values: ['Not Shipped', 'Picked up', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned'],
            message: '{VALUE} is not a valid delivery status'
        },
        default: 'Not Shipped'
    },
    trackingDetails: [{
        status: {
            type: String,
            required: true
        },
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    trackingId: {
        type: String,
        unique: true,
        sparse: true
    },
    courierPartner: {
        type: String,
        enum: {
            values: ['Ekart', 'Delhivery', 'Express', 'Other'],
            message: '{VALUE} is not a valid courier partner'
        }
    },
    estimatedDeliveryDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || v > new Date();
            },
            message: 'Estimated delivery date must be in the future'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true
    }
});

// Pre-save middleware to validate order
orderSchema.pre('save', async function(next) {
    try {
        console.log('Validating order:', this._id);

        // Validate artwork existence and prices
        if (this.artworks && this.artworks.length > 0) {
            const Artwork = mongoose.model('Artwork');
            for (const item of this.artworks) {
                const artwork = await Artwork.findById(item.artworkId);
                if (!artwork) {
                    throw new Error(`Artwork ${item.artworkId} not found`);
                }
                if (artwork.price !== item.price) {
                    throw new Error(`Price mismatch for artwork ${item.artworkId}`);
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Add index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ deliveryPartnerId: 1, deliveryStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

// Verify the model
Order.countDocuments()
    .then(count => console.log('Total orders in database:', count))
    .catch(err => console.error('Error counting orders:', err));

module.exports = Order;
