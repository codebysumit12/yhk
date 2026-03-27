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
    
    console.log('Found delivery partner:', deliveryBoy.name, 'ID:', deliveryBoy._id);
    
    // Find and update the order using direct update
    const result = await Order.default.updateOne(
      { orderNumber: 'HK000045' },
      { 
        $set: {
          'delivery.deliveryPerson.id': deliveryBoy._id,
          'delivery.deliveryPerson.name': deliveryBoy.name,
          'delivery.deliveryPerson.phone': deliveryBoy.phone,
          'delivery.deliveryPerson.vehicleNumber': ''
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Order after update:');
      console.log('Delivery person ID:', order.delivery?.deliveryPerson?.id);
      console.log('Delivery person name:', order.delivery?.deliveryPerson?.name);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
