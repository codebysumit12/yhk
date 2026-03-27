import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase(dbName, dbUri) {
  console.log(`\n=== CHECKING DATABASE: ${dbName} ===`);
  
  try {
    await mongoose.connect(dbUri);
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // 1. Find delivery pratap
    const deliveryPratap = await User.default.findOne({ email: 'deliverypratap@gmail.com' });
    
    if (deliveryPratap) {
      console.log('✅ Found delivery pratap:');
      console.log('Name:', deliveryPratap.name);
      console.log('Email:', deliveryPratap.email);
      console.log('ID:', deliveryPratap._id.toString());
      console.log('Role:', deliveryPratap.role);
      console.log('Active:', deliveryPratap.isActive);
      
      // 2. Check orders assigned to this delivery boy
      const query = { 
        $or: [
          { 'delivery.deliveryPerson.id': deliveryPratap._id.toString() },
          { 'delivery.deliveryPerson.id': deliveryPratap._id }
        ]
      };
      
      const assignedOrders = await Order.default.find(query);
      console.log('Orders assigned:', assignedOrders.length);
      
      assignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status} (Customer: ${order.customer?.name})`);
      });
      
    } else {
      console.log('❌ Delivery pratap not found in this database');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error(`Error checking ${dbName}:`, error.message);
  }
}

async function main() {
  // Check both possible databases
  await checkDatabase('Default yhk', 'mongodb://localhost:27017/yhk');
  await checkDatabase('yhk_database', 'mongodb://localhost:27017/yhk_database');
  
  console.log('\n=== CONCLUSION ===');
  console.log('If delivery pratap is found in one database but not the other,');
  console.log('then the admin panel and API server are using different databases.');
  
  process.exit(0);
}

main();
