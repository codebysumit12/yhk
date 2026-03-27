import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // Create the delivery partner
    const deliveryBoy = new User.default({
      name: 'dffd iuui',
      email: 'delivery34@gmail.com',
      phone: '9370330486',
      password: '$2a$10$um7JlY7MSsnJV0Juq5bMcOMfoQ.2QP6Dx5ct.vZSs.nFiUuHP5fOm',
      role: 'delivery_partner',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      preferences: {},
      addresses: []
    });
    
    await deliveryBoy.save();
    console.log('Delivery partner created:', deliveryBoy.name, 'ID:', deliveryBoy._id);
    
    // Find and update the order
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Found order:', order.orderNumber);
      
      // Update the delivery person with proper ID
      order.delivery.deliveryPerson = {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        vehicleNumber: ''
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
