import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== CREATING DELIVERY PARTNER: delivery pratap ===');
    
    // 1. Create the delivery partner
    const hashedPassword = await bcrypt.hash('delivery123', 10);
    
    const deliveryPratap = new User.default({
      name: 'delivery pratap',
      email: 'deliverypratap@gmail.com',
      phone: '9370330924',
      password: hashedPassword,
      role: 'delivery_partner',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      preferences: {},
      addresses: []
    });
    
    await deliveryPratap.save();
    console.log('✅ Delivery partner created:');
    console.log('Name:', deliveryPratap.name);
    console.log('Email:', deliveryPratap.email);
    console.log('ID:', deliveryPratap._id.toString());
    console.log('Password: delivery123');
    
    // 2. Check if there are any orders assigned to this ID (maybe from admin panel)
    console.log('\n=== CHECKING FOR EXISTING ORDERS ===');
    
    const query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryPratap._id.toString() },
        { 'delivery.deliveryPerson.id': deliveryPratap._id }
      ]
    };
    
    const assignedOrders = await Order.default.find(query);
    console.log('Orders found for delivery pratap:', assignedOrders.length);
    
    if (assignedOrders.length > 0) {
      assignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Customer: ${order.customer?.name}`);
        console.log(`  Assigned to: ${order.delivery?.deliveryPerson?.name}`);
      });
    } else {
      console.log('❌ No orders assigned to delivery pratap');
      
      // Check if there are any unassigned orders
      console.log('\n=== CHECKING UNASSIGNED ORDERS ===');
      const unassignedOrders = await Order.default.find({ 
        status: { $in: ['confirmed', 'preparing', 'ready'] },
        'delivery.deliveryPerson': { $exists: false }
      });
      
      console.log('Unassigned orders:', unassignedOrders.length);
      unassignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status} (Customer: ${order.customer?.name})`);
      });
    }
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Email: deliverypratap@gmail.com');
    console.log('Password: delivery123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
