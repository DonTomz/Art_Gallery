import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/payment/orders/user/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

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
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">Date: {new Date(order.createdAt).toLocaleString()}</p>
              <p className="text-gray-600 mb-4">Total Price: ₹{order.totalPrice.toFixed(2)}</p>
              
              <h3 className="text-lg font-semibold mb-2">Ordered Products:</h3>
              <ul className="space-y-2">
                {order.artworks.map((artworks) => (
                  <li key={artworks.artworkId} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{artworks.artworkName}</p>
                      <p className="text-sm text-gray-600">Quantity: {artworks.quantity}</p>
                    </div>
                    <p className="font-medium">₹{artworks.price.toFixed(2)}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
