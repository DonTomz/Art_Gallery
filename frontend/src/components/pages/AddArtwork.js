import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddArtwork() {
  const [artwork, setArtwork] = useState({
    title: '',
    artist: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [imageFiles, setImageFiles] = useState([]); // State to track multiple image files
  const [categories, setCategories] = useState([]); // State to store categories
  const [errors, setErrors] = useState({}); // State to track validation errors
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!userId || role !== 'artist') {
      navigate('/'); // Redirect to login if not logged in
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/artworks/category'); // Adjust the endpoint as necessary
        setCategories(response.data); // Assuming the response is an array of categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtwork((prevArtwork) => ({
      ...prevArtwork,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setImageFiles((prevFiles) => [...prevFiles, file]); // Add the new file to the existing files
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Remove the file at the specified index
  };

  const validate = () => {
    const newErrors = {};
    if (!artwork.title) newErrors.title = "Title is required.";
    if (!artwork.artist) newErrors.artist = "Artist is required.";
    if (!artwork.description) newErrors.description = "Description is required.";
    if (!artwork.price) newErrors.price = "Price is required.";
    if (artwork.price <= 0) newErrors.price = "Price must be greater than zero.";
    if (!artwork.stock) newErrors.stock = "Stock is required.";
    if (artwork.stock < 0) newErrors.stock = "Stock cannot be negative.";
    if (!artwork.category) newErrors.category = "Category is required.";
    if (imageFiles.length === 0) newErrors.images = "At least one image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Validate before submitting

    const formData = new FormData();
    formData.append("title", artwork.title);
    formData.append("artist", artwork.artist);
    formData.append("description", artwork.description);
    formData.append("price", artwork.price);
    formData.append("category", artwork.category);
    formData.append("stock", artwork.stock);
    formData.append("artistId", userId);
  
    // Append multiple images to FormData
    imageFiles.forEach((file) => {
      formData.append("images", file); // Match key with backend
    });
  
    try {
      const response = await fetch("http://localhost:5000/api/artworks/add", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        alert("Artwork added successfully!");
        setArtwork({ title: "", artist: "", description: "", price: "", category: "", stock: "" });
        setImageFiles([]); // Clear uploaded images
      } else {
        alert("Failed to add artwork.");
      }
    } catch (error) {
      console.error("Error:", error);
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
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="title"
              value={artwork.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
            />
            {errors.title && <p className="text-red-500 text-xs italic">{errors.title}</p>}
          </div>
          {/* Artist Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="artist">Artist</label>
            <input
              id="artist"
              className={`w-full px-3 py-2 border ${errors.artist ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="artist"
              value={artwork.artist}
              onChange={handleChange}
              placeholder="Enter artist"
              required
            />
            {errors.artist && <p className="text-red-500 text-xs italic">{errors.artist}</p>}
          </div>
          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="description"
              value={artwork.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              required
            />
            {errors.description && <p className="text-red-500 text-xs italic">{errors.description}</p>}
          </div>
          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price (₹)</label>
            <input
              id="price"
              className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="price"
              value={artwork.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
              type="number"
            />
            {errors.price && <p className="text-red-500 text-xs italic">{errors.price}</p>}
          </div>
          {/* Stock Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">Stock Available</label>
            <input
              id="stock"
              className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="stock"
              value={artwork.stock}
              onChange={handleChange}
              placeholder="Enter number of items in stock"
              required
              type="number"
            />
            {errors.stock && <p className="text-red-500 text-xs italic">{errors.stock}</p>}
          </div>
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">Upload Images</label>
            <input
              id="images"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById('images').click()}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Another Image
            </button>
            {errors.images && <p className="text-red-500 text-xs italic">{errors.images}</p>}
            <div className="mt-2">
              {imageFiles.length > 0 && (
                <ul>
                  {imageFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Category Select */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <select
              id="category"
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="category"
              value={artwork.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs italic">{errors.category}</p>}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
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
