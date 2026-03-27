import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Test the actual API endpoint
async function testLiveAPI() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== TESTING LIVE API ENDPOINT ===');
    
    // 1. Login as delivery pratap
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deliverypratap@gmail.com',
        password: 'Pass123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login success:', loginData.success);
    
    if (loginData.success && loginData.token) {
      console.log('User role:', loginData.user?.role);
      console.log('User ID:', loginData.user?.id);
      
      // 2. Test the deliveries endpoint
      const deliveriesResponse = await fetch('http://localhost:5001/api/orders/my-deliveries', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Deliveries API status:', deliveriesResponse.status);
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries success:', deliveriesData.success);
      console.log('Orders count:', deliveriesData.count);
      
      if (deliveriesData.success && deliveriesData.data) {
        deliveriesData.data.forEach(order => {
          console.log(`- ${order.orderNumber}: ${order.status}`);
          console.log(`  Customer: ${order.customer?.name}`);
          console.log(`  Amount: ₹${order.pricing?.total}`);
        });
      }
    }
    
  } catch (error) {
    console.error('API test error:', error.message);
  }
}

// Connect to cloud database and test
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    console.log('Connected to cloud database');
    await testLiveAPI();
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
