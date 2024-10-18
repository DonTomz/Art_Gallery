import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage
      const response = await axios.get(`http://localhost:5000/api/artworks/wishlist/${userId}`);
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (artworkId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:5000/api/artworks/wishlist/remove', {
        userId: userId,
        artworkId: artworkId
      });
  
      if (response.status === 200) {
        alert('Artwork removed from wishlist');
        // Optionally refresh the wishlist to reflect changes
        fetchWishlist(); // Re-fetch the wishlist to update the UI
      }
    } catch (error) {
      console.error('Error removing from wishlist', error);
      alert('Error removing artwork from wishlist');
    }
  };
  

  // Function to move an artwork from wishlist to cart
  const moveToCart = async (artworkId) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.post('http://localhost:5000/api/artworks/cart/add', {
        userId: userId,
        artworkId: artworkId,
      });

      // Optionally, remove the item from the wishlist after moving to the cart
      setWishlist(wishlist.filter((artwork) => artwork._id !== artworkId));

      // Navigate to the cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error moving item to cart', error);
    }
  };

  return (
    <div className="wishlist-page container mx-auto py-12">
      <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-10">Your Wishlist</h2>
  
      {wishlist.length === 0 ? (
        <p className="text-center text-lg text-gray-500">Your wishlist is currently empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {wishlist.map((artwork) => (
            <div key={artwork._id} className="relative bg-gray-100 p-6 rounded-lg shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl">
              
              {/* Artwork Image */}
              <div className="overflow-hidden rounded-lg mb-4">
                <img 
                  src={`http://localhost:5000/uploads/${artwork.imageUrl}`} 
                  alt={artwork.title} 
                  className="w-full h-56 object-cover transition-transform duration-300 ease-in-out hover:scale-105 rounded-md"
                />
              </div>
              
              {/* Artwork Info */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{artwork.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{artwork.description}</p>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center space-x-3">
                <button
                  onClick={() => moveToCart(artwork._id)}
                  className="flex-1 py-2 text-center bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700"
                >
                  Add to Cart
                </button>
  
                <button
                  onClick={() => handleRemoveFromWishlist(artwork._id)}
                  className="flex-1 py-2 text-center bg-red-500 text-white rounded-md transition-colors hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  
}

export default WishlistPage;
