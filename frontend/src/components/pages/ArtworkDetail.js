import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get the artwork ID from URL
// import './ArtworkDetail.css';

function ArtworkDetail() {
  const { id } = useParams(); // Get the artwork ID from URL
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/artworks/artwork/${id}`);
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch artwork details');
        }
        const data = await response.json();
        setArtwork(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleAddToCart = () => {
    // Logic to add to cart
    console.log('Added to cart:', artwork.title);
  };

  const handleAddToWishlist = () => {
    // Logic to add to wishlist
    console.log('Added to wishlist:', artwork.title);
  };

  if (loading) return <div>Loading artwork details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!artwork) return null;

  return (
    <div className="artwork-detail">
      <img
        src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
        alt={artwork.title}
        className="artwork-image"
      />
      <div className="artwork-info">
        <h1>{artwork.title}</h1>
        <p><strong>Artist:</strong> {artwork.artist}</p>
        <p><strong>Description:</strong> {artwork.description}</p>
        <p><strong>Price:</strong> ${artwork.price}</p>
        <button onClick={handleAddToCart} className="btn">Add to Cart</button>
        <button onClick={handleAddToWishlist} className="btn">Add to Wishlist</button>
      </div>
    </div>
  );
}

export default ArtworkDetail;
