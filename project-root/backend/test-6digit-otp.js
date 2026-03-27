import mongoose from 'mongoose';

// Test the 6-digit OTP generation
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const Order = await import('./models/Order.js');
    
    console.log('=== TESTING 6-DIGIT OTP SYSTEM ===');
    
    // Find order YHK000057
    const order = await Order.default.findOne({ orderNumber: 'YHK000057' });
    
    if (!order) {
      console.log('❌ Order YHK000057 not found');
      process.exit(1);
    }
    
    console.log('✅ Found order:', order.orderNumber);
    
    // Test the OTP generation logic
    const expectedOtp = order.orderNumber.slice(-6).padStart(6, '0');
    console.log('Order number:', order.orderNumber);
    console.log('Last 6 digits:', order.orderNumber.slice(-6));
    console.log('Padded 6-digit OTP:', expectedOtp);
    
    console.log('\n=== OTP VERIFICATION TEST ===');
    console.log('For delivery verification, the delivery boy should enter:', expectedOtp);
    
    // Test some examples
    const testOrders = ['YHK000057', 'YHK000123', 'YHK000999', 'YHK001234'];
    console.log('\n=== OTP EXAMPLES ===');
    testOrders.forEach(orderNum => {
      const otp = orderNum.slice(-6).padStart(6, '0');
      console.log(`${orderNum} → OTP: ${otp}`);
    });
    
    console.log('\n=== READY FOR TESTING ===');
    console.log('1. Delivery boy logs in with deliverypratap@gmail.com / Pass123');
    console.log('2. Clicks "🔐 Enter Delivery OTP" on order YHK000057');
    console.log('3. Enters 6-digit OTP: ' + expectedOtp);
    console.log('4. Should confirm delivery successfully');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
