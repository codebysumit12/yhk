import razorpay from './config/razorpay.js';

// Test Razorpay integration
const testRazorpay = async () => {
  try {
    console.log('Testing Razorpay integration...');
    console.log('Using Key ID:', process.env.RAZORPAY_KEY_ID || 'rzp_live_SSKxoURQgSmXB7');
    
    // Create a test order for ₹1 (100 paise)
    const options = {
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount / 100, 'INR');
    console.log('Currency:', order.currency);
    console.log('Status:', order.status);
    
    return order;
  } catch (error) {
    console.error('❌ Razorpay test failed:', error.message);
    console.error('Error details:', error);
    return null;
  }
};

// Run the test
testRazorpay();
