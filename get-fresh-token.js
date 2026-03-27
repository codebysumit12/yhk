import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

async function getFreshToken() {
  try {
    console.log('Getting fresh admin token...');
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.token) {
      console.log('✅ Fresh token:', data.token.substring(0, 50) + '...');
      console.log('User data:', JSON.stringify(data.user, null, 2));
      
      // Test orders API with fresh token
      console.log('\n🔍 Testing orders API...');
      const ordersResponse = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const ordersData = await ordersResponse.json();
      console.log('Orders API status:', ordersResponse.status);
      console.log('Orders response:', JSON.stringify(ordersData, null, 2));
      
      // Test items API with fresh token
      console.log('\n🔍 Testing items API...');
      const itemsResponse = await fetch(`${API_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const itemsData = await itemsResponse.json();
      console.log('Items API status:', itemsResponse.status);
      console.log('Items response:', JSON.stringify(itemsData, null, 2));
      
    } else {
      console.log('❌ Login failed:', data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getFreshToken();
