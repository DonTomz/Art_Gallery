import React, { useState } from 'react';

function AddArtwork() {
  const [artwork, setArtwork] = useState({
    title: '',
    artist: '',
    description: '',
    price: '',
    imageUrl: '',
    category: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtwork((prevArtwork) => ({
      ...prevArtwork,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/artworks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artwork),
      });
      if (response.ok) {
        alert('Artwork added successfully!');
        setArtwork({ title: '', artist: '', description: '', price: '', imageUrl: '', category: '' });
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="title"
              value={artwork.title}
              onChange={handleChange}
              placeholder="Enter title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="artist">Artist</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="artist"
              value={artwork.artist}
              onChange={handleChange}
              placeholder="Enter artist"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="description"
              value={artwork.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price ($)</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="price"
              value={artwork.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">Image URL</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="imageUrl"
              value={artwork.imageUrl}
              onChange={handleChange}
              placeholder="Enter image URL"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="category"
              value={artwork.category}
              onChange={handleChange}
              placeholder="Enter category"
              required
            />
          </div>
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
