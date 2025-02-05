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
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userId || role !== 'artist') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/artworks/artwork/${id}`);
        setArtwork(response.data);
      } catch (err) {
        setError('Error fetching artwork');
      }
    };
    fetchArtwork();
  }, [id]);

  const handleChange = (e) => {
    setArtwork({ ...artwork, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles((prevFiles) => [...prevFiles, file]);
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setArtwork((prevArtwork) => ({
      ...prevArtwork,
      imageUrl: prevArtwork.imageUrl.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', artwork.title);
    formData.append('description', artwork.description);
    formData.append('price', artwork.price);
    formData.append('stock', artwork.stock);
    formData.append('category', artwork.category);

    // Include existing images
    artwork.imageUrl.forEach((image) => {
      formData.append('images', image); // Assuming image is the filename or path
    });

    // Append new images
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.put(`http://localhost:5000/api/artworks/edit/${id}`, formData);
      navigate('/artist/artworks');
    } catch (err) {
      setError('Error updating artwork');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg w-full max-w-2xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Edit Artwork</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={artwork.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={artwork.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={artwork.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={artwork.stock}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={handleImageChange}
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Another Image
            </button>
            <div className="mt-2">
              {artwork.imageUrl.length > 0 && (
                <ul>
                  {artwork.imageUrl.map((image, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{image}</span>
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
            <div className="mt-4">
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {imageFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-auto rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtwork;
