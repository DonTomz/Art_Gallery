import React, { useState } from 'react';
import './Register.css';
import { FcGoogle } from "react-icons/fc";

function Register({ show, handleClose }) {
  const [isArtist, setIsArtist] = useState(false);  // Move useState hook to the top

  if (!show) return null;  // Conditional rendering after hooks

  const toggleRole = () => {
    setIsArtist(!isArtist);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content flex-auto bg-red-600">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <div className="modal-box">
          <div className="modal-left">
            <h2>Sign Up</h2>
            <div className="role-toggle">
              <button className={`toggle-btn ${!isArtist ? 'active' : ''}`} onClick={toggleRole}>User</button>
              <button className={`toggle-btn ${isArtist ? 'active' : ''}`} onClick={toggleRole}>Artist</button>
            </div>
            <form>
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Create Password" />
              <button type="submit">Sign Up</button>
              <button className="google-login">
                <div className="google-logo">
                  <FcGoogle />
                </div>
                Sign up with Google
              </button>
            </form>
          </div>
          <div className="modal-right">
            <h2>Already a Member?</h2>
            <p>Login NOW!</p>
            <button onClick={handleClose}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
