import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    const User = await import('./models/User.js');
    
    // Check for delivery partners
    const deliveryPartners = await User.default.find({ role: 'delivery_partner' });
    console.log(`Delivery partners in system: ${deliveryPartners.length}`);
    deliveryPartners.forEach(partner => {
      console.log(`- ${partner.name} (${partner.email}) - ID: ${partner._id}`);
    });
    
    // Check all orders first
    const allOrders = await Order.default.find({});
    console.log(`Total orders in database: ${allOrders.length}`);
    
    // Show recent orders with delivery assignments
    const recentOrders = await Order.default.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\nRecent orders:');
    for (const order of recentOrders) {
      console.log(`- ${order.orderNumber}: Status=${order.status}, Delivery Person=${order.delivery?.deliveryPerson?.name || 'None'}`);
    }
    
    // Check for orders with delivery assignments
    const assignedOrders = await Order.default.find({ 
      'delivery.deliveryPerson': { $exists: true }
    });
    console.log(`\nOrders with delivery person assigned: ${assignedOrders.length}`);
    
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('Order found:');
      console.log('Order Number:', order.orderNumber);
      console.log('Status:', order.status);
      console.log('Delivery Person:', JSON.stringify(order.delivery?.deliveryPerson, null, 2));
      console.log('Customer:', JSON.stringify(order.customer, null, 2));
      console.log('Delivery Address:', JSON.stringify(order.deliveryAddress, null, 2));
    } else {
      console.log('Order HK000045 not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
