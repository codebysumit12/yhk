import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== TESTING ACTUAL API LOGIC ===');
    
    // 1. Get delivery pratap and create a token like the API would
    const deliveryPratap = await User.default.findOne({ 
      email: 'deliverypratap@gmail.com' 
    });
    
    if (!deliveryPratap) {
      console.log('❌ Delivery pratap not found');
      process.exit(1);
    }
    
    // Create JWT token (same as login API)
    const token = jwt.sign(
      { id: deliveryPratap._id },
      'yhk_secret_key_2024',
      { expiresIn: '30d' }
    );
    
    console.log('✅ Created test token');
    
    // 2. Simulate the getMyDeliveries API logic
    const req = {
      user: {
        _id: deliveryPratap._id,
        id: deliveryPratap._id,
        role: deliveryPratap.role
      }
    };
    
    console.log('Simulated req.user:', {
      _id: req.user._id.toString(),
      id: req.user.id.toString(),
      role: req.user.role
    });
    
    // 3. Build query exactly like getMyDeliveries does
    const deliveryBoyId = req.user._id || req.user.id;
    console.log('Delivery boy ID from request:', deliveryBoyId.toString());
    
    let query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId }
      ]
    };
    
    console.log('Query that API will execute:', JSON.stringify(query, null, 2));
    
    // 4. Execute the query with populate (like the API does)
    try {
      const orders = await Order.default.find(query)
        .sort({ createdAt: -1 })
        .populate('orderItems.menuItem', 'name images');
      
      console.log('✅ API query results:');
      console.log('Orders found:', orders.length);
      
      orders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Customer: ${order.customer?.name}`);
        console.log(`  Delivery Person: ${order.delivery?.deliveryPerson?.name}`);
        console.log(`  Order Items: ${order.orderItems?.length || 0}`);
      });
      
      // 5. Format response like the API
      const apiResponse = {
        success: true,
        data: orders,
        count: orders.length
      };
      
      console.log('\n=== API RESPONSE ===');
      console.log(JSON.stringify(apiResponse, null, 2));
      
    } catch (error) {
      console.error('❌ API query error:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
