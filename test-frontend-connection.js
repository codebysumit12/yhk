import fetch from 'node-fetch';

// Test connection from frontend's perspective
async function testFrontendConnection() {
  console.log('🔍 Testing frontend-backend connection...\n');
  
  const frontendUrl = 'http://localhost:3001';
  const backendUrl = 'http://localhost:50017';
  
  try {
    // Test backend accessibility from frontend perspective
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': frontendUrl
      },
      body: JSON.stringify({
        email: 'sumitkhekare@gmail.com',
        password: 'sumit123'
      })
    });
    
    console.log('   ✅ Backend reachable from frontend');
    console.log('   📊 Status:', healthResponse.status);
    
    const data = await healthResponse.json();
    console.log('   🎯 Login success:', data.success);
    
    if (data.success) {
      console.log('\n2. Testing token validation...');
      const tokenTestResponse = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Origin': frontendUrl
        }
      });
      
      console.log('   📊 Token validation status:', tokenTestResponse.status);
      const tokenData = await tokenTestResponse.json();
      console.log('   🎯 Token valid:', tokenData.success);
    }
    
    console.log('\n🎉 Frontend-backend connection is working!');
    console.log('📝 If login still fails in browser, check:');
    console.log('   - Browser console for JavaScript errors');
    console.log('   - Network tab for failed requests');
    console.log('   - CORS settings');
    console.log('   - Ad blockers or security extensions');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testFrontendConnection();
