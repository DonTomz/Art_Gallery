import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Home from 'E:/Projects/Art_Gallery/frontend/src/components/Home.js'

const Users = () => {
  const [username, setUsername] = useState(''); 
  useEffect(() => {
    const userId = localStorage.getItem('userId');  // Retrieve the user ID from localStorage
    const id = userId
    // Function to fetch user data
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/user/`+id);  // API call to fetch user data
        setUsername(response.data.username);  // Set the username from the response
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    if (userId) {
      fetchUser();  // Fetch user data if userId exists in localStorage
    }
  }, []);
console.log(username)
  return (
    <div>
      <Home/>
    </div>
  );
}

export default Users;
