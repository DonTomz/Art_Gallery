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
      const response = await axios.post('http://localhost:5000/api/auth/login', {
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

  
        handleClose();  
        if (response.data.role === 'user') {
          navigate('/user');  
        } else if (response.data.role === 'artist') {
          navigate('/artist');  
        } else if (response.data.role === 'admin') {
          navigate('/admin');  
        }
        setTimeout(() => {
          window.location.reload(); 
        }, 500); 
        
      } else {
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed');
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
        localStorage.setItem('username', response.data.username);  
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('role', response.data.role)  
  
        handleClose();  
        navigate('/user');  
        setTimeout(() => {
          window.location.reload();
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
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 bg-opacity-20 backdrop-blur-lg z-50">
    <div className="bg-white bg-opacity-20 p-6 rounded-lg w-98 flex flex-col items-center relative backdrop-blur-md shadow-xl bg-[url('E:/Projects/Art_Gallery/frontend/src/images/Login_Image.jpg')] z-60">
      <span className="absolute top-2 right-2 text-white text-2xl font-bold cursor-pointer hover:text-red-500" onClick={handleClose}>&times;</span>
      <div className="flex justify-center items-center w-full bg-cover bg-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-md flex overflow-hidden">
          <div className="bg-black bg-opacity-10 text-white p-12 w-72">
            <h2 className="text-black text-2xl mb-6 font-bold">LOGIN</h2>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-2 mb-3 rounded text-black"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="p-2 mb-1 rounded text-black"
              />
              <p className="font-thin text-[12px] text-right underline hover:underline-offset-1" onClick={() => { handleClose(); navigate('/forgot-password'); }}>forgot password?</p>
              <button type="submit" className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Login</button>
            </form>
            <div className="mt-4">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess} 
                onError={() => {
                  console.log('Google Login Failed');
                }}
              />
            </div>
          </div>
          <div className="bg-white bg-opacity-10 p-12 text-white w-72">
            <h2 className="text-black text-2xl">Not a Member?</h2>
            <p className="text-black">Sign Up NOW!</p>
            <button
              className="mt-6 p-2 w-32 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              onClick={() => { handleClose(); openRegisterModal(); }}> Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
}

export default Login;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { GoogleLogin } from '@react-oauth/google';
// import { jwtDecode } from 'jwt-decode'; 
// import ForgotPassword from './pages/ForgotPassword';

// function Login({ show, handleClose, openRegisterModal }) {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showForgotPassword, setShowForgotPassword] = useState(false); // State to toggle forgot password form

//   if (!show) return null;

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log("Sending request with data:", formData);
//       const response = await axios.post('http://localhost:5000/api/auth/login', {
//         email: formData.email,
//         password: formData.password
//       });
//       console.log(response)
//       if (response.status === 200) {
//         localStorage.setItem('authToken', response.data.token); 
//         localStorage.setItem('username', response.data.username); 
//         localStorage.setItem('userId', response.data.userId);  
//         localStorage.setItem('role', response.data.role);

//         handleClose(); 
//         if (response.data.role === 'user') {
//           navigate('/user');  
//         } else if (response.data.role === 'artist') {
//           navigate('/artist');  
//         } else if (response.data.role === 'admin') {
//           navigate('/admin');  
//         }
//         setTimeout(() => {
//           window.location.reload(); 
//         }, 500); 
//       } else {
//         alert('Invalid email or password. Please try again.');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//       alert('Login failed');
//     }
//   };

//   const handleGoogleLoginSuccess = async (credentialResponse) => {
//     try {
//       const decoded = jwtDecode(credentialResponse?.credential);
//       const response = await axios.post('http://localhost:5000/api/auth/google-login', {
//         token: credentialResponse.credential

//       });
//       if (response.status === 200) {
//         localStorage.setItem('authToken', response.data.token); 
//         localStorage.setItem('username', response.data.username);  
//         localStorage.setItem('userId', response.data.userId);
//         localStorage.setItem('role', response.data.role);

//         handleClose();  
//         navigate('/user');
//         setTimeout(() => {
//           window.location.reload();
//         }, 500);  
//         console.log(decoded)
//       } else {
//         alert('Google login failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Google Login failed:', error);
//       alert('Unable to log in with Google. Please try again.');
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-gray-50 bg-opacity-20 backdrop-blur-lg z-50">
//       <div className="bg-white bg-opacity-20 p-6 rounded-lg w-98 flex flex-col items-center relative backdrop-blur-md shadow-xl bg-[url('E:/Projects/Art_Gallery/frontend/src/images/Login_Image.jpg')] z-60">
//         <span className="absolute top-2 right-2 text-white text-2xl font-bold cursor-pointer hover:text-red-500" onClick={handleClose}>&times;</span>
//         <div className="flex justify-center items-center w-full bg-cover bg-center">
//           <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-md flex overflow-hidden">
//             {showForgotPassword ? (
//               <ForgotPassword handleBack={() => setShowForgotPassword(false)} /> // Show Forgot Password Form
//             ) : (
//               <>
//                 <div className="bg-black bg-opacity-10 text-white p-12 w-72">
//                   <h2 className="text-black text-2xl mb-6 font-bold">LOGIN</h2>
//                   <form onSubmit={handleSubmit} className="flex flex-col">
//                     <input
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       required
//                       className="p-2 mb-3 rounded text-black"
//                     />
//                     <input
//                       type="password"
//                       name="password"
//                       placeholder="Password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       className="p-2 mb-1 rounded text-black"
//                     />
//                     <p
//                       className="font-thin text-[12px] text-right underline hover:underline-offset-1 cursor-pointer"
//                       onClick={() => setShowForgotPassword(true)} // Show forgot password form on click
//                     >
//                       Forgot password?
//                     </p>
//                     <button type="submit" className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
//                       Login
//                     </button>
//                   </form>
//                   <div className="mt-4">
//                     <GoogleLogin
//                       onSuccess={handleGoogleLoginSuccess}
//                       onError={() => console.log('Google Login Failed')}
//                     />
//                   </div>
//                 </div>
//                 <div className="bg-white bg-opacity-10 p-12 text-white w-72">
//                   <h2 className="text-black text-2xl">Not a Member?</h2>
//                   <p className="text-black">Sign Up NOW!</p>
//                   <button
//                     className="mt-6 p-2 w-32 bg-black text-white rounded hover:bg-gray-800 transition-colors"
//                     onClick={() => { handleClose(); openRegisterModal(); }}>
//                     Sign Up
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;
