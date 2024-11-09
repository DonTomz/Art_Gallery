import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function SuccessPage() {
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const storedOrderInfo = localStorage.getItem('successfulOrder');
    if (storedOrderInfo) {
      setOrderInfo(JSON.parse(storedOrderInfo));
      // Clear the stored info after retrieving it
      localStorage.removeItem('successfulOrder');
    }
  }, []);

  if (!orderInfo) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-5">Order Information Not Available</h1>
        <p>Some order details are missing. Please check your order history or contact support.</p>
        <Link to="/" className="mt-5 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-600">Payment Successful!</h1>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Order ID:</p>
          <p className="font-semibold">{orderInfo.orderId}</p>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Order Date:</p>
          <p className="font-semibold">{orderInfo.orderDate ? new Date(orderInfo.orderDate).toLocaleString() : 'Not available'}</p>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Payment ID:</p>
          <p className="font-semibold">{orderInfo.paymentId}</p>
        </div>
        <div className="text-center">
          <Link to="/myorders" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
