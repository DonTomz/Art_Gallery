import React, { useState } from 'react';
// import './Register.css';

function Register({ show, handleClose, openLoginModal }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''  // Empty by default
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };

    switch (name) {
      case 'username':
        const usernameRegex = /^[A-Za-z][A-Za-z0-9_]*$/;
        if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters long';
        } else if (!usernameRegex.test(value)) {
          errors.username = 'Username must start with an alphabet and contain only letters, numbers, or underscores';
        } else {
          errors.username = '';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|gov|edu)$/;
        errors.email = emailRegex.test(value) ? '' : 'Invalid email address. Allowed domains are .com, .in, .gov, .edu';
        break;

      case 'password':
        errors.password = value.length >= 6 ? '' : 'Password must be at least 6 characters long';
        break;

      default:
        break;
    }

    setFormErrors(errors);
    setIsFormValid(Object.values(errors).every((error) => error === '') && formData.role !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://art-gallery-kmgs.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful!');
        handleClose();
        openLoginModal();
      } else {
        alert('Registration failed. Please try again. ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 bg-opacity-20 backdrop-blur-lg z-50">
      <div className="bg-white bg-opacity-20 p-6 rounded-lg w-98 flex flex-col items-center relative backdrop-blur-md shadow-xl bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 z-60">
        <span className="absolute top-2 right-2 text-black text-2xl font-bold cursor-pointer hover:text-red-500" onClick={handleClose}>&times;</span>
        
        <div className="bg-white bg-opacity-70 rounded-lg shadow-md p-8 w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Register as</label>
              <div className="grid grid-cols-2 gap-2">
                {['user', 'artist', 'delivery'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-2 rounded-lg text-center capitalize transition-colors duration-200
                      ${formData.role === role 
                        ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`p-2 rounded border ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.username && <span className="text-red-500 text-sm">{formErrors.username}</span>}
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`p-2 rounded border ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.email && <span className="text-red-500 text-sm">{formErrors.email}</span>}
            
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`p-2 rounded border ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.password && <span className="text-red-500 text-sm">{formErrors.password}</span>}
            
            <button 
              type="submit" 
              disabled={!isFormValid}
              className={`p-2 rounded text-white font-bold transition-colors duration-200
                ${isFormValid 
                  ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 hover:opacity-90' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Already a member?</p>
            <button
              className="mt-2 text-pink-500 hover:text-red-700 font-semibold transition-colors duration-200"
              onClick={() => { handleClose(); openLoginModal(); }}
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
