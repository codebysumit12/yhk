// Test script to verify delivery partner flow
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

console.log('🔍 Checking delivery partner setup...\n');

try {
  // 1. Check delivery partners
  const deliveryPartners = await User.find({ role: 'delivery_partner' });
  console.log(`Found ${deliveryPartners.length} delivery partners:`);
  deliveryPartners.forEach(partner => {
    console.log(`- ${partner.name} (${partner.email}) - ID: ${partner._id} - Active: ${partner.isActive}`);
  });

  // 2. Check orders with delivery assignments
  const assignedOrders = await Order.find({ 'delivery.deliveryPerson': { $exists: true } });
  console.log(`\nFound ${assignedOrders.length} orders with delivery assignments:`);
  assignedOrders.forEach(order => {
    console.log(`- Order ${order.orderNumber} - Status: ${order.status} - Assigned to: ${order.delivery.deliveryPerson.name} (${order.delivery.deliveryPerson.id})`);
  });

  // 3. Check orders ready for delivery
  const readyOrders = await Order.find({ status: 'ready' });
  console.log(`\nFound ${readyOrders.length} orders ready for delivery:`);
  readyOrders.forEach(order => {
    console.log(`- Order ${order.orderNumber} - Customer: ${order.customer.name}`);
  });

  // 4. Test delivery partner login flow
  if (deliveryPartners.length > 0) {
    const testPartner = deliveryPartners[0];
    console.log(`\n📱 Testing login for ${testPartner.name}:`);
    console.log(`- Email: ${testPartner.email}`);
    console.log(`- Role: ${testPartner.role}`);
    console.log(`- Expected deliveryBoyId in localStorage: ${testPartner._id}`);
    
    // Check if this partner has any assigned orders
    const myOrders = await Order.find({ 'delivery.deliveryPerson.id': testPartner._id });
    console.log(`- Assigned orders: ${myOrders.length}`);
    myOrders.forEach(order => {
      console.log(`  * Order ${order.orderNumber} - Status: ${order.status}`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from database');
}
