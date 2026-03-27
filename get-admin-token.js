import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

async function getAdminToken() {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login response:', JSON.stringify(data, null, 2));
      
      if (data.token) {
        // Now test the orders API with the real token
        const ordersResponse = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        const ordersData = await ordersResponse.json();
        
        console.log('\nOrders API Response:');
        console.log('Success:', ordersData.success);
        console.log('Orders count:', ordersData.data?.length);
        
        if (ordersData.data && ordersData.data.length > 0) {
          console.log('\nSample order:');
          console.log('Status:', ordersData.data[0].status);
          console.log('Order Type:', ordersData.data[0].orderType);
          
          console.log('\nAll statuses in database:');
          console.log(ordersData.data.map(o => o.status));
          
          console.log('\nAll order types in database:');
          console.log(ordersData.data.map(o => o.orderType));
        }
      }
    } else {
      console.log('Login failed with status:', response.status);
      const errorData = await response.json();
      console.log('Error response:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getAdminToken();
