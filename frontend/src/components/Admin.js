import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [activeSection, setActiveSection] = useState('users'); // 'users', 'artists', 'artworks'
  const [artistSubSection, setArtistSubSection] = useState('all'); // 'all', 'approved'
  const navigate = useNavigate();

// Check if the user is an admin and redirect if not
useEffect(() => {
  const storedRole = localStorage.getItem('role');

  if (storedRole !== 'admin') {
    navigate('/'); // Redirect to home if not admin
  }
  fetchData();
  fetchArtworks();
}, [navigate]);


  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data.users);
      setArtists(response.data.artists);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };


  const fetchArtworks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/artworks');
      setArtworks(response.data.artworks);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching artworks', error);
    }
  };


 

  // Approve artist and update the local state
  const approveArtist = async (artistId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/artist/approve/${artistId}`);
      setArtists(
        artists.map((artist) =>
          artist._id === artistId ? { ...artist, isApproved: true } : artist
        )
      );
    } catch (error) {
      console.error('Error approving artist', error);
    }
  };

  // Disapprove artist and refetch updated data
  const disapproveArtist = async (artistId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/artist/disapprove/${artistId}`);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setArtists(response.data.artists);
    } catch (error) {
      console.error('Error disapproving artist', error);
    }
  };

  // Block user
  const blockUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/user/block/${userId}`);
      setUsers(users.map(user => user._id === userId ? { ...user, isBlock: true } : user));
      console.log(response.data.message);
    } catch (error) {
      console.error('Error blocking user', error);
    }
  };

  // Unblock user
  const unblockUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/user/unblock/${userId}`);
      setUsers(users.map(user => user._id === userId ? { ...user, isBlock: false } : user));
      console.log(response.data.message);
    } catch (error) {
      console.error('Error unblocking user', error);
    }
  };

  // Render Users Section
  const renderUsersSection = () => (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Users</h3>
      <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
        <thead>
          <tr>
            <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Username</th>
            <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t border-gray-100">
              <td className="py-4 px-6 text-sm">{user.username}</td>
              <td className="py-4 px-6 text-sm">{user.email}</td>
              <td className="py-4 px-6">
                {user.isBlock ? (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                    onClick={() => unblockUser(user._id)}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
                    onClick={() => blockUser(user._id)}
                  >
                    Block
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render Artists Section
  const renderArtistsSection = () => {
    const filteredArtists = () => {
      switch (artistSubSection) {
        case 'approved':
          return artists.filter((artist) => artist.isApproved);
        case 'pending':
          return artists.filter((artist) => !artist.isApproved);
        default:
          return artists;
      }
    };

    return (
      <div>
        <h3 className="text-2xl font-semibold mb-6">Artists</h3>
        {/* Subsection Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              artistSubSection === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setArtistSubSection('all')}
          >
            All Artists
          </button>
          <button
            className={`px-4 py-2 rounded ${
              artistSubSection === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setArtistSubSection('pending')}
          >
            Approval Pending Artists
          </button>
          <button
            className={`px-4 py-2 rounded ${
              artistSubSection === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setArtistSubSection('approved')}
          >
            Approved Artists
          </button>
        </div>
        {/* Artists Table */}
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Approved</th>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtists().map((artist) => (
              <tr key={artist._id} className="border-t border-gray-100">
                <td className="py-4 px-6 text-sm">{artist.username}</td>
                <td className="py-4 px-6 text-sm">{artist.email}</td>
                <td className="py-4 px-6 text-sm">{artist.isApproved ? 'Yes' : 'No'}</td>
                <td className="py-4 px-6">
                  {!artist.isApproved ? (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                      onClick={() => approveArtist(artist._id)}
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
                      onClick={() => disapproveArtist(artist._id)}
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

// Toggle artwork visibility on the home page
const toggleArtworkVisibility = async (artworkId) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/admin/artworks/togglehomepage/${artworkId}`);
    setArtworks(
      artworks.map((artwork) =>
        artwork._id === artworkId ? { ...artwork, show: !artwork.show } : artwork
      )
    );
  } catch (error) {
    console.error('Error updating artwork visibility', error);
  }
};

// Render Artworks Section
const renderArtworksSection = () => (
  <div>
    <h3 className="text-2xl font-semibold mb-6">Artwork Management</h3>
    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
      <thead>
        <tr>
          <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Title</th>
          <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Artist</th>
          <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Price</th>
          <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Show on Home Page</th>
          <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {artworks.map((artwork) => (
          <tr key={artwork._id} className="border-t border-gray-100">
            <td className="py-4 px-6 text-sm">{artwork.title}</td>
            <td className="py-4 px-6 text-sm">{artwork.artist}</td>
            <td className="py-4 px-6 text-sm">{artwork.price}</td>
            <td className="py-4 px-6 text-sm">
              {artwork.show ? 'Yes' : 'No'}
            </td>
            <td className="py-4 px-6">
              <button
                className={`${
                  artwork.show ? 'bg-red-500' : 'bg-green-500'
                } hover:bg-${artwork.show ? 'red' : 'green'}-600 text-white text-sm px-4 py-2 rounded`}
                onClick={() => toggleArtworkVisibility(artwork._id)}
              
              >
                {artwork.show ? 'Hide' : 'Show'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex-shrink-0 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer ${activeSection === 'users' ? 'font-semibold' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            Users
          </li>
          <li
            className={`cursor-pointer ${activeSection === 'artists' ? 'font-semibold' : ''}`}
            onClick={() => setActiveSection('artists')}
          >
            Artists
          </li>
          <li
            className={`cursor-pointer ${activeSection === 'artworks' ? 'font-semibold' : ''}`}
            onClick={() => setActiveSection('artworks')}
          >
            Artworks
          </li>
        </ul>
      </div>
  
      {/* Main Content */}
      <div className="flex-grow p-6 overflow-y-auto">
        {activeSection === 'users' && renderUsersSection()}
        {activeSection === 'artists' && renderArtistsSection()}
        {activeSection === 'artworks' && renderArtworksSection()}
      </div>
    </div>
  );
  
  
  
  
}

export default AdminPage;
