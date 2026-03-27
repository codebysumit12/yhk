import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

async function testOrdersAPI() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('\nSample order:');
      console.log('Status:', data.data[0].status);
      console.log('Order Type:', data.data[0].orderType);
      
      console.log('\nAll statuses:');
      console.log(data.data.map(o => o.status));
      
      console.log('\nAll order types:');
      console.log(data.data.map(o => o.orderType));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOrdersAPI();
