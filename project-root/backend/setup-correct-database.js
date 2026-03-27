import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

console.log('=== CHECKING CORRECT DATABASE (yhk_database) ===');

// Connect to the actual database the server is using
mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    console.log('✅ Connected to yhk_database');
    
    const User = await import('./models/User.js');
    
    // 1. Check if delivery boy exists in this database
    const deliveryBoy = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
    
    if (!deliveryBoy) {
      console.log('❌ Delivery boy not found in yhk_database');
      console.log('Creating delivery boy in correct database...');
      
      const hashedPassword = await bcrypt.hash('delivery123', 10);
      
      const newDeliveryBoy = new User.default({
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
      
      await newDeliveryBoy.save();
      console.log('✅ Delivery boy created in yhk_database');
      
    } else {
      console.log('✅ Found delivery boy in yhk_database:', deliveryBoy.name);
      console.log('Role:', deliveryBoy.role);
      console.log('Active:', deliveryBoy.isActive);
      
      // Test password
      const testResult = await bcrypt.compare('delivery123', deliveryBoy.password);
      console.log('Password "delivery123" match:', testResult);
      
      if (!testResult) {
        console.log('Resetting password...');
        const newHash = await bcrypt.hash('delivery123', 10);
        await User.default.updateOne(
          { _id: deliveryBoy._id },
          { $set: { password: newHash, isActive: true } }
        );
        console.log('✅ Password reset to: delivery123');
      }
    }
    
    // 2. Check if order exists and assign delivery boy
    const Order = await import('./models/Order.js');
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    
    if (!order) {
      console.log('Creating test order in yhk_database...');
      const deliveryBoyUser = await User.default.findOne({ email: 'delivery34@gmail.com' });
      
      const newOrder = new Order.default({
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
            id: deliveryBoyUser._id.toString(),
            name: deliveryBoyUser.name,
            phone: deliveryBoyUser.phone,
            vehicleNumber: ''
          }
        }
      });
      
      await newOrder.save();
      console.log('✅ Test order created in yhk_database');
    } else {
      console.log('✅ Order exists in yhk_database:', order.orderNumber);
      console.log('Status:', order.status);
      console.log('Assigned to:', order.delivery?.deliveryPerson?.name);
    }
    
    console.log('\n=== READY FOR LOGIN ===');
    console.log('✅ Database: yhk_database');
    console.log('✅ Email: delivery34@gmail.com');
    console.log('✅ Password: delivery123');
    console.log('✅ Should work now!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
