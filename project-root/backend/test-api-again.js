import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Test the API immediately to see if it's working
async function testAPIEndpoint() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== TESTING API ENDPOINT AGAIN ===');
    
    // 1. Login
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deliverypratap@gmail.com',
        password: 'Pass123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (loginData.success && loginData.token) {
      // 2. Get deliveries
      const deliveriesResponse = await fetch('http://localhost:5001/api/orders/my-deliveries', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Deliveries API status:', deliveriesResponse.status);
      
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries API response:', JSON.stringify(deliveriesData, null, 2));
      
      if (deliveriesData.success) {
        console.log('✅ Orders found:', deliveriesData.count);
      } else {
        console.log('❌ API Error:', deliveriesData.message);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Connect and test
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    await testAPIEndpoint();
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err.message);
    process.exit(1);
  });
