import mongoose from 'mongoose';
import Order from './models/Order.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk_database')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Count all orders
    const totalOrders = await Order.countDocuments();
    console.log(`Total orders in database: ${totalOrders}`);
    
    // Check for the specific order numbers shown in frontend
    const specificOrders = await Order.find({
      orderNumber: { $in: ['YHK000084', 'YHK000085', 'YHK000086', 'YHK000087', 'YHK000088', 'YHK000089', 'YHK000090'] }
    });
    
    console.log(`Found ${specificOrders.length} orders from frontend display:`, specificOrders.map(o => o.orderNumber));
    
    // Check for orders with higher numbers
    const highNumberOrders = await Order.find({
      orderNumber: { $regex: '^YHK0000[8-9]' }
    }).sort({ orderNumber: -1 });
    
    console.log(`\nHigh number orders found: ${highNumberOrders.length}`);
    highNumberOrders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.orderItems?.length || 0} items, total: ₹${order.pricing?.total || 0}`);
    });
    
    // Check recent orders without populate
    const orders = await Order.find().sort({createdAt: -1}).limit(10);
    
    console.log(`\nFound ${orders.length} recent orders:`);
    
    orders.forEach((order, index) => {
      console.log(`\n=== Order ${index + 1} (${order.orderNumber}) ===`);
      console.log('Customer:', JSON.stringify(order.customer, null, 2));
      console.log('OrderItems length:', order.orderItems?.length || 0);
      if (order.orderItems && order.orderItems.length > 0) {
        console.log('First item:', order.orderItems[0]);
      }
      console.log('Pricing:', JSON.stringify(order.pricing, null, 2));
      console.log('Status:', order.status);
      console.log('Payment Status:', order.paymentStatus);
      console.log('User ID:', order.userId);
      console.log('Order Type:', order.orderType);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
