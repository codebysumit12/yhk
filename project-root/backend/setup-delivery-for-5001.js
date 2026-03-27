import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Connect to the database that port 5001 API is using
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== SETTING UP DELIVERY BOY FOR PORT 5001 API ===');
    
    // 1. Check if delivery boy exists
    let deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    
    if (!deliveryBoy) {
      console.log('Creating delivery boy...');
      const hashedPassword = await bcrypt.hash('delivery123', 10);
      
      deliveryBoy = new User.default({
        name: 'dffd iuui',
        email: 'delivery34@gmail.com',
        phone: '9370330486',
        password: hashedPassword,
        role: 'delivery_partner',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        preferences: {},
        addresses: []
      });
      
      await deliveryBoy.save();
      console.log('✅ Delivery boy created');
    } else {
      console.log('✅ Delivery boy already exists');
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('delivery123', 10);
      await User.default.updateOne(
        { _id: deliveryBoy._id },
        { $set: { password: hashedPassword, isActive: true } }
      );
      console.log('✅ Password updated');
    }
    
    // 2. Check if order exists and assign delivery boy
    let order = await Order.default.findOne({ orderNumber: 'HK000045' });
    
    if (!order) {
      console.log('Creating test order...');
      order = new Order.default({
        orderNumber: 'HK000045',
        customer: {
          name: 'Test Customer',
          email: 'customer@test.com',
          phone: '9370337263'
        },
        orderItems: [{
          menuItem: '507f1f77bcf86cd799439011',
          name: 'Test Item',
          price: 100,
          quantity: 1,
          subtotal: 100
        }],
        orderType: 'delivery',
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Pune',
          zipCode: '411001'
        },
        status: 'out-for-delivery',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        pricing: {
          subtotal: 100,
          deliveryFee: 30,
          tax: 5,
          discount: 0,
          total: 135
        },
        delivery: {
          type: 'standard',
          deliveryPerson: {
            id: deliveryBoy._id.toString(),
            name: deliveryBoy.name,
            phone: deliveryBoy.phone,
            vehicleNumber: ''
          }
        }
      });
      
      await order.save();
      console.log('✅ Test order created');
    } else {
      console.log('✅ Order already exists, updating assignment...');
      
      // Update order with delivery person
      order.delivery.deliveryPerson = {
        id: deliveryBoy._id.toString(),
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        vehicleNumber: ''
      };
      
      await order.save();
      console.log('✅ Order updated with delivery assignment');
    }
    
    console.log('\n=== READY FOR TESTING ===');
    console.log('Login credentials:');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    console.log('Should see order: HK000045');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
