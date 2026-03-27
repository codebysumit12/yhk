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
    
    console.log('Found delivery partner ID:', deliveryBoy._id.toString());
    
    // Get the order and modify it directly
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Current delivery structure:', JSON.stringify(order.delivery, null, 2));
      
      // Create a new delivery object with the ID
      order.delivery = {
        ...order.delivery,
        deliveryPerson: {
          id: deliveryBoy._id.toString(),
          name: order.delivery.deliveryPerson.name,
          phone: order.delivery.deliveryPerson.phone,
          vehicleNumber: order.delivery.deliveryPerson.vehicleNumber
        }
      };
      
      await order.save();
      console.log('Order saved successfully!');
      
      // Verify
      const updatedOrder = await Order.default.findOne({ orderNumber: 'HK000045' });
      console.log('Updated delivery structure:', JSON.stringify(updatedOrder.delivery, null, 2));
      console.log('Delivery person ID:', updatedOrder.delivery?.deliveryPerson?.id);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
