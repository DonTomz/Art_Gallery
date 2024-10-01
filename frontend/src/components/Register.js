import React, { useState } from 'react';
import './Register.css';

function Register({ show, handleClose, openLoginModal }) {
  const [isArtist, setIsArtist] = useState(false); 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User'  // Add role to formData
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [isFormValid, setIsFormValid] = useState(false); // Track overall form validity

  if (!show) return null;

  // Toggle role between User and Artist
  const toggleRole = () => {
    setIsArtist(!isArtist);
    setFormData({
      ...formData,
      role: isArtist ? 'User' : 'Artist'  // Toggle between 'User' and 'Artist'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Run validation after each input change
    validateField(name, value);
  };

 // Validation logic for each field
const validateField = (name, value) => {
  let errors = { ...formErrors };

  switch (name) {
    case 'username':
      // Username must start with an alphabet and be at least 3 characters long
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
      // Email must end with one of the allowed domains (.com, .in, .gov, .edu)
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|gov|edu)$/;
      errors.email = emailRegex.test(value) ? '' : 'Invalid email address. Allowed domains are .com, .in, .gov, .edu';
      break;

    case 'password':
      // Password must be at least 6 characters long
      errors.password = value.length >= 6 ? '' : 'Password must be at least 6 characters long';
      break;

    default:
      break;
  }

  setFormErrors(errors);

  // Check if form is valid after each change
  setIsFormValid(Object.values(errors).every((error) => error === ''));
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)  // formData contains the 'role' (User or Artist)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Registration successful!');
      console.log(data)
      handleClose();
    } else {
      console.log(data)
      alert('Registration failed. Please try again.'+ data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};


  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <div className="signup-container">
          <div className="signup-box">
            <div className="signup-left">
              <h2>SIGN UP</h2>
              <div className="role-toggle">
                <button 
                  className={`toggle-btn ${!isArtist ? 'active' : ''}`} 
                  onClick={toggleRole}>
                  User
                </button>
                <button 
                  className={`toggle-btn ${isArtist ? 'active' : ''}`} 
                  onClick={toggleRole}>
                  Artist
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  placeholder="Full Name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={`text-black ${formErrors.username && 'input-error'}`}
                />
                {formErrors.username && <span className="error-message">{formErrors.username}</span>}
                
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`text-black ${formErrors.email && 'input-error'}`}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`text-black ${formErrors.password && 'input-error'}`}
                />
                {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                
                <button type="submit" disabled={!isFormValid}>Sign Up</button> 
              </form>
            </div>
            <div className="signup-right">
              <h2>Already a Member?</h2>
              <p>Login NOW!</p>
              <button onClick={() => { handleClose(); openLoginModal(); }}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
