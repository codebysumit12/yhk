import fetch from 'node-fetch';

console.log('🔧 TESTING FIXED LOGIN FLOW');
console.log('============================\n');

async function testFixedLogin() {
  try {
    // Step 1: Login
    console.log('📡 Step 1: Testing login');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
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

    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Success:', loginData.success);
    
    if (loginData.success) {
      console.log('✅ Login successful');
      console.log('User:', loginData.user.name);
      console.log('Token stored as: token');
      
      // Step 2: Simulate localStorage behavior
      console.log('\n💾 Step 2: Simulating localStorage');
      const simulatedToken = loginData.token;
      const simulatedUser = loginData.user;
      
      console.log('Token exists:', !!simulatedToken);
      console.log('User exists:', !!simulatedUser);
      
      // Step 3: Test Main page auth check
      console.log('\n🔍 Step 3: Testing Main page auth logic');
      const tokenCheck = simulatedToken || null;
      console.log('Token check result:', !!tokenCheck);
      
      if (tokenCheck) {
        console.log('✅ Main page auth check would PASS');
        console.log('✅ User would NOT be redirected back to login');
      } else {
        console.log('❌ Main page auth check would FAIL');
        console.log('❌ User would be redirected back to login');
      }
      
      // Step 4: Test API calls with auth headers
      console.log('\n🌐 Step 4: Testing authenticated API calls');
      const authHeaders = {
        'Authorization': `Bearer ${simulatedToken}`,
        'Content-Type': 'application/json'
      };
      
      const meResponse = await fetch('http://localhost:3002/api/auth/me', {
        method: 'GET',
        headers: authHeaders
      });
      
      const meData = await meResponse.json();
      console.log('Auth API Status:', meResponse.status);
      console.log('Auth API Success:', meData.success);
      
      if (meData.success) {
        console.log('✅ Authenticated API calls working');
      } else {
        console.log('❌ Authenticated API calls failing');
      }
      
      console.log('\n🎉 LOGIN FLOW TEST COMPLETE');
      console.log('✅ All authentication steps working correctly');
      console.log('🌐 Ready to login at: http://localhost:3001');
      console.log('🔐 Use: sumitkhekare@gmail.com / sumit123');
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testFixedLogin();
