import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; 


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
      const response = await axios.post('https://art-gallery-kmgs.onrender.com/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      console.log(response)
      if (response.status === 200) {
        // Store token and user info after successful login
        localStorage.setItem('authToken', response.data.token); 
        localStorage.setItem('username', response.data.username); 
        localStorage.setItem('userId', response.data.userId);  
        localStorage.setItem('role', response.data.role)

      //  const lastPath= localStorage.getItem('lastPath')

  
        handleClose();  

        if (response.data.role === 'user') {
          navigate('/user');  
        } else if (response.data.role === 'artist') {
          navigate('/artist');  
        } else if (response.data.role === 'admin') {
          window.location.href='/admin';
            
        }

        setTimeout(() => {
          window.location.reload(); 
        }, 200); 
        
      } 
      
      else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(error.response.data.message);
    }
  };

  // const handleGoogleLoginSuccess = async (response) => {
  //   try {
  //     const result = await axios.post('https://art-gallery-kmgs.onrender.com/api/auth/google-login', {
  //       token: response.tokenId, // Send Google token to your backend
  //     });
  
  //     const { token, username, userId, role } = result.data;
  //     localStorage.setItem('token', token);
  //     window.location.href = '/user';
  //   } catch (error) {
  //     console.error('Google Login failed:', error.response?.data?.message || error.message);
  //     alert(error.response?.data?.message || 'Google Login failed');
  //   }
  // };
  
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse?.credential);
      console.log("Google User Details: ", decoded);
  
      const response = await axios.post('https://art-gallery-kmgs.onrender.com/api/auth/google-login', {
        token: credentialResponse.credential
      });
  
      if (response.status === 200) {
        console.log("Login successful, backend response: ", response.data);
  
        // Store token and user info after successful login
        localStorage.setItem('authToken', response.data.token); 
        localStorage.setItem('username', response.data.username);  
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('role', response.data.role); 
  
        handleClose();  
        navigate('/user');  
  
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('Backend did not return a 200 status:', response);
        alert('Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google Login failed:', error.message || error);
      alert('Unable to log in with Google. Please try again.');
    }
  };

  
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 bg-opacity-20 backdrop-blur-lg z-50 p-4">
      <div className="bg-white bg-opacity-20 p-4 sm:p-6 rounded-lg w-full sm:w-98 flex flex-col items-center relative backdrop-blur-md shadow-xl bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 z-60">
        <span className="absolute top-2 right-2 text-black text-2xl font-bold cursor-pointer hover:text-red-500" onClick={handleClose}>&times;</span>
        <div className="flex justify-center items-center w-full bg-cover bg-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-md flex flex-col sm:flex-row overflow-hidden">
            {/* Login Section */}
            <div className="bg-black bg-opacity-10 text-white p-6 sm:p-12 w-full sm:w-72">
              <h2 className="text-black text-xl sm:text-2xl mb-4 sm:mb-6 font-bold">LOGIN</h2>
              <form onSubmit={handleSubmit} className="flex flex-col">
                <input
                  id='email'
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="p-2 mb-3 rounded text-black w-full"
                />
                <input 
                  id='password'
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="p-2 mb-1 rounded text-black w-full"
                />
                <p className="font-thin text-[12px] text-right underline hover:underline-offset-1 mb-2" 
                  onClick={() => { handleClose(); navigate('/forgot-password'); }}>
                  forgot password?
                </p>
                <button id='loginb' type="submit" 
                  className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors w-full">
                  Login
                </button>
              </form>
              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess} 
                  onError={() => {
                    console.log('Google Login Failed');
                  }}
                />
              </div>
            </div>

            {/* Sign Up Section */}
            <div className="bg-white bg-opacity-10 p-6 sm:p-12 text-white w-full sm:w-72 flex flex-col items-center sm:items-start">
              <h2 className="text-black text-xl sm:text-2xl">Not a Member?</h2>
              <p className="text-black">Sign Up NOW!</p>
              <button
                className="mt-4 sm:mt-6 p-2 w-32 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                onClick={() => { handleClose(); openRegisterModal(); }}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;