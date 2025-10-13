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

export const getPosts = () => {
  return axios.get(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const createPost = (postData) => {
  return axios.post(`${API_URL}/posts`, postData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const updateUserProfile = (profileData) => {
  return axios.put(`${API_URL}/users/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const likePost = (postId) => {
  return axios.post(`${API_URL}/likes/post/${postId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const getPostLikes = (postId) => {
  return axios.get(`${API_URL}/likes/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const createComment = (postId, content) => {
  return axios.post(`${API_URL}/comments/post/${postId}`, { content }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const getPostComments = (postId) => {
  return axios.get(`${API_URL}/comments/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const deleteComment = (commentId) => {
  return axios.delete(`${API_URL}/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// Follow/Unfollow APIs
// Follow/Unfollow APIs
export const followUser = (userId) => {
  return axios.post(`${API_URL}/users/follow/${userId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const unfollowUser = (userId) => {
  return axios.delete(`${API_URL}/users/unfollow/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const checkFollowing = (userId) => {
  return axios.get(`${API_URL}/users/follows/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const cancelFollowRequest = (userId) => {
  return axios.delete(`${API_URL}/users/follow-request/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const getPendingFollowRequests = () => {
  return axios.get(`${API_URL}/users/follow-requests`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const approveFollowRequest = (requestId) => {
  return axios.post(`${API_URL}/users/follow-requests/${requestId}/approve`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const rejectFollowRequest = (requestId) => {
  return axios.post(`${API_URL}/users/follow-requests/${requestId}/reject`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const deletePost = (postId) => {
  return axios.delete(`${API_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};