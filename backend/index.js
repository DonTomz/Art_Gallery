const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const artRoutes = require('./routes/artRoutes');
const artworkRoutes = require('./routes/artworks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Moved before route registration

// Serve static files (images)
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error: ", err));

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);
app.use('/api/artworks', artworkRoutes); // Make sure artworkRoutes is properly imported and defined

// Test Route
app.get('/', (req, res) => {
    res.send("Welcome to the Art Gallery API!");
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
