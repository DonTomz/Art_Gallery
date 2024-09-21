// src/components/Login.js
import React from 'react';
import './Login.css';
import { FcGoogle } from "react-icons/fc";

function Login({ show, handleClose }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <span className="close-button" onClick={handleClose}>&times;</span>
        <div className="login-container">
          <div className="login-box">
            <div className="login-left">
              <h2>LOGIN</h2>
              <form>
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
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
              <button>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
