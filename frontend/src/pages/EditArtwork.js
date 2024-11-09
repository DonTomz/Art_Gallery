import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../useAuth';

const EditArtwork = () => {
  useAuth();
  const { id } = useParams(); // Get the artwork ID from the URL
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role')


  useEffect(() => {
    if (!userId || role !== 'artist') {
      navigate('/'); // Redirect to login if not logged in
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    // Fetch artwork details to pre-fill the form
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/artworks/${id}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://art-gallery-kmgs.onrender.com/api/artworks/edit/${id}`, artwork);
      navigate('/artist/artworks'); // Redirect to artist dashboard after successful edit
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
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={artwork.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
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
