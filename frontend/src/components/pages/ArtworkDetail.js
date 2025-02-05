import React, { useState, useEffect,} from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; 
import axios from 'axios';


function ArtworkDetail({ openModal }) { // Accept openModal as a prop
  const { id } = useParams(); 
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // State for the quantity
  const [isPrint, setIsPrint] = useState(false); // State to track if "Print" is selected

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

  if (quantity > artwork.stock) {
    alert('Cannot add more items than available in stock.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/artworks/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, artworkId: artwork._id, quantity }) // Include the quantity in the request
    });

    if (response.ok) {
      const data = await response.json();

      // Check the message from the server response
      if (data.message === 'Artwork already in the cart') {
        alert('Artwork already in the cart');
      } else {
        console.log('Cart updated:', data);
        alert('Artwork added to cart');
      }
    } else {
      alert('Failed to add to cart');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};



  const handleAddToWishlist = async (artworkId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:5000/api/artworks/wishlist/add', {
        userId: userId,
        artworkId: artworkId,
      });

      if (response.status === 200) {
        alert('Artwork added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist', error);
      alert('Error adding artwork to wishlist');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= artwork.stock) {
      setQuantity(value);
    }
  };

  const handlePrintChange = (e) => {
    setIsPrint(e.target.value === 'print'); // Update state based on selected option
  };

  if (loading) return <div className="text-center mt-10">Loading artwork details...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  if (!artwork) return null;

  const loggedInUserId = localStorage.getItem('userId'); // Get logged-in user ID
  const isArtist = loggedInUserId === artwork.artistId.toString(); // Check if user is the artist


  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Artwork Image Section */}
        <div className="lg:w-1/2 relative">
  <div className="relative overflow-hidden rounded-lg h-[400px] lg:h-[500px] group"> {/* Group for hover effect */}
    <img
      src={`${artwork.imageUrl[0]}`}
      alt={artwork.title}
      className="w-full h-full object-cover transform transition-transform duration-400 group-hover:scale-110" 
      // Scale effect on hover
    />
    {/* Wishlist Icon positioned at the top-right corner */}
    <button
      onClick={() => handleAddToWishlist(artwork._id)}
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
            <p className="text-lg font-semibold text-gray-900 mb-5"><strong>Stock Available:</strong> {artwork.stock}</p> {/* Display Stock */}

            {/* Radio buttons for selecting Original or Print */}
            <div className="mb-5">
              <label className="block text-lg text-gray-700">Select Type:</label>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  value="original"
                  checked={!isPrint}
                  onChange={handlePrintChange}
                  className="form-radio"
                />
                <span className="ml-2">Original</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="print"
                  checked={isPrint}
                  onChange={handlePrintChange}
                  className="form-radio"
                />
                <span className="ml-2">Print</span>
              </label>
            </div>

            {/* Quantity Selector (only shown if Print is selected) */}
            {isPrint && (
              <div className="mb-5">
                <label htmlFor="quantity" className="block text-lg text-gray-700">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  min="1"
                  max={artwork.stock}
                  onChange={handleQuantityChange}
                  className="w-16 p-2 border rounded"
                />
              </div>
            )}
          </div>

          {/* Buttons for Cart */}
          <div className="flex items-center gap-4">
            {/* Conditionally render the Add to Cart button */}
            {isArtist ? (
              <p className="text-lg text-red-600">Your Own work</p> // Message for the artist
            ) : (
              <button
                onClick={() => handleAddToCart(artwork)}
                className="bg-yellow-600 hover:bg-indigo-700 text-white hover:text-black font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtworkDetail;

