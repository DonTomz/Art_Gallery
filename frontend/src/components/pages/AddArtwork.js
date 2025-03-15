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
        const response = await axios.get('https://art-gallery-kmgs.onrender.com/api/artworks/category'); // Adjust the endpoint as necessary
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

    // Live validation
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = "Title is required.";
        } else if (value.length < 3) {
          newErrors.title = "Title must be at least 3 characters long.";
        } else {
          delete newErrors.title;
        }
        break;

      case 'artist':
        if (!value.trim()) {
          newErrors.artist = "Artist is required.";
        } else if (value.length < 2) {
          newErrors.artist = "Artist name must be at least 2 characters long.";
        } else {
          delete newErrors.artist;
        }
        break;

      case 'description':
        if (!value.trim()) {
          newErrors.description = "Description is required.";
        } else if (value.length < 10) {
          newErrors.description = "Description must be at least 10 characters long.";
        } else {
          delete newErrors.description;
        }
        break;

      case 'price':
        if (!value) {
          newErrors.price = "Price is required.";
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.price = "Price must be greater than zero.";
        } else {
          delete newErrors.price;
        }
        break;

      case 'stock':
        if (!value) {
          newErrors.stock = "Stock is required.";
        } else if (isNaN(value) || parseInt(value) < 0) {
          newErrors.stock = "Stock cannot be negative.";
        } else {
          delete newErrors.stock;
        }
        break;

      case 'category':
        if (!value) {
          newErrors.category = "Category is required.";
        } else {
          delete newErrors.category;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          images: "Please upload only image files."
        }));
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: "Image size should be less than 5MB."
        }));
        return;
      }

      setImageFiles((prevFiles) => {
        const newFiles = [...prevFiles, file];
        // Clear image error if at least one valid image is uploaded
        if (newFiles.length > 0) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          });
        }
        return newFiles;
      });
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      // Add error if no images remain
      if (newFiles.length === 0) {
        setErrors(prev => ({
          ...prev,
          images: "At least one image is required."
        }));
      }
      return newFiles;
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!artwork.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (artwork.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
    }

    if (!artwork.artist.trim()) {
      newErrors.artist = "Artist is required.";
    } else if (artwork.artist.length < 2) {
      newErrors.artist = "Artist name must be at least 2 characters long.";
    }

    if (!artwork.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (artwork.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long.";
    }

    if (!artwork.price) {
      newErrors.price = "Price is required.";
    } else if (isNaN(artwork.price) || parseFloat(artwork.price) <= 0) {
      newErrors.price = "Price must be greater than zero.";
    }

    if (!artwork.stock) {
      newErrors.stock = "Stock is required.";
    } else if (isNaN(artwork.stock) || parseInt(artwork.stock) < 0) {
      newErrors.stock = "Stock cannot be negative.";
    }

    if (!artwork.category) {
      newErrors.category = "Category is required.";
    }

    if (imageFiles.length === 0) {
      newErrors.images = "At least one image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const response = await fetch("https://art-gallery-kmgs.onrender.com/api/artworks/add", {
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
