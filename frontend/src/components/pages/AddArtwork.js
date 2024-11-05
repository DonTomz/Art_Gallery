import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AddArtwork() {
  const [artwork, setArtwork] = useState({
    title: '',
    artist: '',
    description: '',
    price: '',
    category: '',
    stock: '', // Added stock state
  });

  const [imageFile, setImageFile] = useState(null); // State to track image file
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role')


  // Check if user is logged in
  useEffect(() => {
    if (!userId || role !== 'artist') {
      navigate('/'); // Redirect to login if not logged in
    }
  }, [userId, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtwork((prevArtwork) => ({
      ...prevArtwork,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object to include both file and artwork data
    const formData = new FormData();
    formData.append('title', artwork.title);
    formData.append('artist', artwork.artist);
    formData.append('description', artwork.description);
    formData.append('price', artwork.price);
    formData.append('category', artwork.category);
    formData.append('image', imageFile); // Append the image file
    formData.append('stock', artwork.stock); // Append stock
    formData.append('artistId', userId); // Append the artistId from session

    try {
      const response = await fetch('http://localhost:5000/api/artworks/add', {
        method: 'POST',
        body: formData, // Send formData
      });

      if (response.ok) {
        alert('Artwork added successfully!');
        setArtwork({ title: '', artist: '', description: '', price: '', category: '', stock: '' });
        setImageFile(null); // Clear the file input
      } else {
        alert('Failed to add artwork.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Add New Artwork</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="title"
              value={artwork.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
            />
          </div>
          {/* Artist Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="artist">Artist</label>
            <input
              id="artist"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="artist"
              value={artwork.artist}
              onChange={handleChange}
              placeholder="Enter artist"
              required
            />
          </div>
          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="description"
              value={artwork.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              required
            />
          </div>
          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price (₹)</label>
            <input
              id="price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="price"
              value={artwork.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
              type="number" // Added type number for better input handling
            />
          </div>
          {/* Stock Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">Stock Available</label>
            <input
              id="stock"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="stock"
              value={artwork.stock}
              onChange={handleChange}
              placeholder="Enter number of items in stock"
              required
              type="number" // Added type number for better input handling
            />
          </div>
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">Upload Image</label>
            <input
              id="imageUrl"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleImageChange}
              required
            />
          </div>
          {/* Category Select */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="category"
              value={artwork.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Paintings">Painting</option>
              <option value="Photography">Photography</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Drawings">Drawing</option>
              <option value="Prints">Print</option>
              <option value="Inspiration">Inspiration</option>
            </select>
          </div>
          {/* Submit Button */}
          <button
            
            type="submit" id="addartworkbtn"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Add Artwork
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddArtwork;
