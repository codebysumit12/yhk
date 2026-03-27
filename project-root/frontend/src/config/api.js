// API Configuration
export const API_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:50017/api',
  USER_API_URL: process.env.REACT_APP_USER_API_URL || 'http://localhost:50017/api'
};

// Cache-busting helper - forces fresh data
export const fetchWithCacheBust = async (url, options = {}) => {
  const cacheBustUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  return fetch(cacheBustUrl, options);
};

// Shared auth headers helper - prevents token inconsistencies
export const authHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
