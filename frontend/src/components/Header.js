import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Custom hook to determine if the screen width is less than a specific value
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handleChange = () => setMatches(media.matches);
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, [query]);
  return matches;
};

const Header = ({ openModal, openRegisterModal }) => {
  const [username, setUsername] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const dropdownRef = useRef(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedRole) {
      setRole(storedRole);
    }

    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setRole(null);
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const renderNavLinks = () => {
    if (isMobile) {
      return (
        <>
          <Link to="/" className="text-black font-medium text-base no-underline hover:text-gray-600">Home</Link>
          <Link to="/category/Painting" className="text-black font-medium text-base no-underline hover:text-gray-600">Paintings</Link>
          <Link to="/category/Photography" className="text-black font-medium text-base no-underline hover:text-gray-600">Photography</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/" className="text-black font-medium text-base no-underline hover:text-gray-600">Home</Link>
        <Link to="/category/Painting" className="text-black font-medium text-base no-underline hover:text-gray-600">Paintings</Link>
        <Link to="/category/Photography" className="text-black font-medium text-base no-underline hover:text-gray-600">Photography</Link>
        <Link to="/category/Sculpture" className="text-black font-medium text-base no-underline hover:text-gray-600">Sculpture</Link>
        <Link to="/category/Drawings" className="text-black font-medium text-base no-underline hover:text-gray-600">Drawings</Link>
        <Link to="/category/Prints" className="text-black font-medium text-base no-underline hover:text-gray-600">Prints</Link>
        <Link to="/category/Inspiration" className="text-black font-medium text-base no-underline hover:text-gray-600">Inspiration</Link>
      </>
    );
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-3 px-5 bg-white border-b border-gray-300">
      <div className="text-2xl font-bold text-black mb-3 md:mb-0">
        <span>ART </span> <span className='block'>GALLERY</span>
      </div>
      <nav className="flex flex-wrap md:flex-nowrap space-x-4 md:space-x-6 mb-3 md:mb-0">
        {role !== 'admin' && renderNavLinks()}
      </nav>
      <div className="flex items-center space-x-5">
        {username ? (
          <div className="relative" ref={dropdownRef}>
            <button id='usernamed'
              onClick={toggleDropdown}
              className="text-black font-medium text-base hover:text-gray-600"
            >
              {username} <i className="fas fa-caret-down"></i>
            </button>
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {role !== 'admin' && (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-black hover:bg-gray-100 no-underline"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <i className="fas fa-user mr-2"></i>Profile
                    </Link>
                    <Link
                      to="/myorders"
                      className="block px-4 py-2 text-black hover:bg-gray-100 no-underline"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <i className="fas fa-box mr-2"></i>My Orders
                    </Link>
                  </>
                )}
                {role === 'artist' && (
                  <>
                    <Link
                      to="/add-artwork"
                      className="block px-4 py-2 text-black hover:bg-gray-100 no-underline"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <i id="addartwork" className="fas fa-plus mr-2"></i>Add Artwork
                    </Link>
                    <Link
                      to="/artist/artworks"
                      className="block px-4 py-2 text-black hover:bg-gray-100 no-underline"
                      onClick={() => setDropdownVisible(false)}
                    >
                      <i className="fas fa-palette mr-2"></i>Your Works
                    </Link>
                  </>
                )}
                <button id='logout'
                  onClick={() => {
                    handleLogout();
                    setDropdownVisible(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex wrap space-x-2">
            <span id="login"
              className="cursor-pointer text-black font-medium text-base hover:text-gray-600"
              onClick={openModal}
            >
              Log In
            </span>
            <span>|</span>
            <span
              className="cursor-pointer text-black font-medium text-base hover:text-gray-600"
              onClick={openRegisterModal}
            >
              Register
            </span>
          </div>
        )}
        {role !== 'admin' && (
          <div className="flex items-center space-x-3">
            <Link to="/wishlist" className="text-black text-xl hover:text-gray-600">
              <i className="fas fa-heart"></i>
            </Link>
            <Link to="/cart" className="relative text-black text-xl hover:text-gray-600">
              <i id = "cart" className="fas fa-shopping-cart"></i>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
