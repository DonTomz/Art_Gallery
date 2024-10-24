import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ArtistArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState('');

  // Fetch artworks uploaded by the logged-in artist
  useEffect(() => {
    const artistId = localStorage.getItem('userId');
    const fetchArtworks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/artworks/mine/${artistId}`);
        setArtworks(response.data.artworks);
      } catch (err) {
        setError('Error fetching artworks');
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="artist-artworks container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">My Artworks</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {artworks.length === 0 ? (
        <p className="text-center text-gray-500">No artworks uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div key={artwork._id} className="artwork-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img
                src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
                alt={artwork.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{artwork.title}</h3>
                <p className="text-gray-600 mb-2">{artwork.description}</p>
                <p className="text-lg font-medium mb-4">Price: ₹{artwork.price}</p>
                <Link
                  to={`/artist/artworks/edit/${artwork._id}`}
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  Edit Artwork
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistArtworks;
