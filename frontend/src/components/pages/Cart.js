import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

      // Fetch cart details from backend, wrapped in useCallback to prevent re-creation on every render
      const fetchCart = useCallback(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/artworks/cart/${userId}`);
          if (response.ok) {
            const cartData = await response.json();
            setCartItems(cartData.items);
            calculateTotal(cartData.items);
          } else {
            alert('Error fetching cart details');
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }, [userId]);

  useEffect(() => {
    if (!userId) {
      alert("You must be logged in to view your cart.");
      navigate('/'); // Redirect if not logged in
      return;
    }
    fetchCart();
  }, [userId, navigate, fetchCart]);



  // Function to calculate total amount
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.artworkId.price * item.quantity, 0);
    setTotalAmount(total);
  };

  // Handle quantity change with stock limit check
  const handleQuantityChange = async (artworkId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent zero or negative quantities
  
    try {
      const response = await fetch('http://localhost:5000/api/artworks/cart/update-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, artworkId, quantity: newQuantity })
      });
  
      if (response.ok) {
        const updatedCart = await response.json();
        fetchCart();
        // Update the cart items and total amount without refreshing
        setCartItems(updatedCart.items);
        calculateTotal(updatedCart.items);
        
        console.log('Quantity updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Error updating quantity:', errorData.message);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };
  

  
  // Handle remove item from cart
  const handleRemoveItem = async (artworkId) => {
    try {
      const response = await fetch('http://localhost:5000/api/artworks/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, artworkId })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart.items);
        calculateTotal(updatedCart.items);
        alert('Item removed from cart');
        fetchCart();
      } else {
        alert('Error removing item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      alert('Failed to load Razorpay. Please try again.');
      return;
    }
  
    // Create the order on the backend
    try {
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount, // Send the total amount to backend
          currency: 'INR', // INR is default for Indian payments
        }),
      });
  
      const orderData = await response.json(); // Get the order details like order_id
  
      if (!orderData.id) {
        alert('Failed to create Razorpay order. Please try again.');
        return;
      }
  
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay key ID
        amount: orderData.amount,                  // Amount in paise
        currency: orderData.currency,
        name: 'Your Business Name',
        description: 'Artworks Purchase',
        order_id: orderData.id,                    // Razorpay order ID
        handler: function (response) {
          alert('Payment Successful!');
          console.log('Payment ID:', response.razorpay_payment_id);
          console.log('Order ID:', response.razorpay_order_id);
          console.log('Signature:', response.razorpay_signature);
          // You can redirect to a success page or handle post-payment logic here
        },
        prefill: {
          name: 'Customer Name',                   // Prefill user info
          email: 'customer@example.com',           // Prefill user email
        },
        theme: {
          color: 'red',                        // Customize the color
        },
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open(); // Open Razorpay checkout window
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };
  

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.artworkId._id} className="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src={`http://localhost:5000/uploads/${item.artworkId.imageUrl}`} 
                  alt={item.artworkId.title} 
                  className="w-20 h-20 object-contain rounded-lg" 
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.artworkId.title}</h2>
                  <p className="text-sm">Artist: {item.artworkId.artist}</p>
                  <p className="text-sm">Price: ₹{item.artworkId.price}</p>
                  
                  {item.artworkId.stock === null || item.artworkId.stock === 0 ? (
                    <p className="text-red-500 font-semibold">Sold Out</p>
                  ) : (
                    <p className="text-sm">Available Stock: {item.artworkId.stock}</p>
                  )}
                </div>
              </div>
  
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max={item.artworkId.stock}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.artworkId._id, parseInt(e.target.value), item.artworkId.stock)}
                  className="w-16 border rounded-lg p-2 text-center"
                  disabled={item.artworkId.stock === null || item.artworkId.stock === 0} // Disable if out of stock
                  onKeyDown={(e) => e.preventDefault()} // Disable manual input
                />
                <button
                  onClick={() => handleRemoveItem(item.artworkId._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
  
          <div className="mt-5 text-right">
            <p className="text-xl font-semibold">Total Amount: ₹{totalAmount}</p>
            <button
              onClick={handleCheckout}
              className="mt-4 bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600 transition"
              disabled={cartItems.every(item => item.artworkId.stock === 0 || item.artworkId.stock === null)} // Disable checkout if all items are out of stock
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default CartPage;
