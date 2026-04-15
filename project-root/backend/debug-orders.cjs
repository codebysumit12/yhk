const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yhk-food-delivery')
  .then(async () => {
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({}).limit(5).toArray();
    
    console.log('=== RAW ORDERS FROM DATABASE ===');
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1} (raw):`);
      console.log('  _id:', order._id);
      console.log('  orderNumber:', order.orderNumber);
      console.log('  orderType:', order.orderType);
      console.log('  orderItems exists:', !!order.orderItems);
      console.log('  orderItems length:', order.orderItems?.length || 0);
      console.log('  orderItems sample:', order.orderItems ? order.orderItems.slice(0, 1) : 'NONE');
      console.log('  customer:', order.customer);
      console.log('  pricing:', order.pricing);
      console.log('---');
    });
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
