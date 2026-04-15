const mongoose = require('mongoose');
const Order = require('./models/Order.js');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk-food-delivery')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check a sample order
    const sampleOrder = await Order.findOne({ orderNumber: 'YHK000089' })
      .populate('userId', 'name email')
      .populate('orderItems.menuItem', 'name images');
    
    console.log('Sample order structure:');
    console.log(JSON.stringify(sampleOrder, null, 2));
    
    // Check all orders structure
    const allOrders = await Order.find({})
      .populate('userId', 'name email')
      .populate('orderItems.menuItem', 'name images')
      .limit(3);
    
    console.log('\nAll orders structure:');
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log('  orderNumber:', order.orderNumber);
      console.log('  orderType:', order.orderType);
      console.log('  orderItems length:', order.orderItems?.length);
      console.log('  orderItems:', order.orderItems?.map(item => ({ name: item.name, quantity: item.quantity })));
      console.log('  customer:', order.customer);
      console.log('  userId:', order.userId);
      console.log('---');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
