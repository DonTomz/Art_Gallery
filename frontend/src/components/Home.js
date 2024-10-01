import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [artworks, setArtworks] = useState([]); // State to hold artworks
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to manage errors

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artworks'); // Adjust URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        setArtworks(data); // Update state with fetched data
      } catch (error) {
        setError(error.message); // Set error state if fetching fails
      } finally {
        setLoading(false); // Set loading to false once fetching is done
      }
    };

    fetchArtworks(); // Call the function to fetch artworks
  }, []);

  if (loading) return <div>Loading artworks...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state

  return (
    <div className="art-gallery">
      <h1>Featured Artworks</h1>
      <div className="artworks-container">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="artwork-card"> {/* Use artwork._id as key */}
            <img src={artwork.imageUrl} alt={artwork.title} />
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
