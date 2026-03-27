import fetch from 'node-fetch';

const API_URL = 'http://localhost:50017/api';

async function testSimpleLogin() {
  console.log('🧪 Simple Login Test\n');

  // Test Admin Login
  console.log('🔐 Testing Admin Login...');
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
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (data.success) {
      console.log('✅ Admin login successful!');
      console.log('User data:', JSON.stringify(data.data.user, null, 2));
      console.log('Token received:', !!data.data.token);
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test Register New Customer
  console.log('\n👤 Testing Customer Registration...');
  try {
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: 'test123',
        phone: '+1234567890'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register Status:', registerResponse.status);
    console.log('Register Success:', registerData.success);
    console.log('Register Message:', registerData.message);
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

testSimpleLogin();
