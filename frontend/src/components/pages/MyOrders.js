import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomAlert from '../CustomAlert';
import { Link } from 'react-router-dom';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
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

    if (userId) {
      fetchOrders();
      const intervalId = setInterval(fetchOrders, 60000);
      return () => clearInterval(intervalId);
    }
  }, [userId]);

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

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-5">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order ID: {order._id}</h2>
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

              {order.status !== 'Cancelled' && (
                <button 
                  onClick={() => toggleDeliveryStatus(order._id)} 
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {expandedOrderId === order._id ? 'Hide Delivery Status' : 'View Delivery Status'}
                </button>
              )}

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

              {order.status !== 'Cancelled' && (
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
              )}
            </div>
          ))}
        </div>
      )}
      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
    </div>
  );
}

export default MyOrdersPage;
