// Debug token issue
console.log('🔍 Debugging token issue...');

// Check what's in localStorage
console.log('localStorage contents:');
console.log('token:', localStorage.getItem('token'));
console.log('userToken:', localStorage.getItem('userToken'));
console.log('user:', localStorage.getItem('user'));

// Check if token is valid format
const token = localStorage.getItem('token');
if (token) {
  console.log('Token length:', token.length);
  console.log('Token starts with:', token.substring(0, 20) + '...');
  
  // Try to decode JWT payload (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires at:', new Date(payload.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Is expired:', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.log('❌ Failed to decode token:', e.message);
  }
} else {
  console.log('❌ No token found in localStorage');
}

// Test API call
if (token) {
  fetch('http://localhost:5004/api/items?type=drinks', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('API Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API Response data:', data);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
}
