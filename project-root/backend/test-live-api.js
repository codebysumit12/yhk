import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Test the exact API call that the frontend makes
async function testDeliveryAPI() {
  try {
    // 1. Login as delivery boy to get token
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== TESTING LOGIN ===');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
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
      console.log('\n=== TESTING DELIVERIES API ===');
      console.log('Token:', loginData.token);
      
      // 2. Test the deliveries endpoint with the token
      const deliveriesResponse = await fetch('http://localhost:5000/api/orders/my-deliveries', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Deliveries API status:', deliveriesResponse.status);
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries API response:', deliveriesData);
      
      // 3. Test with curl-like debugging
      console.log('\n=== DEBUGGING INFO ===');
      
      // Decode the token to see user info
      const decoded = jwt.decode(loginData.token);
      console.log('Decoded token:', decoded);
      
      // Check what the backend should return
      const User = await import('./models/User.js');
      const Order = await import('./models/Order.js');
      
      const user = await User.default.findById(decoded.id);
      console.log('User from token ID:', user?.name, user?.role);
      
      if (user && user.role === 'delivery_partner') {
        const query = { 
          $or: [
            { 'delivery.deliveryPerson.id': user._id.toString() },
            { 'delivery.deliveryPerson.id': user._id }
          ]
        };
        
        const orders = await Order.default.find(query);
        console.log('Direct DB query results:', orders.length);
        orders.forEach(o => console.log(`- ${o.orderNumber} (${o.status})`));
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Connect to DB and run test
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    console.log('Connected to DB, starting API test...\n');
    console.log('NOTE: Make sure the backend server is running on localhost:5000\n');
    await testDeliveryAPI();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
