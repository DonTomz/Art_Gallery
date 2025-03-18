import React, { useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

function ReviewForm({ orderId, onReviewSubmitted, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      const response = await axios.post('https://art-gallery-kmgs.onrender.com/api/reviews/create', {
        orderId,
        rating,
        comment,
      }, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.data) {
        onReviewSubmitted(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <div className="flex">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className="cursor-pointer text-2xl mr-1"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              );
            })}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Share your experience with this order..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm; 