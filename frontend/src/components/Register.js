import React, { useState } from 'react';
// import './Register.css';

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
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 bg-opacity-20 backdrop-blur-lg z-50">
      <div className="bg-white bg-opacity-20 p-6 rounded-lg w-98 flex flex-col items-center relative backdrop-blur-md shadow-xl bg-[url('E:/Projects/Art_Gallery/frontend/src/images/Register_Image.jpeg')] ">
        <span className="absolute top-2 right-2 text-white text-2xl font-bold cursor-pointer hover:text-red-500" onClick={handleClose}>&times;</span>
        <div className="flex justify-center items-center w-full bg-cover bg-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-md flex overflow-hidden">
            <div className="bg-black bg-opacity-10 text-white p-12 w-72">
              <h2 className="text-white text-2xl mb-6 font-bold">SIGN UP</h2>
              
              <div className="flex justify-between mb-4 ">
                <button 
                  className={`p-2 w-32 rounded ${!isArtist ? 'bg-green-600 text-white' : 'bg-gray-300 text-black'} hover:text-white transition-all`} 
                  onClick={toggleRole}>
                  User
                </button>
                <button 
                  className={`p-2 w-32 rounded ${isArtist ? 'bg-green-600 text-white' : 'bg-gray-300 text-black'} hover:text-white transition-all`} 
                  onClick={toggleRole}>
                  Artist
                </button>
              </div>


              <form onSubmit={handleSubmit} className="flex flex-col">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={`p-2 mb-3 rounded text-black ${formErrors.username && 'border border-red-500'}`}
                />
                {formErrors.username && <span className="text-red-500 text-sm">{formErrors.username}</span>}
                
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`p-2 mb-3 rounded text-black ${formErrors.email && 'border border-red-500'}`}
                />
                {formErrors.email && <span className="text-red-500 text-sm">{formErrors.email}</span>}
                
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`p-2 mb-3 rounded text-black ${formErrors.password && 'border border-red-500'}`}
                />
                {formErrors.password && <span className="text-red-500 text-sm">{formErrors.password}</span>}
                
                <button type="submit" disabled={!isFormValid} className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Sign Up</button> 
              </form>
            </div>

            <div className="bg-white bg-opacity-10 p-12 text-white w-72">
              <h2 className="text-black font-bold text-2xl">Already a Member?</h2>
              <p className="text-black">Login NOW!</p>
              <button
                className="mt-6 p-2 w-32 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                onClick={() => { handleClose(); openLoginModal(); }}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Register;
