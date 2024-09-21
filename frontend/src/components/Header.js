import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ openModal, openRegisterModal }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">
          <span>ART</span> GALLERY
        </h1>
      </div>
      <nav className="nav-center">
        <ul>
          <li><Link to="/paintings">Paintings</Link></li>
          <li><Link to="/photography">Photography</Link></li>
          <li><Link to="/sculpture">Sculpture</Link></li>
          <li><Link to="/drawings">Drawings</Link></li>
          <li><Link to="/prints">Prints</Link></li>
          <li><Link to="/inspiration">Inspiration</Link></li>
        </ul>
      </nav>
      <div className="header-right">
        <div className="auth-links">
          <span className="login-link" onClick={openModal}>Log In</span>
          <span>|</span>
          <span className="register-link" onClick={openRegisterModal}>Register</span>
        </div>
        <div className="icons">
          <Link to="/wishlist" className="icon">
            <i className="fas fa-heart"></i>
          </Link>
          <Link to="/cart" className="icon">
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">0</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
