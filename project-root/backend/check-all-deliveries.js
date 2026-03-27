import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== ALL DELIVERY PARTNERS IN DATABASE ===');
    
    const deliveryPartners = await User.default.find({ role: 'delivery_partner' });
    console.log('Total delivery partners:', deliveryPartners.length);
    
    deliveryPartners.forEach(partner => {
      console.log(`- Name: ${partner.name}`);
      console.log(`  Email: ${partner.email}`);
      console.log(`  Phone: ${partner.phone}`);
      console.log(`  ID: ${partner._id.toString()}`);
      console.log(`  Active: ${partner.isActive}`);
      console.log('');
    });
    
    console.log('=== RECENT ORDERS WITH DELIVERY ASSIGNMENTS ===');
    const recentOrders = await Order.default.find({ 
      'delivery.deliveryPerson': { $exists: true }
    }).sort({ createdAt: -1 }).limit(10);
    
    console.log('Recent assigned orders:', recentOrders.length);
    
    recentOrders.forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.status}`);
      console.log(`  Customer: ${order.customer?.name}`);
      console.log(`  Assigned to: ${order.delivery?.deliveryPerson?.name}`);
      console.log(`  Delivery Person Email: ${order.delivery?.deliveryPerson?.email || 'N/A'}`);
      console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
