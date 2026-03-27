import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test the actual API endpoint by simulating a request
async function testDeliveryEndpoint() {
  try {
    // Start a simple test server or use curl-like approach
    const fetch = (await import('node-fetch')).default;
    
    // First, login as delivery boy to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'delivery34@gmail.com',
        password: 'password123' // You may need to check the actual password
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      // Test the deliveries endpoint
      const deliveriesResponse = await fetch('http://localhost:5000/api/orders/my-deliveries', {
        headers: { Authorization: `Bearer ${loginData.token}` }
      });
      
      console.log('Deliveries response status:', deliveriesResponse.status);
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries response:', deliveriesData);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Connect to DB first to verify data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    // Check if delivery boy exists and get their credentials
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (deliveryBoy) {
      console.log('Delivery boy found:', deliveryBoy.name);
      console.log('Email:', deliveryBoy.email);
      console.log('Password hash exists:', !!deliveryBoy.password);
    }
    
    // Test API endpoint (requires server to be running)
    console.log('\nTesting API endpoint (make sure server is running on localhost:5000)...');
    await testDeliveryEndpoint();
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
