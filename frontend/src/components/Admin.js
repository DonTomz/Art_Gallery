import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeSection, setActiveSection] = useState('users'); // 'users', 'artists', 'artworks'
  const [artistSubSection, setArtistSubSection] = useState('all'); // 'all', 'approved'

  // Fetch users and artists on component mount
  useEffect(() => {
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

    fetchData();
  }, []);

  
// Approve artist and refetch updated data
const approveArtist = async (artistId) => {
  try {
    await axios.put(`http://localhost:5000/api/admin/artist/approve/${artistId}`);

    // Update the artist's approved status in the local state without refetching the entire list
    setArtists(
      artists.map((artist) =>
        artist._id === artistId ? { ...artist, isApproved: true } : artist
      )
    );
  } catch (error) {
    console.error('Error approving artist', error);
  }
};

const disapproveArtist = async (artistId) => {
  try {
    // Send the disapproval request to the backend
    await axios.put(`http://localhost:5000/api/admin/artist/disapprove/${artistId}`);

    // After disapproval, re-fetch the updated list of artists
    const response = await axios.get('http://localhost:5000/api/admin/users');
    setArtists(response.data.artists); // Update the state with the new artist data
  } catch (error) {
    console.error('Error disapproving artist', error);
  }
};

// Block user
const blockUser = async (userId) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/admin/user/block/${userId}`);
    // Update the users list in the state
    setUsers(users.map(user => user._id === userId ? { ...user, isBlock: true } : user));
    console.log(response.data.message); // Optional: Log the success message
  } catch (error) {
    console.error('Error blocking user', error);
  }
};

// Unblock user
const unblockUser = async (userId) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/admin/user/unblock/${userId}`);
    // Update the users list in the state
    setUsers(users.map(user => user._id === userId ? { ...user, isBlock: false } : user));
    console.log(response.data.message); // Optional: Log the success message
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
  // Filter artists based on sub-section
  const filteredArtists = () => {
    switch (artistSubSection) {
      case 'approved':
        return artists.filter((artist) => artist.isApproved); // Approved artists
      case 'pending':
        return artists.filter((artist) => !artist.isApproved); // Approval pending artists
      default:
        return artists; // All artists
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Artists</h3>
      {/* Subsection Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            artistSubSection === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setArtistSubSection('all')}
        >
          All Artists
        </button>
        <button
          className={`px-4 py-2 rounded ${
            artistSubSection === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setArtistSubSection('pending')}
        >
          Approval Pending Artists
        </button>
        <button
          className={`px-4 py-2 rounded ${
            artistSubSection === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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



  // Render Artwork Management Section
  const renderArtworksSection = () => (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Artwork Management</h3>
      <p>Artwork management functionality will go here...</p>
      {/*  For managing artworks */}
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex-shrink-0 p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${
              activeSection === 'users' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setActiveSection('users')}
          >
            User Management
          </li>
          <li
            className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${
              activeSection === 'artists' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setActiveSection('artists')}
          >
            Artist Management
          </li>
          <li
            className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${
              activeSection === 'artworks' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setActiveSection('artworks')}
          >
            Artwork Management
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 bg-gray-100 overflow-auto">
        {activeSection === 'users' && renderUsersSection()}
        {activeSection === 'artists' && renderArtistsSection()}
        {activeSection === 'artworks' && renderArtworksSection()}
      </div>
    </div>
  );
}

export default AdminPage;
