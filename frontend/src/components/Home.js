import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artworks');
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        setArtworks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const handleArtworkClick = (artworkId) => {
    navigate(`/artworks/${artworkId}`); 
  };

  // Filtered artworks based on search query
  const filteredArtworks = artworks.filter(artwork => {
    const titleMatch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase());
    const artistMatch = artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = artwork.category.toLowerCase().includes(searchQuery.toLowerCase()); // Check category
    return titleMatch || artistMatch || categoryMatch; // Include category in search
  });

  if (loading) return <div className="text-center text-lg font-medium">Loading artworks...</div>; 
  if (error) return <div className="text-center text-red-500 font-semibold">Error: {error}</div>; 

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Featured Artworks</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by artwork name, artist, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 w-64 rounded-lg"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredArtworks.length === 0 ? (
          <div className="col-span-full text-center text-lg font-medium">No artworks found.</div>
        ) : (
          filteredArtworks.map((artwork) => (
            <div 
              key={artwork._id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleArtworkClick(artwork._id)}
            >
              <img
                src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
                alt={artwork.title}
                className="w-full h-40 object-cover rounded-t-lg" // Reduced image height
              />
              <div className="p-3">
                <h3 className="text-md font-semibold text-gray-800">{artwork.title}</h3>
                <p className="text-gray-600 mt-1"><strong>Artist:</strong> {artwork.artist}</p>
                <p className="text-gray-600 mt-1"><strong>Category:</strong> {artwork.category}</p>
                <p className="text-gray-600 mt-1 truncate">{artwork.description}</p>
                <p className="text-gray-900 font-bold mt-2"><strong>Price:</strong> ₹{artwork.price}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
