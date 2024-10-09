import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [artworks, setArtworks] = useState([]); // State to hold artworks
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to manage errors
  const navigate = useNavigate(); // Hook to navigate between routes

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


  if (loading) return <div>Loading artworks...</div>; 
  if (error) return <div>Error: {error}</div>; 
  return (
    <div className="art-gallery">
      <h1>Featured Artworks</h1>
      <div className="artworks-container">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="artwork-card" onClick={()=> handleArtworkClick(artwork._id)}> 
                <img
                  src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
                  alt={artwork.title}
                />
            <h3>{artwork.title}</h3>
            <p><strong>Artist:</strong> {artwork.artist}</p>
            <p>{artwork.description}</p>
            <p><strong>Price:</strong> ${artwork.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
