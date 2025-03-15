const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
    // Only require password if the user doesn't use Google login
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String, // Store Google user ID
    unique: true, // Make sure it's unique
    sparse: true, // Allows this field to be empty for non-Google users
  },
  role: {
    type: String,
    enum: ['user', 'artist', 'admin', 'delivery'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isBlock: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
  },
  artistDescription: {
    type: String,
  },
  artistDocument: {
    type: String,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
    },
  ],
  addresses: [{
    firstName: String,
    lastName: String,
    address: String,
    phoneNumber: String,
    country: String,
    state: String,
    district: String,
    pincode: String,
  }]
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Function to register a new user (including delivery agents)
userSchema.statics.registerUser = async function (userData) {
  const { username, email, password, role } = userData;

  // Check if the user already exists
  const existingUser = await this.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new this({
    username,
    email,
    password,
    role, // Set the role from userData
  });

  await user.save();
  return user;
};

// Create the User model
const User = mongoose.model('users', userSchema);
module.exports = User;
