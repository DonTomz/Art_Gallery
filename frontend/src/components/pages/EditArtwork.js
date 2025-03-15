import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://art-gallery-kmgs.onrender.com/api/artworks/category');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!userId || role !== 'artist') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/artworks/artwork/${id}`);
        setArtwork(response.data);
      } catch (err) {
        setErrors(prev => ({ ...prev, fetch: 'Error fetching artwork' }));
      }
    };
    fetchArtwork();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtwork(prev => ({ ...prev, [name]: value }));

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
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          images: "Please upload only image files."
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: "Image size should be less than 5MB."
        }));
        return;
      }

      setImageFiles(prevFiles => [...prevFiles, file]);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setArtwork(prev => ({
        ...prev,
        imageUrl: prev.imageUrl.filter((_, i) => i !== index)
      }));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }

    if (artwork.imageUrl.length === 0 && imageFiles.length === 0) {
      setErrors(prev => ({
        ...prev,
        images: "At least one image is required."
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!artwork.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (artwork.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
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

    if (artwork.imageUrl.length === 0 && imageFiles.length === 0) {
      newErrors.images = "At least one image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', artwork.title);
    formData.append('description', artwork.description);
    formData.append('price', artwork.price);
    formData.append('stock', artwork.stock);
    formData.append('category', artwork.category);

    artwork.imageUrl.forEach((image) => {
      formData.append('images', image);
    });

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.put(`https://art-gallery-kmgs.onrender.com/api/artworks/edit/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/artist/artworks');
    } catch (err) {
      console.error('Error updating artwork:', err.response?.data || err.message);
      setErrors(prev => ({
        ...prev,
        submit: 'Error updating artwork: ' + (err.response?.data?.message || 'Unknown error occurred')
      }));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Edit Artwork</h2>
        {errors.fetch && <p className="text-red-500 text-sm mb-4">{errors.fetch}</p>}
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input
              id="edit-title"
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="title"
              value={artwork.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
            />
            {errors.title && <p className="text-red-500 text-xs italic">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea
              id="edit-description"
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

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price (₹)</label>
            <input
              id="edit-price"
              className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="price"
              value={artwork.price}
              onChange={handleChange}
              placeholder="Enter price"
              type="number"
              required
            />
            {errors.price && <p className="text-red-500 text-xs italic">{errors.price}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">Stock Available</label>
            <input
              id="edit-stock"
              className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              name="stock"
              value={artwork.stock}
              onChange={handleChange}
              placeholder="Enter number of items in stock"
              type="number"
              required
            />
            {errors.stock && <p className="text-red-500 text-xs italic">{errors.stock}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <select
              id="edit-category"
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

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>
            <input
              id="edit-image-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleImageChange}
            />
            <button
              id="add-another-image"
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Another Image
            </button>
            {errors.images && <p className="text-red-500 text-xs italic mt-1">{errors.images}</p>}

            {artwork.imageUrl.length > 0 && (
              <div id="current-images-section" className="mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {artwork.imageUrl.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        id={`current-image-${index}`}
                        src={`http://localhost:5000/uploads/${image}`}
                        alt={`Artwork ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        id={`remove-current-image-${index}`}
                        type="button"
                        onClick={() => handleRemoveImage(index, true)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imageFiles.length > 0 && (
              <div id="new-images-section" className="mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">New Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        id={`new-image-${index}`}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        id={`remove-new-image-${index}`}
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}

          <button
            id="edit-submit"
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditArtwork;
