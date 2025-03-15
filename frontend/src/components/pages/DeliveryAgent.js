import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DeliveryAgent() {
  const [orders, setOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || role !== 'delivery') {
      navigate('/'); // Redirect if not logged in as a delivery agent
    }
    fetchOrders();
    fetchMyDeliveries();
  }, [userId, role, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://art-gallery-kmgs.onrender.com/api/payment/orders/unassigned');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAlertMessage('Failed to fetch orders');
      setShowAlert(true);
    }
  };

  const fetchMyDeliveries = async () => {
    try {
      const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/payment/orders/delivery/${userId}`);
      setMyDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching my deliveries:', error);
    }
  };

  const acceptDelivery = async (orderId) => {
    try {
      await axios.post(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}/assign`, {
        deliveryPartnerId: userId
      });
      fetchOrders();
      fetchMyDeliveries();
      setAlertMessage('Delivery accepted successfully');
      setShowAlert(true);
    } catch (error) {
      console.error('Error accepting delivery:', error);
      setAlertMessage('Failed to accept delivery');
      setShowAlert(true);
    }
  };

  const updateDeliveryStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}`, {
        deliveryStatus: newStatus,
        trackingDetails: [{
          status: newStatus,
          location: 'Current Location', // You could add location input if needed
          description: `Package ${newStatus.toLowerCase()}`,
          timestamp: new Date()
        }]
      });
      fetchMyDeliveries();
      setAlertMessage('Status updated successfully');
      setShowAlert(true);
    } catch (error) {
      console.error('Error updating status:', error);
      setAlertMessage('Failed to update status');
      setShowAlert(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Orders */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold">Order ID: {order._id}</h3>
                <p>Customer: {order.userName}</p>
                <p>Address: {order.address}</p>
                <p>Total Price: ₹{order.totalPrice}</p>
                <button
                  onClick={() => acceptDelivery(order._id)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Deliveries */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Deliveries</h2>
          <div className="space-y-4">
            {myDeliveries.map((delivery) => (
              <div key={delivery._id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold">Order ID: {delivery._id}</h3>
                <p>Customer: {delivery.userName}</p>
                <p>Address: {delivery.address}</p>
                <p>Current Status: {delivery.deliveryStatus}</p>
                <div className="mt-2 space-x-2">
                  <select
                    onChange={(e) => updateDeliveryStatus(delivery._id, e.target.value)}
                    className="border p-2 rounded"
                    value={delivery.deliveryStatus}
                  >
                    <option value="Not Shipped">Not Shipped</option>
                    <option value="Picked up">Picked up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow">
          {alertMessage}
          <button onClick={() => setShowAlert(false)} className="ml-4 font-bold">×</button>
        </div>
      )}
    </div>
  );
}

export default DeliveryAgent; 