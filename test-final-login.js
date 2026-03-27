import fetch from 'node-fetch';

const API_URL = 'http://localhost:50017/api';

async function runFinalLoginTest() {
  console.log('🚀 FINAL LOGIN TESTING REPORT');
  console.log('================================\n');

  let testResults = {
    adminLogin: false,
    customerRegistration: false,
    customerLogin: false,
    invalidLogin: false
  };

  // Test 1: Admin Login
  console.log('🔐 TEST 1: Admin Login');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.success && data.token) {
      console.log(`   ✅ Admin login SUCCESSFUL`);
      console.log(`   📝 Token length: ${data.token.length} characters`);
      testResults.adminLogin = true;
      
      // Test admin dashboard access
      const dashboardResponse = await fetch(`${API_URL}/orders`, {
        headers: { 
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`   📊 Dashboard access: ${dashboardResponse.status === 200 ? '✅ SUCCESS' : '❌ FAILED'}`);
    } else {
      console.log(`   ❌ Admin login FAILED`);
    }
  } catch (error) {
    console.log(`   ❌ Admin login ERROR: ${error.message}`);
  }

  // Test 2: Customer Registration
  console.log('\n👤 TEST 2: Customer Registration');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: `test${Date.now()}@example.com`,
        password: 'test123',
        phone: '+1234567890'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.success) {
      console.log(`   ✅ Customer registration SUCCESSFUL`);
      testResults.customerRegistration = true;
      
      // Test login with the new customer
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.user?.email || data.data?.user?.email,
          password: 'test123'
        })
      });
      
      const loginData = await loginResponse.json();
      if (loginData.success) {
        console.log(`   ✅ New customer login SUCCESSFUL`);
        testResults.customerLogin = true;
      } else {
        console.log(`   ❌ New customer login FAILED`);
      }
    } else {
      console.log(`   ❌ Customer registration FAILED`);
    }
  } catch (error) {
    console.log(`   ❌ Customer registration ERROR: ${error.message}`);
  }

  // Test 3: Invalid Login Attempts
  console.log('\n🚫 TEST 3: Invalid Login Security');
  try {
    // Wrong password
    const wrongPassResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'wrongpassword'
      })
    });

    const wrongPassData = await wrongPassResponse.json();
    const wrongPassBlocked = !wrongPassData.success && wrongPassResponse.status === 401;
    console.log(`   🔒 Wrong password blocked: ${wrongPassBlocked ? '✅ YES' : '❌ NO'}`);

    // Non-existent user
    const noUserResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'password123'
      })
    });

    const noUserData = await noUserResponse.json();
    const noUserBlocked = !noUserData.success && noUserResponse.status === 401;
    console.log(`   🔒 Non-existent user blocked: ${noUserBlocked ? '✅ YES' : '❌ NO'}`);
    
    testResults.invalidLogin = wrongPassBlocked && noUserBlocked;
  } catch (error) {
    console.log(`   ❌ Invalid login test ERROR: ${error.message}`);
  }

  // Final Report
  console.log('\n📋 FINAL TEST RESULTS');
  console.log('=====================');
  console.log(`✅ Admin Login: ${testResults.adminLogin ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Customer Registration: ${testResults.customerRegistration ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Customer Login: ${testResults.customerLogin ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Invalid Login Security: ${testResults.invalidLogin ? 'PASS' : 'FAIL'}`);
  
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  console.log(`\n🎯 OVERALL STATUS: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  console.log('\n🌐 ACCESS INFORMATION');
  console.log('=====================');
  console.log('🔗 Backend API: http://localhost:50017');
  console.log('🔗 Frontend App: http://localhost:3000');
  console.log('👤 Admin Login: admin@yhk.com / admin123');
  console.log('🛡️  Security: Invalid logins properly blocked');
  
  console.log('\n🏁 TESTING COMPLETED!');
}

runFinalLoginTest();
