import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../useAuth';

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
        setProfilePicPreview(data.profilePic ? `https://art-gallery-kmgs.onrender.com/uploads/${data.profilePic}` : null);
        if (data.role === 'artist') {
          setArtistDescription(data.artistDescription || '');
          setCurrentArtistDocument(data.artistDocument ? `https://art-gallery-kmgs.onrender.com/uploads/${data.artistDocument}` : '');
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
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
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Error updating profile');
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
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
            </div>
          </div>

          {/* Username and Email */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
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
                <div className="mb-2">
                  <a
                    href={currentArtistDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Current Documentation
                  </a>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setArtistDocument(e.target.files[0])}
                accept="application/pdf"
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
    </div>
  );
}

export default ProfilePage;
