import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    
    // Check the specific order YHK000054
    const order = await Order.default.findOne({ orderNumber: 'YHK000054' });
    if (order) {
      console.log('Order YHK000054 found:');
      console.log('Status:', order.status);
      console.log('Delivery structure:');
      console.log(JSON.stringify(order.delivery, null, 2));
      
      // Check if delivery person ID is missing
      if (order.delivery?.deliveryPerson) {
        console.log('\nDelivery person ID exists:', !!order.delivery.deliveryPerson.id);
        console.log('Delivery person ID value:', order.delivery.deliveryPerson.id);
        console.log('Expected ID: 69bb8d3fb7c59e120d483d03');
      } else {
        console.log('\nNo delivery person assigned!');
      }
    } else {
      console.log('Order YHK000054 not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
