import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);

  // Fetch users and artists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(response.data.users);
        setArtists(response.data.artists);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  // Approve artist
  const approveArtist = async (artistId) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/artist/approve/${artistId}`);
      setArtists(artists.map(artist => artist._id === artistId ? { ...artist, approved: true } : artist));
    } catch (error) {
      console.error('Error approving artist', error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/user/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  return (
    <div className="admin-page container mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>

      {/* Users Section */}
      <div className="section mb-8">
        <h3 className="text-2xl font-semibold mb-4">Users</h3>
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="py-3 px-6 bg-gray-200 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t border-gray-100">
                <td className="py-4 px-6 text-sm">{user.username}</td>
                <td className="py-4 px-6 text-sm">{user.email}</td>
                <td className="py-4 px-6">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Artists Section */}
      <div className="section">
        <h3 className="text-2xl font-semibold mb-4">Artists</h3>
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
            {artists.map(artist => (
              <tr key={artist._id} className="border-t border-gray-100">
                <td className="py-4 px-6 text-sm">{artist.username}</td>
                <td className="py-4 px-6 text-sm">{artist.email}</td>
                <td className="py-4 px-6 text-sm">{artist.approved ? 'Yes' : 'No'}</td>
                <td className="py-4 px-6">
                  {!artist.approved && (
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                      onClick={() => approveArtist(artist._id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
