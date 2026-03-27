// This script should be run in the browser console
// to debug what's happening in the frontend

console.log('=== FRONTEND DEBUG ===');

// Check localStorage
const token = localStorage.getItem('token');
const boyId = localStorage.getItem('deliveryBoyId');
const userStr = localStorage.getItem('user');

console.log('Token:', token ? 'exists' : 'missing');
console.log('BoyId:', boyId);
console.log('User:', userStr ? JSON.parse(userStr) : null);

// Check if the fetchMyOrders function is being called
// We can't access React state directly, but we can test the API
if (token) {
  console.log('Testing API call...');
  fetch('http://localhost:5001/api/orders/my-deliveries', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    console.log('Data length:', data.data?.length);
    
    if (data.success && data.data) {
      console.log('Orders:');
      data.data.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
      });
      
      // Test the filtering logic
      const activeOrders = data.data.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
      const completedOrders = data.data.filter(o => o.status === 'delivered');
      
      console.log('Active orders (filtered):', activeOrders.length);
      console.log('Completed orders (filtered):', completedOrders.length);
    }
  })
  .catch(err => console.error('API Error:', err));
} else {
  console.log('No token found');
}

console.log('\nCopy this script and paste it in browser console');
