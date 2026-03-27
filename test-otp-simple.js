// Simple OTP test without localStorage
const API_URL = 'http://localhost:3002/api';

// Test with a hardcoded token
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC9c.eyJzdWIiOiIy...'; // Use actual token from your app

async function testSimpleOtp() {
  console.log('🧪 Testing OTP Flow...');
  
  try {
    const response = await fetch(`${API_URL}/orders/YHK000057`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    const order = await response.json();
    console.log('📋 Order details:', order);
    
    if (order.success && order.data && order.data.delivery) {
      console.log('🔢 Expected OTP:', order.data.delivery.otp);
      console.log('🔢 Fallback OTP (last 6 digits):', order.data.orderNumber.slice(-6).padStart(6, '0'));
    }
  } catch (err) {
    console.error('❌ Error fetching order:', err);
  }
  
  // Test with the expected OTP
  if (order && order.success && order.data && order.data.delivery && order.data.delivery.otp) {
    console.log(`\n🧪 Testing with expected OTP: ${order.data.delivery.otp}`);
    
    try {
      const verifyResponse = await fetch(`${API_URL}/orders/YHK000057/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({ otp: order.data.delivery.otp })
      });
      
      const result = await verifyResponse.json();
      console.log(`📊 Verification result:`, result);
      
      if (result.success) {
        console.log('✅ SUCCESS! OTP verification works');
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (err) {
      console.error('❌ Error testing OTP:', err);
    }
  }
  
  console.log('\n🧪 Test complete!');
}

testSimpleOtp();
