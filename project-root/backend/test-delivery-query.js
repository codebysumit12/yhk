import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    const User = await import('./models/User.js');
    
    // Find the delivery partner
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Testing query for delivery boy:', deliveryBoy.name);
    console.log('Delivery boy ID:', deliveryBoy._id.toString());
    
    // Test the same query that getMyDeliveries uses
    const query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoy._id.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoy._id }
      ]
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const orders = await Order.default.find(query)
      .sort({ createdAt: -1 });
    
    console.log('Found orders:', orders.length);
    
    orders.forEach(order => {
      console.log(`- Order: ${order.orderNumber}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Customer: ${order.customer?.name}`);
      console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
