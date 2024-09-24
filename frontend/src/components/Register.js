import React, { useState } from 'react';
import './Register.css';
// import Login from './Login';
import { FcGoogle } from "react-icons/fc";
import axios from 'axios'; // Import axios for API requests

function Register({ show, handleClose, openLoginModal }) {
  const [isArtist, setIsArtist] = useState(false); 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  if (!show) return null;

  const toggleRole = () => {
    setIsArtist(!isArtist);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page reload on form submission
  // const queryClient = useQueryClient();

  
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)   

    });

    const data = await response.json();   


    // Handle successful registration
    alert('Registration successful!');
    console.log(data);

    return data;
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
                <button className={`toggle-btn ${!isArtist ? 'active' : ''}`} onClick={toggleRole}>User</button>
                <button className={`toggle-btn ${isArtist ? 'active' : ''}`} onClick={toggleRole}>Artist</button>
              </div>
              <form onSubmit={handleSubmit}>  {/* Form submission is handled here */}
                <input
                  type="text"
                  name="username"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
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
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit" >Sign Up</button> {/* This is the correct submission button */}
                <button className="google-login">
                  <div className="google-logo">
                    <FcGoogle />
                  </div>
                  Sign up with Google
                </button>
              </form>
            </div>
            <div className="signup-right">
              <h2>Already a Member?</h2>
              <p>Login NOW!</p>
              <button onClick={()=>{handleClose();openLoginModal();}}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
