  import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../useAuth';
import CustomAlert from '../CustomAlert';

function ProfilePage() {
  useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [role, setRole] = useState('');
  const [artistDescription, setArtistDescription] = useState('');
  const [artistDocument, setArtistDocument] = useState(null);
  const [currentArtistDocument, setCurrentArtistDocument] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [profilePicError, setProfilePicError] = useState('');
  const [artistDocumentError, setArtistDocumentError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://art-gallery-kmgs.onrender.com/api/users/get/${userId}`);
        const data = response.data;
        setUsername(data.username);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setRole(data.role);
        setProfilePicPreview(data.profilePic ? `http://localhost:5000/uploads/${data.profilePic}` : null);
        if (data.role === 'artist') {
          setArtistDescription(data.artistDescription || '');
          setCurrentArtistDocument(data.artistDocument ? `http://localhost:5000/uploads/${data.artistDocument}` : '');
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const validateUsername = (value) => {
    if (!value.trim()) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhoneNumber = (value) => {
    if (!value) {
      setPhoneNumberError('');
      return true; // Phone number is optional
    }
    if (!/^\d{10}$/.test(value)) {
      setPhoneNumberError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneNumberError('');
    return true;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhoneNumber(phoneNumber);
    const isProfilePicValid = !profilePic || /\.(jpg|jpeg|png)$/i.test(profilePic.name);
    const isArtistDocValid = !artistDocument || /\.pdf$/i.test(artistDocument.name);

    if (!isUsernameValid || !isEmailValid || !isPhoneValid || !isProfilePicValid || !isArtistDocValid) {
      setAlertMessage('Please fix the validation errors before submitting.');
      setShowAlert(true);
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    if (profilePic) formData.append('profilePic', profilePic);
    if (role === 'artist') {
      formData.append('artistDescription', artistDescription);
      if (artistDocument) formData.append('artistDocument', artistDocument);
    }

    try {
      await axios.put(`https://art-gallery-kmgs.onrender.com/api/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAlertMessage('Profile updated successfully');
      setShowAlert(true);
    } catch (error) {
      console.error('Error updating profile', error);
      setAlertMessage('Error updating profile: ' + (error.response?.data?.message || 'Unknown error occurred'));
      setShowAlert(true);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
    if (file && !/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setProfilePicError('Profile picture must be a JPG, JPEG, or PNG file.');
    } else {
      setProfilePicError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10); // Only allow digits and limit to 10
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const toggleDocViewer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDocViewer(!showDocViewer);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold mb-8 text-gray-800">Profile</h1>
      <form onSubmit={handleProfileUpdate} encType="multipart/form-data" className="bg-white shadow-lg rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture Section */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-md" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <input
                type="file"
                onChange={handleProfilePicChange}
                accept="image/*"
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {profilePicError && <p className="text-red-500 text-sm">{profilePicError}</p>}
            </div>
          </div>

          {/* Username and Email */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full border ${usernameError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500`}
              required
            />
            {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full border ${emailError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500`}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>

          {/* Phone Number */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter 10 digit number"
              className={`w-full border ${phoneNumberError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500`}
            />
            {phoneNumberError && <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>}
          </div>
        </div>

        {/* Artist Section */}
        {role === 'artist' && (
          <div className="mt-8">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Artist Description</label>
              <textarea
                value={artistDescription}
                onChange={(e) => setArtistDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="4"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Upload Documentation (PDF only)</label>
              {currentArtistDocument && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={toggleDocViewer}
                    className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    {showDocViewer ? 'Hide Document' : 'View Document'}
                  </button>
                  
                  {showDocViewer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                          <h3 className="text-lg font-semibold">Artist Documentation</h3>
                          <button
                            type="button"
                            onClick={toggleDocViewer}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex-1 p-4 bg-gray-100">
                          <object
                            data={currentArtistDocument}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <div className="text-center p-4">
                              <p>Unable to display PDF file. </p>
                              <a 
                                href={currentArtistDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Click here to open the PDF
                              </a>
                            </div>
                          </object>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                onChange={(e) => {
                  setArtistDocument(e.target.files[0]);
                  const file = e.target.files[0];
                  if (file && !/\.pdf$/.test(file.name)) {
                    setArtistDocumentError('Documentation must be a PDF file.');
                  } else {
                    setArtistDocumentError('');
                  }
                }}
                accept="application/pdf"
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {artistDocumentError && <p className="text-red-500 text-sm">{artistDocumentError}</p>}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Save Changes
        </button>
      </form>

      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
    </div>
  );
}

export default ProfilePage;
