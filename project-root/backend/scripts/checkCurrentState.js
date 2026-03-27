import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Checking current database state...');
  
  // Check all items named "tyytty"
  const items = await Item.find({ name: 'tyytty' });
  console.log(`Found ${items.length} items named "tyytty":`);
  items.forEach((item, i) => {
    console.log(`  ${i+1}. ID: ${item._id}, Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
  });
  
  // Check all orders with ratings
  const ratedOrders = await Order.find({'rating.stars': { $exists: true }});
  console.log(`\nFound ${ratedOrders.length} orders with ratings:`);
  ratedOrders.forEach((order, i) => {
    console.log(`  ${i+1}. Order: ${order.orderNumber}, Rating: ${order.rating.stars} stars`);
    order.orderItems.forEach((item, j) => {
      console.log(`      Item ${j+1}: ${item.name} (ID: ${item.menuItem})`);
    });
  });
  
  // Run the backfill to fix all items
  console.log('\n🔄 Running backfill to fix all item ratings...');
  try {
    const { backfillItemRatings } = await import('../controllers/orderController.js');
    
    // Mock req and res for the backfill function
    const mockRes = {
      json: (data) => {
        console.log('Backfill result:', data.message);
        console.log(`Processed ${data.data?.length || 0} items`);
        data.data?.forEach(item => {
          console.log(`  ✅ ${item.name}: avg=${item.average}, count=${item.count}`);
        });
      },
      status: () => mockRes
    };
    
    await backfillItemRatings({}, mockRes);
    
    // Check final state
    console.log('\n📊 Final item state after backfill:');
    const finalItems = await Item.find({ name: 'tyytty' });
    finalItems.forEach((item, i) => {
      console.log(`  ${i+1}. ID: ${item._id}, Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    });
    
  } catch (err) {
    console.error('Backfill error:', err);
  }
  
  mongoose.disconnect();
}).catch(console.error);
