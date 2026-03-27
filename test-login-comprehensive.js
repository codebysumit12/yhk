import fetch from 'node-fetch';

const API_URL = 'http://localhost:50017/api';

async function testLoginFunctionality() {
  console.log('🧪 Starting comprehensive login testing for Admin and Customer...\n');

  // Test 1: Admin Login
  console.log('🔐 Test 1: Admin Login');
  try {
    const adminLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });

    const adminLoginData = await adminLoginResponse.json();
    console.log('Admin Login status:', adminLoginResponse.status);
    console.log('Admin Login success:', adminLoginData.success);
    console.log('Admin Login message:', adminLoginData.message);

    if (adminLoginData.success && adminLoginData.data.token) {
      const adminToken = adminLoginData.data.token;
      console.log('✅ Admin login successful');
      console.log('Admin token length:', adminToken.length);
      console.log('Admin user role:', adminLoginData.data.user?.role);

      // Test Admin Dashboard Access
      console.log('\n📊 Test 2: Admin Dashboard Access');
      try {
        const dashboardResponse = await fetch(`${API_URL}/orders`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard access status:', dashboardResponse.status);
        console.log('Dashboard access success:', dashboardData.success);
      } catch (error) {
        console.log('❌ Dashboard access failed:', error.message);
      }

    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log('❌ Admin login test failed:', error.message);
  }

  // Test 3: Customer Login (try with a test customer)
  console.log('\n👤 Test 3: Customer Login');
  try {
    const customerLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@test.com',
        password: 'customer123'
      })
    });

    const customerLoginData = await customerLoginResponse.json();
    console.log('Customer Login status:', customerLoginResponse.status);
    console.log('Customer Login success:', customerLoginData.success);
    console.log('Customer Login message:', customerLoginData.message);

    if (customerLoginData.success && customerLoginData.data.token) {
      const customerToken = customerLoginData.data.token;
      console.log('✅ Customer login successful');
      console.log('Customer token length:', customerToken.length);
      console.log('Customer user role:', customerLoginData.data.user?.role);

      // Test Customer Menu Access
      console.log('\n🍽️ Test 4: Customer Menu Access');
      try {
        const menuResponse = await fetch(`${API_URL}/items?isAvailable=true`, {
          headers: { 
            'Authorization': `Bearer ${customerToken}`,
            'Content-Type': 'application/json'
          }
        });

        const menuData = await menuResponse.json();
        console.log('Menu access status:', menuResponse.status);
        console.log('Menu access success:', menuData.success);
        console.log('Available items count:', menuData.data?.length || 0);
      } catch (error) {
        console.log('❌ Menu access failed:', error.message);
      }

    } else {
      console.log('❌ Customer login failed (user may not exist)');
    }
  } catch (error) {
    console.log('❌ Customer login test failed:', error.message);
  }

  // Test 5: Invalid Login Attempts
  console.log('\n🚫 Test 5: Invalid Login Attempts');
  
  // Wrong password
  try {
    const wrongPassResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'wrongpassword'
      })
    });

    const wrongPassData = await wrongPassResponse.json();
    console.log('Wrong password status:', wrongPassResponse.status);
    console.log('Wrong password success:', wrongPassData.success);
    console.log('Wrong password should fail:', !wrongPassData.success ? '✅' : '❌');
  } catch (error) {
    console.log('❌ Wrong password test failed:', error.message);
  }

  // Non-existent user
  try {
    const noUserResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'password123'
      })
    });

    const noUserData = await noUserResponse.json();
    console.log('Non-existent user status:', noUserResponse.status);
    console.log('Non-existent user success:', noUserData.success);
    console.log('Non-existent user should fail:', !noUserData.success ? '✅' : '❌');
  } catch (error) {
    console.log('❌ Non-existent user test failed:', error.message);
  }

  console.log('\n🏁 Comprehensive login testing completed!');
}

// Run the test
testLoginFunctionality();
