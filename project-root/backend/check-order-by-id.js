import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    
    // Check by order ID
    const order = await Order.default.findById('69bb94d9349ea83687a411c8');
    if (order) {
      console.log('Order found by ID:');
      console.log('Order Number:', order.orderNumber);
      console.log('Status:', order.status);
      console.log('Delivery structure:');
      console.log(JSON.stringify(order.delivery, null, 2));
      
      // Check if delivery person ID is missing
      if (order.delivery?.deliveryPerson) {
        console.log('\nDelivery person ID exists:', !!order.delivery.deliveryPerson.id);
        console.log('Delivery person ID value:', order.delivery.deliveryPerson.id);
        console.log('Expected ID: 69bb8d3fb7c59e120d483d03');
        console.log('Type match check:');
        console.log('ID as string:', order.delivery.deliveryPerson.id?.toString());
        console.log('Expected as string:', '69bb8d3fb7c59e120d483d03');
      } else {
        console.log('\nNo delivery person assigned!');
      }
    } else {
      console.log('Order not found by ID');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
