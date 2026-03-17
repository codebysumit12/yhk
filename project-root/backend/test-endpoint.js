// Test if the payment endpoint is working
import fetch from 'node-fetch';

const testEndpoint = async () => {
  try {
    console.log('Testing payment endpoint...');
    
    // Test without authentication first to see if route exists
    const response = await fetch('https://yhk-66ta.onrender.com/api/payments/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 1 })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testEndpoint();
