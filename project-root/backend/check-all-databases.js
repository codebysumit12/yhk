import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllDatabases() {
  console.log('=== CHECKING ALL POSSIBLE DATABASES ===');
  
  const databases = [
    { name: 'Default yhk', uri: 'mongodb://localhost:27017/yhk' },
    { name: 'yhk_database', uri: 'mongodb://localhost:27017/yhk_database' },
    { name: 'yhk_app', uri: 'mongodb://localhost:27017/yhk_app' },
    { name: 'yeswanth', uri: 'mongodb://localhost:27017/yeswanth' },
  ];
  
  for (const db of databases) {
    try {
      await mongoose.connect(db.uri);
      const User = await import('./models/User.js');
      
      // Check all users in this database
      const allUsers = await User.default.find({});
      
      if (allUsers.length > 0) {
        console.log(`\n=== ${db.name} (${allUsers.length} users) ===`);
        
        const roles = {};
        allUsers.forEach(user => {
          roles[user.role] = (roles[user.role] || 0) + 1;
        });
        
        console.log('Roles distribution:', roles);
        
        // Check if delivery pratap exists here
        const deliveryPratap = allUsers.find(u => u.email === 'deliverypratap@gmail.com');
        if (deliveryPratap) {
          console.log('✅ delivery pratap found here!');
          console.log('  ID:', deliveryPratap._id.toString());
        }
        
        // Check if there are orders
        const Order = await import('./models/Order.js');
        const orders = await Order.default.find({});
        console.log('Orders:', orders.length);
        
        if (orders.length > 0) {
          const assignedOrders = orders.filter(o => o.delivery?.deliveryPerson);
          console.log('Orders with delivery assignment:', assignedOrders.length);
        }
      }
      
      await mongoose.connection.close();
      
    } catch (error) {
      console.log(`❌ Error connecting to ${db.name}: ${error.message}`);
    }
  }
  
  console.log('\n=== CONCLUSION ===');
  console.log('Find which database has the most users and delivery pratap,');
  console.log('then update the API server to use that database.');
}

checkAllDatabases();
