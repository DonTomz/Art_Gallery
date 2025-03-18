const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const artRoutes = require('./routes/artRoutes');
const artworkRoutes = require('./routes/artworks');
const adminRoutes = require('./routes/admin');
const usersRoutes =require('./routes/users');
const paymentRoutes = require('./routes/payment')
const uploadRoutes = require('./routes/upload')
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');

const path =require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Moved before route registration

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error: ", err));

// Add this logging middleware to debug route registration
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);
app.use('/api/artworks', artworkRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes)
app.use('/api/payment', paymentRoutes);
app.use('/api/upload',uploadRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Add a test route to verify Express is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Test that the route is registered
app.get('/test-orders', (req, res) => {
  res.json({ message: 'Orders route test' });
});

// Add this after all route registrations to catch unmatched routes
app.use('*', (req, res) => {
  console.log('Route not found:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Catch-all error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

