import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test the API with correct port
async function testCorrectedAPI() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== TESTING API ON PORT 5004 ===');
    
    // 1. Test login
    const loginResponse = await fetch('http://localhost:5004/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'delivery34@gmail.com',
        password: 'delivery123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login success:', loginData.success);
    
    if (loginData.success && loginData.token) {
      console.log('User role:', loginData.user?.role);
      console.log('User ID:', loginData.user?._id);
      
      // 2. Test deliveries endpoint
      const deliveriesResponse = await fetch('http://localhost:5004/api/orders/my-deliveries', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Deliveries API status:', deliveriesResponse.status);
      const deliveriesData = await deliveriesResponse.json();
      console.log('Deliveries success:', deliveriesData.success);
      console.log('Orders found:', deliveriesData.count);
      
      if (deliveriesData.success && deliveriesData.data) {
        deliveriesData.data.forEach(order => {
          console.log(`- ${order.orderNumber}: ${order.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('API test error:', error.message);
    console.log('Make sure the backend server is running on port 5004');
  }
}

// Quick DB verification
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // Verify delivery boy exists
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    console.log('✅ Delivery boy in DB:', deliveryBoy?.name);
    
    // Verify order exists with assignment
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    console.log('✅ Order in DB:', order?.orderNumber, 'Status:', order?.status);
    console.log('✅ Assigned to:', order?.delivery?.deliveryPerson?.name);
    
    console.log('\n');
    await testCorrectedAPI();
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err);
    process.exit(1);
  });
