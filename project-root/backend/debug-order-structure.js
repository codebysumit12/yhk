import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    
    // Get the full order structure
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Full order delivery structure:');
      console.log(JSON.stringify(order.delivery, null, 2));
      
      // Check if the deliveryPerson object exists
      if (order.delivery && order.delivery.deliveryPerson) {
        console.log('\nDelivery person keys:', Object.keys(order.delivery.deliveryPerson));
        console.log('Delivery person values:', order.delivery.deliveryPerson);
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
