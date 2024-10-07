const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const artistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['artist'], // Artist role
    default: 'artist', // Default is artist
  },
}, { timestamps: true });

// Hash the password before saving the artist
artistSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create the Artist model
const Artist = mongoose.model('artists', artistSchema);
module.exports = Artist;
