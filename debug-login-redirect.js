import fetch from 'node-fetch';

console.log('🔍 DEBUGGING LOGIN REDIRECT ISSUE');
console.log('=================================\n');

async function testLoginRedirect() {
  try {
    // Test 1: Direct login API call
    console.log('📡 Test 1: Direct API login');
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001'
      },
      body: JSON.stringify({
        email: 'sumitkhekare@gmail.com',
        password: 'sumit123'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (data.success) {
      console.log('✅ API login successful');
      console.log('User:', data.user);
      console.log('Token received:', !!data.token);
      
      // Test 2: Check if user data structure matches frontend expectations
      console.log('\n🔍 Test 2: User data structure check');
      console.log('user.isAdmin:', data.user?.isAdmin);
      console.log('user.role:', data.user?.role);
      console.log('user.id:', data.user?.id);
      console.log('user._id:', data.user?._id);
      
      // Test 3: Simulate frontend redirect logic
      console.log('\n🎯 Test 3: Frontend redirect logic simulation');
      
      if (data.user && data.user.isAdmin) {
        console.log('Would redirect to: /admin');
      } else if (data.user && (data.user.role === 'delivery' || data.user.role === 'delivery_partner')) {
        console.log('Would redirect to: /admin/delivery-app');
      } else {
        console.log('Would redirect to: / (home page)');
      }
      
      // Test 4: Check if home route exists
      console.log('\n🌐 Test 4: Check home route accessibility');
      const homeResponse = await fetch('http://localhost:3001/', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3001'
        }
      });
      
      console.log('Home page status:', homeResponse.status);
      
      if (homeResponse.status === 200) {
        console.log('✅ Home route accessible');
      } else {
        console.log('❌ Home route not accessible - this might cause redirect back to login');
      }
      
    } else {
      console.log('❌ API login failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testLoginRedirect();
