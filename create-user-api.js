import fetch from 'node-fetch';

const API_URL = 'http://localhost:5004/api';

async function createUserAndTest() {
  console.log('👤 Creating user and testing login...\n');

  const userData = {
    name: 'Sumit Khekare',
    email: 'sumitkhekare@gmail.com',
    password: 'sumit123',
    phone: '+919876543210'
  };

  try {
    // Try to register the user
    console.log('📝 Attempting to register user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const registerData = await registerResponse.json();
    console.log('Register Status:', registerResponse.status);
    console.log('Register Success:', registerData.success);
    console.log('Register Message:', registerData.message);

    if (registerData.success) {
      console.log('✅ User registered successfully!');
      
      // Now test login
      console.log('\n🔐 Testing login with new credentials...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login Status:', loginResponse.status);
      console.log('Login Success:', loginData.success);
      console.log('Login Message:', loginData.message);

      if (loginData.success) {
        console.log('✅ Login successful!');
        console.log('🎉 You can now login with:');
        console.log('   Email: sumitkhekare@gmail.com');
        console.log('   Password: sumit123');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed. User might already exist.');
      
      // Try login anyway
      console.log('\n🔐 Testing login with existing credentials...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login Status:', loginResponse.status);
      console.log('Login Success:', loginData.success);
      console.log('Login Message:', loginData.message);

      if (loginData.success) {
        console.log('✅ Login successful with existing user!');
        console.log('🎉 Your credentials are:');
        console.log('   Email: sumitkhekare@gmail.com');
        console.log('   Password: sumit123');
      } else {
        console.log('❌ Login failed. Trying alternative passwords...');
        
        // Try common passwords
        const alternatives = ['password', '123456', 'sumitkhekare', 'admin123'];
        for (const altPass of alternatives) {
          const altResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userData.email,
              password: altPass
            })
          });

          const altData = await altResponse.json();
          if (altData.success) {
            console.log(`✅ Found working password: ${altPass}`);
            console.log('🎉 Your credentials are:');
            console.log('   Email: sumitkhekare@gmail.com');
            console.log(`   Password: ${altPass}`);
            return;
          }
        }
        
        console.log('❌ No working password found. User may need password reset.');
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createUserAndTest();
