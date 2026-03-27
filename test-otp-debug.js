// Test OTP verification for delivery boy
const API_URL = 'http://localhost:3002/api';

async function testOtpFlow() {
  console.log('🧪 Testing OTP Flow...');
  
  // Step 1: Check what OTP is expected for a test order
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    console.log('🔑 Using token:', token ? 'EXISTS' : 'MISSING');
    
    const response = await fetch(`${API_URL}/orders/YHK000057`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const order = await response.json();
    console.log('📋 Order details:', order);
    
    if (order.data && order.data.delivery) {
      console.log('🔢 Expected OTP:', order.data.delivery.otp);
      console.log('🔢 Fallback OTP (last 6 digits):', order.data.orderNumber.slice(-6).padStart(6, '0'));
    }
  } catch (err) {
    console.error('❌ Error fetching order:', err);
  }
  
  // Step 2: Test OTP verification with different values
  const testOtps = ['123456', '000057', '999999'];
  
  for (const otp of testOtps) {
    console.log(`\n🧪 Testing OTP: ${otp}`);
    
    try {
      const verifyResponse = await fetch(`${API_URL}/orders/YHK000057/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      
      const result = await verifyResponse.json();
      console.log(`📊 Verification result for ${otp}:`, result);
      
      if (result.success) {
        console.log('✅ SUCCESS! OTP worked');
        break;
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (err) {
      console.error(`❌ Error testing OTP ${otp}:`, err);
    }
  }
  
  console.log('\n🧪 Test complete!');
}

// Run the test
testOtpFlow();
