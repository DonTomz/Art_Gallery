const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId:
   { type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true },
  items: [
    {
      artworkId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Artwork', 
        required: true 
      },
      quantity: 
      { type: Number,
        default: 1 
      },
      artworkType: {
        type: String,
        enum: ['original', 'print'],
        required: true
      },
    }
  ]
});

const Cartdata = mongoose.model('cart', cartSchema);
module.exports = Cartdata