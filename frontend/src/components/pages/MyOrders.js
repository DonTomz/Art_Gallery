import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomAlert from '../CustomAlert';
import { Link } from 'react-router-dom';
import ReviewForm from '../ReviewForm';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [orderReviews, setOrderReviews] = useState({});
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'cancelled'
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/payment/orders/user/${userId}`);
        const fetchedOrders = response.data;
        
        // Check and auto-cancel pending orders older than 2 minutes
        for (const order of fetchedOrders) {
          if (order.status === 'Pending') {
            const orderDate = new Date(order.createdAt);
            const currentDate = new Date();
            const timeDifference = currentDate - orderDate;
            const twoMinutes = 2 * 60 * 1000;

            if (timeDifference > twoMinutes) {
              try {
                await axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${order._id}`, {
                  status: 'Cancelled',
                  reason: 'Auto-cancelled due to payment timeout',
                  deliveryStatus: 'Cancelled'
                });
                order.status = 'Cancelled';
              } catch (error) {
                console.error('Error auto-cancelling order:', error.response?.data || error);
              }
            }
          }
        }

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        
        // Make the request with the token in the headers
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/reviews/user/${userId}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        const reviewsMap = {};
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(review => {
            reviewsMap[review.orderId] = review;
          });
        }
        setOrderReviews(reviewsMap);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Don't show an alert for this error, just log it
      }
    };

    if (userId) {
      fetchOrders();
      fetchReviews();
      const intervalId = setInterval(fetchOrders, 60000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [userId]);

  // Filter orders based on active tab
  const activeOrders = orders.filter(order => order.status !== 'Cancelled');
  const cancelledOrders = orders.filter(order => order.status === 'Cancelled');

  const handleCancelOrder = async (orderId, createdAt) => {
    const orderDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - orderDate;
    const oneHour = 60 * 60 * 1000;

    if (timeDifference > oneHour) {
      setAlertMessage('You can only cancel orders within 1 hour of placing them.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}`, {
        status: 'Cancelled',
        reason: 'Cancelled by user'
      });

      if (response.data) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: 'Cancelled' } : order
        ));
        setAlertMessage('Order cancelled successfully');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to cancel order');
      setShowAlert(true);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const fetchDeliveryStatus = async (orderId) => {
    try {
      const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}/status`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      setAlertMessage('Failed to fetch delivery status');
      setShowAlert(true);
    }
  };

  const toggleDeliveryStatus = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getDeliveryStatusIndex = (status) => {
    const statuses = ['Not Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
    return statuses.indexOf(status);
  };

  // Modify the order status display to show different colors for different statuses
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReviewClick = (order) => {
    setSelectedOrderForReview(order);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = (review) => {
    setOrderReviews(prev => ({
      ...prev,
      [review.orderId]: review
    }));
    setShowReviewForm(false);
    setSelectedOrderForReview(null);
    setAlertMessage('Review submitted successfully');
    setShowAlert(true);
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setSelectedOrderForReview(null);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-5">My Orders</h1>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-white rounded-lg shadow p-2">
        <button
          className={`flex-1 py-2 px-4 rounded ${
            activeTab === 'active' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded ${
            activeTab === 'cancelled' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled Orders ({cancelledOrders.length})
        </button>
      </div>
      
      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders.</p>
      ) : (
        <div className="space-y-6">
          {/* Show orders based on active tab */}
          {activeTab === 'active' ? (
            activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}>
                      {order.status}
                      {order.status === 'Pending' && (
                        <span className="ml-2 text-xs">
                          (Auto-cancels in {Math.max(0, Math.floor((120000 - (new Date() - new Date(order.createdAt))) / 1000))}s)
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">Date: {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-gray-600 mb-4">Total Price: ₹{order.totalPrice.toFixed(2)}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Ordered Products:</h3>
                  <ul className="space-y-2">
                    {order.artworks.map((artwork, index) => (
                      <li 
                        key={`${order._id}-${artwork.artworkId}-${index}`}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{artwork.artworkName}</p>
                          <p className="text-sm text-gray-600">Quantity: {artwork.quantity}</p>
                        </div>
                        <p className="font-medium">₹{artwork.price.toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                  
                  {order.shippingAddress && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Shipping Address:</h3>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => toggleDeliveryStatus(order._id)} 
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    {expandedOrderId === order._id ? 'Hide Delivery Status' : 'View Delivery Status'}
                  </button>

                  {expandedOrderId === order._id && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Delivery Status:</h3>
                      <div className="relative">
                        <div className="flex justify-between">
                          <span className={`font-semibold ${getDeliveryStatusIndex(order.deliveryStatus) >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>Not Shipped</span>
                          <span className={`font-semibold ${getDeliveryStatusIndex(order.deliveryStatus) >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>In Transit</span>
                          <span className={`font-semibold ${getDeliveryStatusIndex(order.deliveryStatus) >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Out for Delivery</span>
                          <span className={`font-semibold ${getDeliveryStatusIndex(order.deliveryStatus) >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Delivered</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '8px' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              backgroundColor: '#3182ce', 
                              borderRadius: '4px', 
                              width: `${(getDeliveryStatusIndex(order.deliveryStatus) + 1) * 25}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => handleCancelOrder(order._id, order.createdAt)} 
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Cancel Order
                    </button>

                    <Link 
                      to={`/order-tracking/${order._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Track Order
                    </Link>
                  </div>

                  {order.deliveryStatus === 'Delivered' && (
                    <div className="mt-4 pt-4 border-t">
                      {orderReviews[order._id] ? (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">Your Review</p>
                          <div className="flex text-yellow-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < orderReviews[order._id].rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{orderReviews[order._id].comment}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleReviewClick(order)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">You have no active orders.</p>
            )
          ) : (
            cancelledOrders.length > 0 ? (
              cancelledOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md p-6 opacity-80">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">Date: {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-gray-600 mb-2">Cancelled: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</p>
                  <p className="text-gray-600 mb-4">Total Price: ₹{order.totalPrice.toFixed(2)}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Ordered Products:</h3>
                  <ul className="space-y-2">
                    {order.artworks.map((artwork, index) => (
                      <li 
                        key={`${order._id}-${artwork.artworkId}-${index}`}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{artwork.artworkName}</p>
                          <p className="text-sm text-gray-600">Quantity: {artwork.quantity}</p>
                        </div>
                        <p className="font-medium">₹{artwork.price.toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                  
                  {order.reason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-700">Cancellation Reason:</p>
                      <p className="text-red-600">{order.reason}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">You have no cancelled orders.</p>
            )
          )}
        </div>
      )}
      
      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
      
      {showReviewForm && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <ReviewForm
              orderId={selectedOrderForReview._id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={handleCancelReview}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
