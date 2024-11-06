import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to install and import axios

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  // const [selectedAddress, setSelectedAddress] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const fetchCartItems = useCallback(async () => {
    try {
      const response = await fetch(`https://art-gallery-kmgs.onrender.com/api/artworks/cart/${userId}`);
      if (response.ok) {
        const cartData = await response.json();
        setCartItems(cartData.items || []);
      } else {
        alert('Error fetching cart details.');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, [userId]);

      // Fetch saved addresses
      const fetchSavedAddresses = useCallback(async () => {
        try {
          const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/users/${userId}/addresses`);
          setSavedAddresses(response.data);
        } catch (error) {
          console.error('Error fetching saved addresses:', error);
        }
      }, [userId]);
  
  useEffect(() => {
    if (userId) {
      fetchCartItems();
      fetchSavedAddresses();
    } else {
      alert('You must be logged in to proceed.');
      navigate('/');
    }
  }, [userId, navigate, fetchCartItems, fetchSavedAddresses]);



  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.artworkId.price * item.quantity, 0);
  };



  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };







  const handlePayment = async () => {
    const totalAmount = calculateTotalAmount();
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert('Failed to load Razorpay. Please try again.');
      return;
    }

    try {
      const userGetEmail = await axios.get(`https://art-gallery-kmgs.onrender.com/api/users/get/${userId}`);
      console.log(userGetEmail.data.email);
      // Create order in the database
      const orderResponse = await axios.post('https://art-gallery-kmgs.onrender.com/api/payment/orders', {
        userId: localStorage.getItem('userId'),
        userEmail: userGetEmail.data.email,
        userName: `${firstName} ${lastName}`,
        address: address,
        phoneNumber: phoneNumber,
        artworks: cartItems.map(item => ({
          artworkId: item.artworkId._id,
          artworkName: item.artworkId.title,
          quantity: item.quantity,
          price: item.artworkId.price
        })),
        totalPrice: totalAmount
      });

      console.log('Order created:', orderResponse.data);
      const orderId = orderResponse.data.id;
      console.log(orderId)

      console.log('Creating Razorpay order...');
      // Create Razorpay order
      const response = await fetch('https://art-gallery-kmgs.onrender.com/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
        }),
      });

      const orderData = await response.json();
      // console.log(orderData);

      if (!orderData.id) {
        alert('Failed to create Razorpay order. Please try again.');
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Art Gallery',
        description: 'Artworks Purchase',
        order_id: orderData.id,
        handler: async function (response) {
          alert('Payment Successful!');
          console.log('Payment ID:', response.razorpay_payment_id);
          console.log('Order ID:', response.razorpay_order_id);
          console.log('Signature:', response.razorpay_signature);

          console.log(orderData.id)
          
          // Update order with payment details
          const updatedOrder = await axios.patch(`https://art-gallery-kmgs.onrender.com/api/payment/orders/${orderId}`, {
            status: 'Paid',
            paymentId: response.razorpay_payment_id
          });
          
          // Clear the cart after successful payment
          await clearCart();
          
             // Store order information in localStorage
          localStorage.setItem('successfulOrder', JSON.stringify({
            orderId: response.razorpay_order_id,
            orderDate: updatedOrder.data.createdAt,
            paymentId: response.razorpay_payment_id,
          }));
        
          navigate('/success')
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: userGetEmail.data.email, 
        },
        theme: {
          color: 'red',
        },
      };

      console.log('Opening Razorpay payment window...');
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error during checkout:', error);
      alert(`Failed to initiate payment. Error: ${error.response.data.message}`);
    }
  };






  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setSelectedAddressId(null);
    // Clear the form fields
    setFirstName('');
    setLastName('');
    setAddress('');
    setPhoneNumber('');
    setCountry('');
    setState('');
    setDistrict('');
    setPincode('');
  };



  const handleSelectExistingAddress = (addressId) => {
    setShowAddressForm(false);
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      setFirstName(selectedAddress.firstName);
      setLastName(selectedAddress.lastName);
      setAddress(selectedAddress.address);
      setPhoneNumber(selectedAddress.phoneNumber);
      setCountry(selectedAddress.country);
      setState(selectedAddress.state);
      setDistrict(selectedAddress.district);
      setPincode(selectedAddress.pincode);
    }
  };



  const handleEditAddress = (addressId) => {
    setShowAddressForm(true);
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      setFirstName(selectedAddress.firstName);
      setLastName(selectedAddress.lastName);
      setAddress(selectedAddress.address);
      setPhoneNumber(selectedAddress.phoneNumber);
      setCountry(selectedAddress.country);
      setState(selectedAddress.state);
      setDistrict(selectedAddress.district);
      setPincode(selectedAddress.pincode);
    }
  };



  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`https://art-gallery-kmgs.onrender.com/api/users/${userId}/addresses/${addressId}`);
      setSavedAddresses(savedAddresses.filter(addr => addr._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setShowAddressForm(false);
      }
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };



  const handleSaveAddress = async () => {
    try {
      const addressData = {
        firstName,
        lastName,
        address,
        phoneNumber,
        country,
        state,
        district,
        pincode
      };

      let response;
      if (selectedAddressId) {
        // Update existing address
        response = await axios.put(`https://art-gallery-kmgs.onrender.com/api/users/${userId}/addresses/${selectedAddressId}`, addressData);
        const updatedAddresses = savedAddresses.map(addr => 
          addr._id === selectedAddressId ? response.data : addr
        );
        setSavedAddresses(updatedAddresses);
      } else {
        // Create new address
        response = await axios.post(`https://art-gallery-kmgs.onrender.com/api/users/${userId}/addresses`, addressData);
        setSavedAddresses([...savedAddresses, response.data]);
      }

      setShowAddressForm(false);
      setSelectedAddressId(response.data._id);
      alert('Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };



  const clearCart = async () => {
    try {
      const response = await fetch(`https://art-gallery-kmgs.onrender.com/api/artworks/cart/clear/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Cart cleared successfully');
      } else {
        console.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };


  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Address Details Panel */}
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Address Details</h2>
            
            {/* Existing Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Saved Addresses</h3>
                {savedAddresses.map((addr) => (
                  <div key={addr._id} className="flex items-center mb-2">
                    <input
                      id = "address"
                      type="radio"
                      // id={addr._id}
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleSelectExistingAddress(addr._id)}
                      className="mr-2"
                    />
                    <label htmlFor={addr._id} className="text-sm text-gray-700 flex-1">
                      <strong>{addr.firstName} {addr.lastName}</strong><br />
                      {addr.address}, {addr.district}, {addr.state}, {addr.pincode}
                    </label>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditAddress(addr._id);
                      }}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAddress(addr._id);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Button */}
            <button
              onClick={handleAddNewAddress}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Address
            </button>

            {/* Address form fields */}
            {showAddressForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Save Address Button */}
            {showAddressForm && (
              <button
                onClick={handleSaveAddress}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Save Address
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Order Summary</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.artworkId._id} className="py-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.artworkId.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-medium text-gray-900">₹{item.artworkId.price * item.quantity}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex justify-between items-center">
              <span className="text-2xl font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-semibold text-gray-900">₹{calculateTotalAmount()}</span>
            </div>

            {/* Payment Button */}
            <div className="mt-8">
              <button
                id='payment'
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartItems.length === 0}
              >
                {cartItems.length === 0 ? 'No Items to Checkout' : `Pay ₹${calculateTotalAmount()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
