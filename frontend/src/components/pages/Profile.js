import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
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
    // Fetch the current user's data
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
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
      await axios.put(`http://localhost:5000/api/users/${userId}`, formData, {
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
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-5">Edit Profile</h1>
      <form onSubmit={handleProfileUpdate} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Profile Picture:</label>
          {profilePicPreview && (
            <img src={profilePicPreview} alt="Profile Preview" className="w-20 h-20 mb-2 rounded-full object-cover" />
          )}
          <input type="file" onChange={handleProfilePicChange} accept="image/*" />
        </div>

        {role === 'artist' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700">Artist Description:</label>
              <textarea
                value={artistDescription}
                onChange={(e) => setArtistDescription(e.target.value)}
                className="border p-2 w-full"
                rows="4"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Upload Documentation (PDF only):</label>
              {currentArtistDocument && (
                <div>
                  <a
                    href={currentArtistDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Current Documentation
                  </a>
                </div>
              )}
              <input type="file" onChange={(e) => setArtistDocument(e.target.files[0])} accept="application/pdf" />
            </div>
          </>
        )}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
