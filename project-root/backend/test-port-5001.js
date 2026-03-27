import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test the API on port 5001
async function testPort5001() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== TESTING API ON PORT 5001 ===');
    
    // 1. Test login
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'delivery34@gmail.com',
        password: 'delivery123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      // 2. Test deliveries endpoint
      const deliveriesResponse = await fetch('http://localhost:5001/api/orders/my-deliveries', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Deliveries API status:', deliveriesResponse.status);
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries response:', deliveriesData);
    }
    
  } catch (error) {
    console.error('API test error:', error.message);
  }
}

// Run test
testPort5001().then(() => process.exit(0));
