import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaintingPage = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch paintings on component mount
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/artworks/category/Painting');
        setPaintings(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching paintings.');
        setLoading(false);
      }
    };
    fetchPaintings();
  }, []);

  // Render loading state, error, or paintings
  return (
    <div className="px-6 py-8">
      <h2 className="text-center text-3xl font-bold mb-8">Paintings</h2>
      {loading && <p className="text-center text-lg">Loading paintings...</p>}
      {error && <p className="text-center text-lg text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paintings.length > 0 ? (
            paintings.map((painting) => (
              <div
                key={painting._id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden text-center"
              >
                <img
                  src={`http://localhost:5000/uploads/${painting.imageUrl}`}
                  alt={painting.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{painting.title}</h3>
                  <p className="text-gray-600">Artist: {painting.artist}</p>
                  <p className="text-gray-800 font-bold">${painting.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg">No paintings found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaintingPage;
