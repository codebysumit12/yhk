const mongoose = require('mongoose');
const Order = require('./models/Order.js');

mongoose.connect('mongodb://localhost:27017/feastos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find a sample order to check its structure
    const sampleOrder = await Order.findOne({ orderNumber: 'YHK000089' });
    if (sampleOrder) {
      console.log('=== Sample Order YHK000089 ===');
      console.log('Customer:', JSON.stringify(sampleOrder.customer, null, 2));
      console.log('OrderItems count:', sampleOrder.orderItems?.length || 0);
      console.log('OrderItems sample:', JSON.stringify(sampleOrder.orderItems?.slice(0, 1) || [], null, 2));
      console.log('Pricing:', JSON.stringify(sampleOrder.pricing, null, 2));
      console.log('Status:', sampleOrder.status);
      console.log('Delivery:', JSON.stringify(sampleOrder.delivery, null, 2));
      console.log('========================');
    } else {
      console.log('Order YHK000089 not found, checking any order...');
      
      // Find any order to check structure
      const anyOrder = await Order.findOne({});
      if (anyOrder) {
        console.log('=== Any Order Found ===');
        console.log('Order Number:', anyOrder.orderNumber);
        console.log('Customer:', JSON.stringify(anyOrder.customer, null, 2));
        console.log('OrderItems count:', anyOrder.orderItems?.length || 0);
        console.log('Pricing:', JSON.stringify(anyOrder.pricing, null, 2));
        console.log('Status:', anyOrder.status);
        console.log('========================');
      }
    }
    
    // Check multiple orders to see pattern
    const orders = await Order.find({}).limit(5);
    console.log(`\n=== Found ${orders.length} orders ===`);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ${order.orderNumber}`);
      console.log(`  Customer exists: ${!!order.customer}`);
      console.log(`  OrderItems length: ${order.orderItems?.length || 0}`);
      console.log(`  Pricing exists: ${!!order.pricing}`);
      console.log(`  Status: ${order.status}`);
    });
    
  } catch (error) {
    console.error('Error checking orders:', error);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
