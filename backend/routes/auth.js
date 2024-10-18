const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const router = express.Router();


// Register new user, artist, or admin
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body; // role added here

  console.log('Incoming request data:', req.body); // Debug: Check incoming data

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User or Artist already exists' });
    }


    // Create a new user, artist, or admin instance based on role
    const newUser = new User({
      username,
      email,
      password,
      role: role.toLowerCase(),  // Ensure role is in lowercase ('user', 'artist', or 'admin')
    });

    // Debug: Log the user details before saving
    console.log("User to be saved:", newUser);

    // Save the user to the database
    await newUser.save();
    return res.status(201).json({ message: `${role} registered successfully` });

  } catch (error) {
    console.error('Error during registration:', error); // Debug: Log the error
    return res.status(500).json({ message: 'Server error', error });
  }
});





// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Trim the email and find the user by email
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      console.log("User not found with email:", email); // Debug: Log if user is not found
      return res.status(401).json({ message: 'User not found' });
    }

    // If the user is an artist, check if they are approved
    if (user.role === 'artist' && !user.isApproved) {
      console.log("Artist not approved:", user.email); // Debug: Log if artist is not approved
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    //Restrict entry for blocked users
    if(user.role === 'user' && user.isBlock){
      console.log("User blocked:", user.email); // Debug: Log if user is blocked
      return res.status(403).json({ message: 'Your account is blocked' });
    }

    // Compare the input password (plain text) with the hashed password from the database
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      console.log("Password mismatch for user:", user.email); // Debug: Log if passwords do not match
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Debug: Log successful login
    console.log("Login successful for user:", user.email);

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return the JWT token, userId, username, and role
    const userId = user._id;
    const username = user.username;
    const role = user.role;
    return res.status(200).json({ token, userId, username, role ,message:'Login successful for user:'});
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
    res.status(200).json({ username: user.username});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});





// const CLIENT_ID='178034908813-r3g51hrfa86fclssiq8fkfvtauj737to.apps.googleusercontent.com'

router.post('/api/auth/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
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
    res.status(200).json({ token: authToken, username: user.username });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
      // Look for user by email
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
          console.log("User not found for email:", req.body.email);
          return res.status(404).send({ message: "User not found" });
      }

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

      await user.save(); // Save token and expiry in user document
      console.log("Reset token generated and saved:", resetToken);

      // Send email
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
          },
      });

      const mailOptions = {
          to: user.email,
          from: process.env.EMAIL,
          subject: 'Password Reset Request',
          text: `You are receiving this because you (or someone else) have requested to reset your password.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://localhost:3000/reset-password/${encodeURIComponent(resetToken)}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      transporter.sendMail(mailOptions, (err) => {
          if (err) {
              console.error("Error sending email:", err);
              return res.status(500).send({ message: 'Error sending email' });
          }
          console.log("Reset password email sent successfully to:", user.email);
          res.status(200).send({ message: 'Reset link sent to email' });
      });

  } catch (error) {
      console.error("Error processing forgot password request:", error);
      res.status(500).send({ message: "Internal server error" });
  }
})



router.post('/resetpassword/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Log the received token and password
  console.log("Token received in request:", token);
  console.log("Password received:", password);

  if (!password) {
      return res.status(400).send({ message: "Password is required" });
  }

  try {
      // Find the user with the matching token and ensure token is not expired
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
          console.log(`Token: ${token}, Date.now(): ${Date.now()}`);
          const tokenInDb = await User.findOne({ resetPasswordToken: token });
          console.log('Token found in DB:', tokenInDb?.resetPasswordToken);
          return res.status(400).send({ message: "Invalid or expired token" });
      }

      // Log user found and proceed to reset password
      console.log("User found:", user);

      user.password = password;

      user.resetPasswordToken = undefined; // Clear the token
      user.resetPasswordExpires = undefined; // Clear the expiration time

      // Save the updated user details
      await user.save();

      res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).send({ message: "Internal server error" });
  }
});



module.exports = router;