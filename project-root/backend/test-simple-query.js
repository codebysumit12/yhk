import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // Find the delivery partner
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Found delivery partner:', deliveryBoy.name);
    
    // Test the query without populate first
    const deliveryBoyId = deliveryBoy._id;
    let query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId }
      ]
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const orders = await Order.default.find(query).sort({ createdAt: -1 });
    
    console.log('Found orders:', orders.length);
    
    orders.forEach(order => {
      console.log(`- Order: ${order.orderNumber}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Delivery Person ID in DB: ${order.delivery?.deliveryPerson?.id}`);
      console.log(`  Delivery Person ID (string): ${order.delivery?.deliveryPerson?.id?.toString()}`);
      console.log(`  Expected ID: ${deliveryBoyId.toString()}`);
      console.log(`  Match: ${order.delivery?.deliveryPerson?.id?.toString() === deliveryBoyId.toString()}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
