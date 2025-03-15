import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DeliveryManagement() {
  const [allOrders, setAllOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [selectedDeliveries, setSelectedDeliveries] = useState(new Set());
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});
  const [pendingBulkStatus, setPendingBulkStatus] = useState('');

  useEffect(() => {
    if (!userId || role !== 'delivery') {
      navigate('/');
      return;
    }

    // Test the connection first
    testConnection();

    if (activeTab === 'all') {
      fetchAllOrders();
    } else {
      fetchMyDeliveries();
    }
  }, [activeTab, userId, role, navigate]);

  const testConnection = async () => {
    try {
      console.log('Testing orders route...');
      const testResponse = await axios.get('https://art-gallery-kmgs.onrender.com/api/orders/test');
      console.log('Test response:', testResponse.data);
      return true;
    } catch (error) {
      console.error('Test route error:', error.response || error);
      return false;
    }
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Could not connect to orders service');
      }

      console.log('Fetching all orders...');
      const response = await axios.get('https://art-gallery-kmgs.onrender.com/api/orders/all');
      
      if (!response.data) {
        throw new Error('No data received');
      }

      console.log('Orders received:', response.data);
      
      const availableOrders = response.data.filter(order => 
        order.status === 'Paid' && !order.deliveryPartnerId
      );
      
      setAllOrders(availableOrders);
    } catch (error) {
      console.error('Error fetching orders:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showAlertMessage('Failed to fetch orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDeliveries = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching my deliveries...');
      const response = await axios.get('https://art-gallery-kmgs.onrender.com/api/orders/all');
      console.log('📥 Raw deliveries response:', response.data);
      
      // Filter orders assigned to this delivery partner
      const myOrders = response.data.filter(order => 
        order.deliveryPartnerId === userId
      );
      console.log('✨ My filtered deliveries:', {
        total: response.data.length,
        mine: myOrders.length,
        filtered: myOrders.map(o => ({
          id: o._id,
          status: o.status,
          deliveryStatus: o.deliveryStatus
        }))
      });
      setMyDeliveries(myOrders);
    } catch (error) {
      console.error('❌ Error fetching deliveries:', error);
      showAlertMessage('Failed to fetch your deliveries');
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (orderId) => {
    try {
      await axios.post(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}/assign`, {
        deliveryPartnerId: userId
      });
      showAlertMessage('Order accepted successfully');
      fetchAllOrders(); // Refresh the orders list
      fetchMyDeliveries(); // Refresh my deliveries
    } catch (error) {
      console.error('Error accepting order:', error);
      showAlertMessage('Failed to accept order: ' + (error.response?.data?.message || error.message));
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'Not Shipped': ['Picked up'],
      'Picked up': ['In Transit'],
      'In Transit': ['Out for Delivery'],
      'Out for Delivery': ['Delivered', 'Returned'],
      'Delivered': [], // No further status changes allowed
      'Returned': []  // No further status changes allowed
    };
    
    return statusFlow[currentStatus] || [];
  };

  const handleStatusSelection = (orderId, newStatus) => {
    setPendingStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const updateDeliveryStatus = async (orderId) => {
    try {
      const newStatus = pendingStatusUpdates[orderId];
      if (!newStatus) {
        return; // No update pending
      }

      const order = myDeliveries.find(o => o._id === orderId);
      const availableStatuses = getAvailableStatuses(order.deliveryStatus);
      
      if (!availableStatuses.includes(newStatus)) {
        showAlertMessage(`Cannot change status from '${order.deliveryStatus}' to '${newStatus}'`);
        return;
      }

      const trackingDetail = {
        status: newStatus,
        location: 'Current Location',
        description: `Package ${newStatus.toLowerCase()}`,
        timestamp: new Date()
      };

      // Changed the endpoint URL to match the backend route
      const response = await axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}`, {
        deliveryStatus: newStatus,
        trackingDetails: [trackingDetail] // Note: changed to trackingDetails array
      });

      if (response.data) {
        showAlertMessage('Status updated successfully');
        // Clear the pending update for this order
        setPendingStatusUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[orderId];
          return newUpdates;
        });
        fetchMyDeliveries();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlertMessage(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
  };

  const updateMultipleDeliveryStatus = async (newStatus) => {
    try {
      // Check if the status change is valid for all selected orders
      const invalidOrders = Array.from(selectedDeliveries)
        .map(orderId => myDeliveries.find(o => o._id === orderId))
        .filter(order => !getAvailableStatuses(order.deliveryStatus).includes(newStatus));

      if (invalidOrders.length > 0) {
        showAlertMessage(`Cannot update some orders to '${newStatus}' due to invalid status transition`);
        return;
      }

      const trackingDetail = {
        status: newStatus,
        location: 'Current Location',
        description: `Package ${newStatus.toLowerCase()}`,
        timestamp: new Date()
      };

      // Changed the endpoint URL to match the backend route
      const updatePromises = Array.from(selectedDeliveries).map(orderId =>
        axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}`, {
          deliveryStatus: newStatus,
          trackingDetails: [trackingDetail] // Note: changed to trackingDetails array
        })
      );
      
      await Promise.all(updatePromises);
      showAlertMessage('All selected orders updated successfully');
      setSelectedDeliveries(new Set());
      setPendingBulkStatus(''); // Clear the pending bulk status
      fetchMyDeliveries();
    } catch (error) {
      console.error('Error updating multiple orders:', error);
      showAlertMessage(`Failed to update orders: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleOrderSelection = (orderId) => {
    const newSelection = new Set(selectedDeliveries);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedDeliveries(newSelection);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-white rounded-lg shadow p-2">
          <button
            className={`flex-1 py-2 px-4 rounded ${
              activeTab === 'all' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Available Orders ({allOrders.length})
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded ${
              activeTab === 'my-deliveries' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('my-deliveries')}
          >
            My Deliveries ({myDeliveries.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'all' ? (
              allOrders.map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Order #{order._id.slice(-6)}</h3>
                  <div className="mb-4">
                    <p className="text-gray-600">Customer: {order.userName}</p>
                    <p className="text-gray-600">Address: {order.address}</p>
                    <p className="text-gray-600">Phone: {order.phoneNumber}</p>
                    <p className="text-gray-600">Total: ₹{order.totalPrice}</p>
                    <p className="text-gray-600">Status: {order.deliveryStatus}</p>
                    <div className="mt-2">
                      <p className="font-semibold">Items:</p>
                      {order.artworks.map((item, index) => (
                        <div key={index} className="ml-4 text-sm text-gray-600">
                          • {item.artworkId.title} (₹{item.price})
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => acceptDelivery(order._id)}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  >
                    Accept Delivery
                  </button>
                </div>
              ))
            ) : (
              <>
                {activeTab === 'my-deliveries' && myDeliveries.length > 0 && (
                  <div className="mb-4 bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-2">Bulk Actions</h3>
                    <div className="flex gap-2">
                      <select
                        className="p-2 border rounded flex-1"
                        onChange={(e) => setPendingBulkStatus(e.target.value)}
                        value={pendingBulkStatus}
                      >
                        <option value="" disabled>Update Selected Orders</option>
                        {Array.from(new Set(
                          Array.from(selectedDeliveries)
                            .map(orderId => myDeliveries.find(o => o._id === orderId))
                            .map(order => getAvailableStatuses(order.deliveryStatus))
                            .flat()
                        )).map(status => (
                          <option key={status} value={status}>
                            Mark as {status}
                          </option>
                        ))}
                      </select>
                      {pendingBulkStatus && selectedDeliveries.size > 0 && (
                        <button
                          onClick={() => updateMultipleDeliveryStatus(pendingBulkStatus)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Save All
                        </button>
                      )}
                      <span className="text-gray-600">
                        {selectedDeliveries.size} orders selected
                      </span>
                    </div>
                    {pendingBulkStatus && selectedDeliveries.size > 0 && (
                      <p className="text-sm text-orange-500 mt-1">
                        * Click Save All to apply the status changes
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myDeliveries.map(order => (
                    <div key={order._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedDeliveries.has(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="mr-2"
                        />
                        <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-600">Customer: {order.userName}</p>
                        <p className="text-gray-600">Address: {order.address}</p>
                        <p className="text-gray-600">Phone: {order.phoneNumber}</p>
                        <p className="text-gray-600">Current Status: {order.deliveryStatus}</p>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={pendingStatusUpdates[order._id] || order.deliveryStatus}
                            onChange={(e) => handleStatusSelection(order._id, e.target.value)}
                            className="flex-1 p-2 border rounded"
                          >
                            <option value={order.deliveryStatus}>{order.deliveryStatus}</option>
                            {getAvailableStatuses(order.deliveryStatus).map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {pendingStatusUpdates[order._id] && (
                            <button
                              onClick={() => updateDeliveryStatus(order._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                          )}
                        </div>
                        {pendingStatusUpdates[order._id] && (
                          <p className="text-sm text-orange-500 mt-1">
                            * Click Save to apply the status change
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/order-tracking/${order._id}`}
                        className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-2"
                      >
                        View Tracking Details
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty States */}
        {!loading && activeTab === 'all' && allOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No available orders at the moment.</p>
          </div>
        )}

        {!loading && activeTab === 'my-deliveries' && myDeliveries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't accepted any deliveries yet.</p>
          </div>
        )}

        {/* Alert Message */}
        {showAlert && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded shadow">
            {alertMessage}
            <button onClick={() => setShowAlert(false)} className="ml-4 font-bold">×</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryManagement; 