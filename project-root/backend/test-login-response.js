import mongoose from 'mongoose';
import fetch from 'node-fetch';

mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    console.log('=== TESTING LOGIN API RESPONSE ===');
    
    // Test the exact login API call
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deliverypratap@gmail.com',
        password: 'Pass123'
      })
    });
    
    console.log('Login API status:', response.status);
    
    const data = await response.json();
    console.log('Full login response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful');
      console.log('Token exists:', !!data.token);
      console.log('Token length:', data.token?.length);
      console.log('User role:', data.user?.role);
      console.log('User ID:', data.user?._id || data.user?.id);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
