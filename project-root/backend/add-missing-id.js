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
    
    // Add the missing ID field
    const result = await Order.default.updateOne(
      { orderNumber: 'HK000045' },
      { 
        $set: {
          'delivery.deliveryPerson.id': deliveryBoy._id.toString()
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('\nOrder after update:');
      console.log('Full delivery structure:', JSON.stringify(order.delivery, null, 2));
      console.log('Delivery person ID:', order.delivery?.deliveryPerson?.id);
      console.log('ID type:', typeof order.delivery?.deliveryPerson?.id);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
