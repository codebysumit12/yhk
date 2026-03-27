import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    
    // Get all recent orders
    const orders = await Order.default.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('Recent orders:');
    orders.forEach(order => {
      console.log(`- ID: ${order._id}`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Customer: ${order.customer?.name}`);
      console.log(`  Delivery Person: ${order.delivery?.deliveryPerson?.name || 'None'}`);
      console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id || 'Missing'}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
