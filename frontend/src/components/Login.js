import React, { useState } from 'react';
import './Login.css';
import { FcGoogle } from "react-icons/fc";
import axios from 'axios'; // Import axios for making API requests

function Login({ show, handleClose, openRegisterModal }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending request with data:", formData);  // Log formData before sending
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      // If login is successful
      if (response.status === 200) {
        alert('Login successful!');
        localStorage.setItem('authToken', response.data.token); // Store the token if required
        handleClose();  // Close the modal after successful login
      } else {
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error); // Log the exact error for debugging
      alert('unable to sent user credentials. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <div className="login-container">
          <div className="login-box">
            <div className="login-left">
              <h2>LOGIN</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Login</button>
                <button className="google-login">
                  <div className="google-logo">
                    <FcGoogle />
                  </div>
                  Sign in with Google
                </button>
              </form>
            </div>
            <div className="login-right">
              <h2>Not a Member?</h2>
              <p>Sign Up NOW!</p>
              <button onClick={() => { handleClose(); openRegisterModal(); }}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
