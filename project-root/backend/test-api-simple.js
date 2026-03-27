import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== TESTING API LOGIC WITHOUT POPULATE ===');
    
    // 1. Get delivery pratap
    const deliveryPratap = await User.default.findOne({ 
      email: 'deliverypratap@gmail.com' 
    });
    
    // 2. Simulate the getMyDeliveries API logic (without populate)
    const req = {
      user: {
        _id: deliveryPratap._id,
        id: deliveryPratap._id,
        role: deliveryPratap.role
      }
    };
    
    const deliveryBoyId = req.user._id || req.user.id;
    
    let query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId }
      ]
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    // 3. Execute query without populate
    const orders = await Order.default.find(query).sort({ createdAt: -1 });
    
    console.log('✅ Orders found:', orders.length);
    
    orders.forEach(order => {
      console.log(`\n- Order: ${order.orderNumber}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Customer: ${order.customer?.name}`);
      console.log(`  Phone: ${order.customer?.phone}`);
      console.log(`  Delivery Address: ${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`);
      console.log(`  Amount: ₹${order.pricing?.total || 'N/A'}`);
      console.log(`  Payment: ${order.paymentStatus}`);
      console.log(`  Assigned to: ${order.delivery?.deliveryPerson?.name}`);
      console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
      console.log(`  Order Items: ${order.orderItems?.length || 0}`);
      
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item, idx) => {
          console.log(`    Item ${idx + 1}: ${item.name} - ₹${item.price} x ${item.quantity}`);
        });
      }
    });
    
    // 4. Format like API response
    const apiResponse = {
      success: true,
      data: orders,
      count: orders.length
    };
    
    console.log('\n=== API RESPONSE (without populate) ===');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
