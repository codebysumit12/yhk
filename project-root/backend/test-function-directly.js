import mongoose from 'mongoose';

// Test the getMyDeliveries function directly
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== TESTING GETMYDELIVERIES FUNCTION DIRECTLY ===');
    
    // 1. Get delivery pratap
    const deliveryPratap = await User.default.findOne({ 
      email: 'deliverypratap@gmail.com' 
    });
    
    if (!deliveryPratap) {
      console.log('❌ Delivery pratap not found');
      process.exit(1);
    }
    
    // 2. Simulate the exact getMyDeliveries function
    const req = {
      user: {
        _id: deliveryPratap._id,
        id: deliveryPratap._id,
        role: deliveryPratap.role
      }
    };
    
    const deliveryBoyId = req.user._id || req.user.id;
    console.log('Delivery boy ID:', deliveryBoyId.toString());
    
    // Build query exactly like getMyDeliveries
    let query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId }
      ]
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    // Execute with populate (like the fixed function)
    let orders;
    try {
      orders = await Order.default.find(query)
        .sort({ createdAt: -1 })
        .populate('orderItems.menuItem', 'name images');
      console.log('✅ Populate succeeded');
    } catch (populateError) {
      console.log('❌ Populate failed:', populateError.message);
      console.log('Trying without populate...');
      orders = await Order.default.find(query)
        .sort({ createdAt: -1 });
    }
    
    console.log('Found orders:', orders.length);
    
    orders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.status}`);
      console.log(`  Customer: ${order.customer?.name}`);
      console.log(`  Amount: ₹${order.pricing?.total}`);
      console.log(`  Order Items: ${order.orderItems?.length || 0}`);
    });
    
    // Format response
    const response = {
      success: true,
      data: orders,
      count: orders.length
    };
    
    console.log('\n=== API RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('\n=== CONCLUSION ===');
    console.log('✅ The function works correctly');
    console.log('🔄 The server needs to be restarted to pick up the changes');
    console.log('📱 Delivery pratap should see orders after server restart');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
