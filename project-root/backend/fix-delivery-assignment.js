import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    const User = await import('./models/User.js');
    
    // Find the delivery partner
    const deliveryBoy = await User.default.findOne({ 
      name: 'dffd iuui',
      phone: '9370330486'
    });
    
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Found delivery partner:', deliveryBoy.name, 'ID:', deliveryBoy._id);
    
    // Find and update the order
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Found order:', order.orderNumber);
      
      // Update the delivery person with proper ID
      order.delivery.deliveryPerson = {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        vehicleNumber: deliveryBoy.vehicleNumber || ''
      };
      
      await order.save();
      console.log('Order updated successfully!');
      console.log('Delivery person now has ID:', order.delivery.deliveryPerson.id);
    } else {
      console.log('Order HK000045 not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
