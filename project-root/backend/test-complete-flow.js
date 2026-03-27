import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Test the complete flow from login to API
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    const fetch = (await import('node-fetch')).default;
    
    console.log('=== COMPLETE FLOW TEST ===');
    
    // 1. Login and get token
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deliverypratap@gmail.com',
        password: 'Pass123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      process.exit(1);
    }
    
    console.log('✅ Login successful');
    console.log('Token:', loginData.token.substring(0, 50) + '...');
    console.log('User role:', loginData.user.role);
    console.log('User ID:', loginData.user._id || loginData.user.id);
    
    // 2. Test what the frontend should store in localStorage
    const frontendData = {
      token: loginData.token,
      user: loginData.user,
      deliveryBoyId: loginData.user._id || loginData.user.id
    };
    
    console.log('\n=== FRONTEND SHOULD STORE ===');
    console.log('localStorage.setItem("token", token):', frontendData.token ? '✅' : '❌');
    console.log('localStorage.setItem("user", JSON.stringify(user)):', frontendData.user ? '✅' : '❌');
    console.log('localStorage.setItem("deliveryBoyId", user._id):', frontendData.deliveryBoyId ? '✅' : '❌');
    
    // 3. Test the API call with the token
    const deliveriesResponse = await fetch('http://localhost:5001/api/orders/my-deliveries', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('\n=== API CALL TEST ===');
    console.log('Status:', deliveriesResponse.status);
    
    const deliveriesData = await deliveriesResponse.json();
    console.log('Success:', deliveriesData.success);
    console.log('Count:', deliveriesData.count);
    
    if (deliveriesData.success && deliveriesData.data) {
      console.log('Orders found:');
      deliveriesData.data.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status} (${order.customer?.name})`);
      });
    }
    
    // 4. Check if there's a frontend caching issue
    console.log('\n=== TROUBLESHOOTING STEPS ===');
    console.log('1. Clear browser cache and localStorage');
    console.log('2. Login again with deliverypratap@gmail.com / Pass123');
    console.log('3. Check browser console for API calls');
    console.log('4. Verify localStorage contains token and deliveryBoyId');
    console.log('5. Refresh the page after login');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
