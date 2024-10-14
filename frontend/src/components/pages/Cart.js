import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("You must be logged in to view your cart.");
      navigate('/'); // Redirect if not logged in
      return;
    }

    // Fetch cart details from backend
    const fetchCart = async () => {
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
    };

    fetchCart();
  }, [userId, navigate]);

  // Function to calculate total amount
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.artworkId.price * item.quantity, 0);
    setTotalAmount(total);
  };

  // Handle quantity change
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
        setCartItems(updatedCart.items);
        calculateTotal(updatedCart.items);
        setTimeout(() => {
          window.location.reload(); 
        }, 200); 
      } else {
        alert('Error updating quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
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
      } else {
        alert('Error removing item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    // Implement your checkout logic here
    alert(`Proceeding to checkout. Total amount: ₹${totalAmount}`);
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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.artworkId._id, parseInt(e.target.value))}
                  className="w-16 border rounded-lg p-2 text-center"
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
