import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; 

function ArtworkDetail({ openModal }) { // Accept openModal as a prop
  const { id } = useParams(); 
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/artworks/artwork/${id}`);
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

  const handleAddToCart = async (artwork) => {
    const userId = localStorage.getItem('userId'); // Assuming you store the logged-in user ID in localStorage
  
    if (!userId) {
      openModal(); // Show login popup
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/artworks/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, artworkId: artwork._id, quantity: 1 }) 
      });
  
      if (response.ok) {
        const cart = await response.json();
        console.log('Cart updated:', cart);
        alert('Artwork added to cart');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleAddToWishlist = () => {
    console.log('Added to wishlist:', artwork.title);
  };

  if (loading) return <div className="text-center mt-10">Loading artwork details...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  if (!artwork) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Artwork Image Section */}
        <div className="lg:w-1/2 relative">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={`http://localhost:5000/uploads/${artwork.imageUrl}`}
              alt={artwork.title}
              className="w-full h-auto object-contain max-h-[500px]"
            />
            {/* Wishlist Icon positioned at the top-right corner */}
            <button
              onClick={handleAddToWishlist}
              className="absolute top-2 right-2 text-black hover:text-white text-xl transition duration-100"
            >
              <FaHeart />
            </button>
          </div>
        </div>

        {/* Artwork Details Section */}
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">{artwork.title}</h1>
            <p className="text-lg text-gray-600 mb-3"><strong>Artist:</strong> {artwork.artist}</p>
            <p className="text-sm text-gray-700 mb-5"><strong>Description:</strong> {artwork.description}</p>
            <p className="text-xl font-semibold text-gray-900 mb-5"><strong>Price:</strong> ₹{artwork.price}</p>
          </div>

          {/* Buttons for Cart */}
          <div className="flex items-center gap-4">
            <button
              onClick={()=>{handleAddToCart(artwork)}}
              className="bg-yellow-600 hover:bg-indigo-700 text-white hover:text-black font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtworkDetail;
