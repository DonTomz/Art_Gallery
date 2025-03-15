
import axios from 'axios';

const API_URL = 'https://art-gallery-kmgs.onrender.com/api/auth';

// Register User
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Login User
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

export { register, login };
