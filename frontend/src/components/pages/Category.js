import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../useAuth';

const Category = () => {
  useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { category } = useParams(); // Get category from URL
  const navigate = useNavigate();

  // Fetch artworks based on category
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/artworks/category/${category}`);
        setArtworks(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching artworks.');
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [category]);

  // Handle artwork click
  const handleArtworkClick = (artworkId) => {
    navigate(`/artworks/${artworkId}`);
  };



  return (
    <div className="px-6 py-8">
      <h2 className="text-center text-3xl font-bold mb-8 capitalize">{category}</h2>
      {loading && <p className="text-center text-lg">Loading artworks...</p>}
      {error && <p className="text-center text-lg text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artworks.length > 0 ? (
            artworks.map((artwork) => (
              <div
                key={artwork._id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden text-center cursor-pointer"
                onClick={() => handleArtworkClick(artwork._id)}
              >
                <img
                  src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{artwork.title}</h3>
                  <p className="text-gray-600">Artist: {artwork.artist}</p>
                  <p className="text-gray-800 font-bold">${artwork.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg">No artworks found for {category}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Category;
