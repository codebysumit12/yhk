// API Configuration
export const API_CONFIG = {
  API_URL: '/api', // Local Droplet backend
  LOCAL_API_URL: 'http://localhost:50017/api', // Local development backend
  USER_API_URL: '/api' // Local Droplet backend
};

// Cache-busting helper - forces fresh data
export const fetchWithCacheBust = async (url, options = {}) => {
  const cacheBustUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  return fetch(cacheBustUrl, options);
};

// Shared auth headers helper - prevents token inconsistencies
export const authHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token || token === 'null' || token === 'undefined') {
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
