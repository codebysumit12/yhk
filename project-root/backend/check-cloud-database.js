import mongoose from 'mongoose';

// Connect to the actual cloud database that the server uses
mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    console.log('✅ Connected to cloud MongoDB Atlas database');
    
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // 1. Find delivery pratap with the admin panel ID
    const deliveryPratap = await User.default.findOne({ 
      _id: '69bba8423b40234683213f0e' 
    });
    
    if (deliveryPratap) {
      console.log('✅ Found delivery pratap in cloud database:');
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
      console.log('\nOrders assigned to delivery pratap:', assignedOrders.length);
      
      assignedOrders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Customer: ${order.customer?.name}`);
        console.log(`  Phone: ${order.customer?.phone}`);
        console.log(`  Delivery Address: ${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`);
        console.log('');
      });
      
    } else {
      console.log('❌ Delivery pratap not found in cloud database');
      
      // Check all delivery partners
      const deliveryPartners = await User.default.find({ role: 'delivery_partner' });
      console.log('\nAll delivery partners in cloud database:');
      deliveryPartners.forEach(partner => {
        console.log(`- ${partner.name} (${partner.email}) - ID: ${partner._id.toString()}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Cloud database connection error:', err.message);
    process.exit(1);
  });
