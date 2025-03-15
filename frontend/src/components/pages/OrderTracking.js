import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function OrderTracking() {
  const { orderId } = useParams();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}/tracking`);
        setTrackingInfo(response.data);
      } catch (error) {
        setError('Failed to fetch tracking information');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [orderId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!trackingInfo) return <div className="text-center">No tracking information available</div>;

  const getStatusColor = (status) => {
    const colors = {
      'Not Shipped': 'bg-gray-200',
      'Picked up': 'bg-blue-200',
      'In Transit': 'bg-yellow-200',
      'Out for Delivery': 'bg-orange-200',
      'Delivered': 'bg-green-200',
      'Returned': 'bg-red-200'
    };
    return colors[status] || 'bg-gray-200';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Order Tracking</h1>
        
        {/* Tracking Header */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-semibold">{trackingInfo.orderId}</p>
            </div>
            <div>
              <p className="text-gray-600">Courier Partner</p>
              <p className="font-semibold">{trackingInfo.courierPartner}</p>
            </div>
            <div>
              <p className="text-gray-600">Tracking ID</p>
              <p className="font-semibold">{trackingInfo.trackingId}</p>
            </div>
            <div>
              <p className="text-gray-600">Estimated Delivery</p>
              <p className="font-semibold">
                {trackingInfo.estimatedDeliveryDate 
                  ? new Date(trackingInfo.estimatedDeliveryDate).toLocaleDateString()
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="relative">
          {trackingInfo.trackingDetails.map((detail, index) => (
            <div key={index} className="mb-8 flex">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(detail.status)}`}></div>
                {index !== trackingInfo.trackingDetails.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200"></div>
                )}
              </div>
              <div>
                <p className="font-semibold">{detail.status}</p>
                <p className="text-sm text-gray-600">{detail.location}</p>
                <p className="text-sm text-gray-500">
                  {new Date(detail.timestamp).toLocaleString()}
                </p>
                <p className="text-sm">{detail.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50">
          <p className="font-semibold">Current Status</p>
          <p className="text-lg font-bold text-blue-600">{trackingInfo.currentStatus}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking; 