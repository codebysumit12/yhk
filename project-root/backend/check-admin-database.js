import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== CHECKING ADMIN PANEL DATABASE ===');
console.log('Current MONGODB_URI:', process.env.MONGODB_URI);

// Try to connect to the admin panel's database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    // Check if delivery pratap exists with the exact ID from admin panel
    const deliveryPratap = await User.default.findOne({ 
      _id: '69bba8423b40234683213f0e' 
    });
    
    if (deliveryPratap) {
      console.log('✅ Found delivery pratap with admin panel ID:');
      console.log('Name:', deliveryPratap.name);
      console.log('Email:', deliveryPratap.email);
      console.log('ID:', deliveryPratap._id.toString());
      
      // Check orders assigned to this specific ID
      const Order = await import('./models/Order.js');
      const query = { 
        $or: [
          { 'delivery.deliveryPerson.id': deliveryPratap._id.toString() },
          { 'delivery.deliveryPerson.id': deliveryPratap._id }
        ]
      };
      
      const assignedOrders = await Order.default.find(query);
      console.log('Orders assigned to this ID:', assignedOrders.length);
      
      assignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status} (Customer: ${order.customer?.name})`);
      });
      
    } else {
      console.log('❌ Delivery pratap not found with admin panel ID');
      
      // Check all users to see what's in this database
      const allUsers = await User.default.find({});
      console.log('Total users in this database:', allUsers.length);
      
      const roles = {};
      allUsers.forEach(user => {
        roles[user.role] = (roles[user.role] || 0) + 1;
      });
      console.log('Roles:', roles);
      
      // Check if delivery pratap exists by email
      const byEmail = await User.default.findOne({ email: 'deliverypratap@gmail.com' });
      if (byEmail) {
        console.log('✅ Found delivery pratap by email:');
        console.log('  ID:', byEmail._id.toString());
        console.log('  (Different from admin panel ID)');
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
