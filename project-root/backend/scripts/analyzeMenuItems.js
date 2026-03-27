import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 ANALYZING YOUR MENUITEMS DATA');
  console.log('================================');
  
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  
  // Get all menuitems to understand structure
  const allMenuItems = await menuItemsCollection.find({}).toArray();
  
  console.log(`Found ${allMenuItems.length} items in menuitems collection:`);
  
  allMenuItems.forEach((item, i) => {
    console.log(`\n${i+1}. ${item.name}:`);
    console.log(`   ID: ${item._id}`);
    console.log(`   Price: ${item.price}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Available: ${item.isAvailable}`);
    if (item.ratings) {
      console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    }
  });
  
  // Check if there are any orders that reference these menuitems
  console.log('\n📦 Checking orders collection:');
  const ordersCollection = db.collection('orders');
  const orders = await ordersCollection.find({}).toArray();
  
  console.log(`Found ${orders.length} orders`);
  
  let ordersWithMenuItems = 0;
  orders.forEach(order => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach(orderItem => {
        if (orderItem.menuItem) {
          ordersWithMenuItems++;
        }
      });
    }
  });
  
  console.log(`Orders with menu items: ${ordersWithMenuItems}`);
  
  // Check if any orders have ratings
  const ratedOrders = orders.filter(order => order.rating && order.rating.stars);
  console.log(`Rated orders: ${ratedOrders.length}`);
  
  mongoose.disconnect();
}).catch(console.error);
