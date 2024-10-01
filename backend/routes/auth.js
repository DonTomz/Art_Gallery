const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artist= require('../models/Artist');

const router = express.Router();

// Register new user or artist
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body; // role added here

  console.log('Incoming request data:', req.body); // Debug: Check incoming data

  try {
    // Check if the user or artist already exists
    const userExists = await User.findOne({ email });
    const artistExists = await Artist.findOne({ email });

    if (userExists || artistExists) {
      return res.status(400).json({ message: 'User or Artist already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user or artist instance based on role
    if (role === 'User') {
      const newUser = new User({
        username,
        email,
        password: hashedPassword, // hashed password
      });
      // Debug: Log the user details before saving
      console.log("User to be saved:", newUser);

      // Save the user to the database
      await newUser.save();
      return res.status(201).json({ message: 'User registered successfully' });
    } else if (role === 'Artist') {
      const newArtist = new Artist({
        username,
        email,
        password: hashedPassword, // hashed password
      });
      // Debug: Log the artist details before saving
      console.log("Artist to be saved:", newArtist);

      // Save the artist to the database
      await newArtist.save();
      return res.status(201).json({ message: 'Artist registered successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error('Error during registration:', error); // Debug: Log the error
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


router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Send back only the username (or other data)
    res.status(200).json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const CLIENT_ID='178034908813-r3g51hrfa86fclssiq8fkfvtauj737to.apps.googleusercontent.com'


router.post('/api/auth/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Extract user info from the payload
    const { email, name, sub: googleId } = payload;

    // Check if user exists in your database
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // If user doesn't exist, create a new user in your database
      user = new User({
        username: name,
        email,
        googleId,
      });
      await user.save();
    }

    // Generate your own JWT for the user
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ token: authToken, username: user.username, userId: user._id });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
});


module.exports = router;