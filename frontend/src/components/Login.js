import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Ensure correct import for jwtDecode

function Login({ show, handleClose, openRegisterModal }) {
  const navigate = useNavigate(); 
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
      console.log("Sending request with data:", formData);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
  
      if (response.status === 200) {
        // Store token and user info after successful login
        localStorage.setItem('authToken', response.data.token); 
        localStorage.setItem('username', response.data.username);  // Store the username
        localStorage.setItem('userId', response.data.userId);  // Store the user ID
  
        handleClose();  // Close the modal after successful login
        navigate('/user/');  // Redirect to user page
        setTimeout(() => {
          window.location.reload(); // Reload the page
        }, 500);  // Delay before reloading
      } else {
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Unable to send user credentials. Please try again.');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      // Decode the Google JWT token
      const decoded = jwtDecode(credentialResponse?.credential);
      console.log("Google User Details: ", decoded);

      // Send Google token to your backend for validation
      const response = await axios.post('http://localhost:5000/api/auth/google-login', {
        token: credentialResponse.credential
      });

      if (response.status === 200) {
        // Store token and user info after successful login
        localStorage.setItem('authToken', response.data.token); 
        localStorage.setItem('username', response.data.username);  // Store the username
        localStorage.setItem('userId', response.data.userId);  // Store the user ID
  
        handleClose();  // Close the modal after successful login
        navigate('/user');  // Redirect to user page
        setTimeout(() => {
          window.location.reload(); // Reload the page
        }, 500);  // Delay before reloading
      } else {
        alert('Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google Login failed:', error);
      alert('Unable to log in with Google. Please try again.');
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
                  className='text-black'
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className='text-black'
                />
                <button type="submit">Login</button>
              </form>
              <div className='google-login'>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}  // Handle successful Google login
                  onError={() => {
                    console.log('Google Login Failed');
                  }}
                />
              </div>
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
