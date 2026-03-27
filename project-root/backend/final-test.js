import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== DELIVERY BOY LOGIN TEST ===');
    
    // 1. Check delivery boy credentials
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (deliveryBoy) {
      console.log('✅ Delivery boy found:');
      console.log('   Name:', deliveryBoy.name);
      console.log('   Email:', deliveryBoy.email);
      console.log('   Phone:', deliveryBoy.phone);
      console.log('   Role:', deliveryBoy.role);
      console.log('   ID:', deliveryBoy._id.toString());
      console.log('   Password set:', !!deliveryBoy.password);
    }
    
    console.log('\n=== ORDER ASSIGNMENT TEST ===');
    
    // 2. Check order assignment
    const order = await Order.default.findOne({ orderNumber: 'HK000045' });
    if (order) {
      console.log('✅ Order found:');
      console.log('   Order Number:', order.orderNumber);
      console.log('   Status:', order.status);
      console.log('   Delivery Person:', order.delivery?.deliveryPerson?.name);
      console.log('   Delivery Person ID:', order.delivery?.deliveryPerson?.id);
      
      // 3. Test the query that getMyDeliveries uses
      const deliveryBoyId = deliveryBoy._id;
      const query = { 
        $or: [
          { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
          { 'delivery.deliveryPerson.id': deliveryBoyId }
        ]
      };
      
      const orders = await Order.default.find(query);
      console.log('\n✅ Query test results:');
      console.log('   Orders found:', orders.length);
      orders.forEach(o => {
        console.log(`   - ${o.orderNumber} (${o.status})`);
      });
    }
    
    console.log('\n=== LOGIN INSTRUCTIONS ===');
    console.log('To test the delivery boy login:');
    console.log('1. Go to the login page');
    console.log('2. Email: delivery34@gmail.com');
    console.log('3. Password: delivery123');
    console.log('4. Should redirect to /admin/delivery-app');
    console.log('5. Should see the order HK000045 in the delivery list');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
