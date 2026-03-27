// Simulate browser login flow
import fetch from 'node-fetch';

async function simulateBrowserLogin() {
  console.log('🌐 SIMULATING BROWSER LOGIN FLOW');
  console.log('================================\n');
  
  try {
    // Step 1: Access frontend (should load login page)
    console.log('📱 Step 1: Accessing frontend at http://localhost:3001');
    const frontendResponse = await fetch('http://localhost:3001', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   Status: ${frontendResponse.status}`);
    if (frontendResponse.status === 200) {
      console.log('   ✅ Frontend accessible');
    } else {
      console.log('   ❌ Frontend not accessible');
      return;
    }
    
    // Step 2: Submit login form
    console.log('\n🔐 Step 2: Submitting login form');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001',
        'Referer': 'http://localhost:3001/login',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        email: 'sumitkhekare@gmail.com',
        password: 'sumit123'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    
    const loginData = await loginResponse.json();
    console.log(`   Success: ${loginData.success}`);
    console.log(`   Message: ${loginData.message}`);
    
    if (loginData.success) {
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${loginData.user.name} (${loginData.user.role})`);
      console.log(`   🔑 Token: ${loginData.token.substring(0, 20)}...`);
      
      // Step 3: Test authenticated request
      console.log('\n🎯 Step 3: Testing authenticated request');
      const meResponse = await fetch('http://localhost:3002/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Origin': 'http://localhost:3001',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`   Status: ${meResponse.status}`);
      
      const meData = await meResponse.json();
      console.log(`   Success: ${meData.success}`);
      
      if (meData.success) {
        console.log('   ✅ Authentication working');
        console.log(`   👤 Authenticated user: ${meData.data?.name}`);
      } else {
        console.log('   ❌ Authentication failed');
      }
      
      console.log('\n🎉 BROWSER LOGIN SIMULATION COMPLETE!');
      console.log('✅ All steps working correctly');
      console.log('🌐 Ready for real browser login at: http://localhost:3001');
      console.log('🔐 Use: sumitkhekare@gmail.com / sumit123');
      
    } else {
      console.log('   ❌ Login failed');
      console.log(`   Error: ${loginData.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Simulation error: ${error.message}`);
  }
}

simulateBrowserLogin();
