import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== CHECKING DELIVERY PARTNER: delivery pratap ===');
    
    // 1. Find the delivery partner
    const deliveryBoy = await User.default.findOne({ email: 'deliverypratap@gmail.com' });
    
    if (!deliveryBoy) {
      console.log('❌ Delivery partner not found');
      process.exit(1);
    }
    
    console.log('✅ Found delivery partner:');
    console.log('Name:', deliveryBoy.name);
    console.log('Email:', deliveryBoy.email);
    console.log('Phone:', deliveryBoy.phone);
    console.log('ID:', deliveryBoy._id.toString());
    console.log('Role:', deliveryBoy.role);
    console.log('Active:', deliveryBoy.isActive);
    
    // 2. Check what orders are assigned to this delivery boy
    console.log('\n=== CHECKING ASSIGNED ORDERS ===');
    
    const query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoy._id.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoy._id }
      ]
    };
    
    const assignedOrders = await Order.default.find(query);
    console.log('Orders assigned to this delivery boy:', assignedOrders.length);
    
    if (assignedOrders.length > 0) {
      assignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Customer: ${order.customer?.name}`);
        console.log(`  Assigned to: ${order.delivery?.deliveryPerson?.name}`);
        console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
        console.log('');
      });
    } else {
      console.log('❌ No orders found assigned to this delivery boy');
      
      // Check all orders with delivery assignments
      console.log('\n=== ALL ORDERS WITH DELIVERY ASSIGNMENTS ===');
      const allAssignedOrders = await Order.default.find({ 
        'delivery.deliveryPerson': { $exists: true }
      });
      
      console.log('Total orders with delivery assignments:', allAssignedOrders.length);
      
      allAssignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Assigned to: ${order.delivery?.deliveryPerson?.name} (${order.delivery?.deliveryPerson?.email || 'N/A'})`);
        console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
        console.log('');
      });
    }
    
    // 3. Test the API query that getMyDeliveries uses
    console.log('=== TESTING API QUERY ===');
    const apiOrders = await Order.default.find(query).sort({ createdAt: -1 });
    console.log('API query results:', apiOrders.length, 'orders');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
