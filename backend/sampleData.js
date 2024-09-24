const mongoose = require('mongoose');
const Artwork = require('./models/Artwork'); // Assuming you have your Artwork schema here
require('dotenv').config();

const sampleArtworks = [
  {
    title: "Sunset Bliss",
    artist: "Jane Doe",
    description: "A serene sunset over the ocean, with soft colors blending in the sky.",
    price: "200",
    imageUrl: "https://example.com/sunset.jpg",
    category: "painting",
  },
  {
    title: "Modern Sculpture",
    artist: "John Smith",
    description: "A contemporary sculpture with abstract shapes.",
    price: "500",
    imageUrl: "https://example.com/sculpture.jpg",
    category: "sculpture",
  },
  {
    title: "Digital Dream",
    artist: "Alice Art",
    description: "A digital artwork featuring futuristic themes and vibrant colors.",
    price: "300",
    imageUrl: "https://example.com/digital.jpg",
    category: "digital art",
  },
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB...');
    
    // Delete all previous artworks and insert the sample ones
    await Artwork.deleteMany({});
    await Artwork.insertMany(sampleArtworks);

    console.log('Sample data inserted successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
