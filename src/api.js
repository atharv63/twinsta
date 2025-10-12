import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);

export const searchUsers = (query) => {
  return axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const getUserProfile = (userId) => {
  return axios.get(`${API_URL}/users/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const getCurrentUser = () => {
  return axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

# Set your name (use your actual name)
git config --global user.name "Way-dant"

# Set your email (use your actual email)
git config --global user.email "vedant.sarmaalkar21@gmail.com"