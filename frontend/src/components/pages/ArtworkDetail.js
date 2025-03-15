import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart, FaCube } from 'react-icons/fa'; 
import axios from 'axios';
import 'aframe';
import { QRCodeSVG } from 'qrcode.react';
import CustomAlert from '../CustomAlert';

function ArtworkDetail({ openModal }) {
  const { id } = useParams(); 
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isPrint, setIsPrint] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`https://art-gallery-kmgs.onrender.com/api/artworks/artwork/${id}`);
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

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId || !artwork) return;

      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/artworks/wishlist/check`, {
          params: {
            userId,
            artworkId: artwork._id
          }
        });
        setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [artwork]);

  const getARViewerURL = (artworkUrl) => {
    const arViewerBaseUrl = 'https://artgalleryar.netlify.app';
    // Make sure to properly encode the Cloudinary URL
    return `${arViewerBaseUrl}?artwork=${encodeURIComponent(artworkUrl)}`;
  };

  const handleViewInAR = () => {
    if (!artwork) return;
    
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const arUrl = getARViewerURL(artwork.imageUrl[0]);
    
    if (isMobile) {
      window.location.href = arUrl;
    } else {
      setShowQRModal(true);
    }
  };

  const handleAddToCart = async (artwork) => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      openModal();
      return;
    }

    if (quantity > artwork.stock) {
      showAlert('Cannot add more items than available in stock.', 'error');
      return;
    }

    try {
      const response = await fetch('https://art-gallery-kmgs.onrender.com/api/artworks/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          artworkId: artwork._id, 
          quantity,
          artworkType: isPrint ? 'print' : 'original'
        }) 
      });

      if (response.ok) {
        const data = await response.json();

        if (data.message === 'Artwork already in the cart') {
          showAlert('Artwork already in the cart', 'info');
        } else {
          console.log('Cart updated:', data);
          showAlert('Artwork added to cart', 'success');
        }
      } else {
        showAlert('Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Error adding to cart', 'error');
    }
  };

  const handleAddToWishlist = async (artworkId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      openModal();
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete('https://art-gallery-kmgs.onrender.com/api/artworks/wishlist/remove', {
          data: {
            userId,
            artworkId
          }
        });
        setIsInWishlist(false);
        showAlert('Removed from wishlist', 'success');
      } else {
        await axios.post('https://art-gallery-kmgs.onrender.com/api/artworks/wishlist/add', {
          userId,
          artworkId
        });
        setIsInWishlist(true);
        showAlert('Added to wishlist', 'success');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showAlert('Error updating wishlist', 'error');
    } finally {
      setWishlistLoading(false);
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

  const showAlert = (message, type = 'info') => {
    setAlertConfig({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setAlertConfig(prev => ({ ...prev, show: false }));
    }, 3000); // Hide alert after 3 seconds
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
          <div className="relative overflow-hidden rounded-lg h-[400px] lg:h-[500px] group">
            <img
              src={`${artwork.imageUrl[0]}`}
              alt={artwork.title}
              className="w-full h-full object-cover transform transition-transform duration-400 group-hover:scale-110"
            />
            <button
              onClick={() => handleAddToWishlist(artwork._id)}
              disabled={wishlistLoading}
              className={`absolute top-4 right-4 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200 ${
                wishlistLoading ? 'opacity-50' : ''
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <FaHeart 
                className={`text-xl transition-colors duration-200 ${
                  isInWishlist ? 'text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
            <button 
              onClick={handleViewInAR}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
              title="View in AR"
            >
              <FaCube className="text-xl text-blue-500" />
              <span className="text-sm font-medium">View in AR</span>
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

      {/* Add CustomAlert */}
      {alertConfig.show && (
        <CustomAlert
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">View in AR</h2>
            <p className="mb-6 text-center text-gray-600">
              Scan this QR code with your mobile device to view the artwork in AR
            </p>
            <div className="flex justify-center mb-6">
              <QRCodeSVG
                value={getARViewerURL(artwork.imageUrl[0])}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center mb-6 text-sm text-gray-500">
              <p>1. Scan the QR code with your mobile device</p>
              <p>2. Point your camera at this marker:</p>
              <a 
                href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Marker
              </a>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowQRModal(false)}
                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtworkDetail;

