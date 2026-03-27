// Simple test to check browser localStorage and API call
console.log('=== FRONTEND DEBUG TEST ===');

// Check localStorage
const token = localStorage.getItem('token');
const boyId = localStorage.getItem('deliveryBoyId');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
console.log('Token length:', token?.length);
console.log('BoyId exists:', !!boyId);
console.log('BoyId:', boyId);
console.log('User exists:', !!user);

if (user) {
  try {
    const userObj = JSON.parse(user);
    console.log('User object:', userObj);
    console.log('User role:', userObj.role);
    console.log('User ID:', userObj._id || userObj.id);
  } catch (e) {
    console.log('User JSON parse error:', e);
  }
}

// Test API call
if (token) {
  fetch('http://localhost:5001/api/orders/my-deliveries', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    console.log('API response status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('API response data:', data);
    if (data.success) {
      console.log('Orders count:', data.count);
      console.log('First order:', data.data?.[0]?.orderNumber);
    }
  })
  .catch(err => {
    console.error('API call error:', err);
  });
} else {
  console.log('❌ No token found in localStorage');
}

console.log('\n=== CHECK BROWSER CONSOLE FOR THIS OUTPUT ===');
