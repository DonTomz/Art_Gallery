const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  

  console.log('Incoming request data:', req.body); // Debug: Check incoming data

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password, // The password will be hashed by the pre-save middleware
    });

    // Debug: Log the user details before saving
    console.log("User to be saved:", newUser);

    // Save the user to the database
    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error); // Debug: Log the error
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Trim the email and find the user by email
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      console.log("User not found with email:", email); // Debug: Log if user is not found
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the input password (plain text) with the hashed password from the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch for user:", user.email); // Debug: Log if passwords do not match
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Debug: Log successful login
    console.log("Login successful for user:", user.email);

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return the JWT token
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error); // Debug: Log any errors during login
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;