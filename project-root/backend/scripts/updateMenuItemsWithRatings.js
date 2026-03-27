import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔧 UPDATING MENUITEMS WITH RATINGS');
  console.log('==================================');
  
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  
  // Check current structure
  const items = await menuItemsCollection.find({}).toArray();
  
  console.log('Current menuitems structure:');
  items.forEach((item, i) => {
    console.log(`\n${i+1}. ${item.name}:`);
    console.log(`   Has ratings field: ${!!item.ratings}`);
    if (item.ratings) {
      console.log(`   Ratings: ${JSON.stringify(item.ratings)}`);
    }
  });
  
  // Add ratings field to all items if missing
  console.log('\n🔧 Adding ratings field to all items...');
  
  const updateResult = await menuItemsCollection.updateMany(
    { ratings: { $exists: false } },
    { 
      $set: { 
        ratings: { average: 0, count: 0 },
        soldCount: 0
      }
    }
  );
  
  console.log(`✅ Updated ${updateResult.modifiedCount} items with ratings field`);
  
  // Now check if there are any rated orders and update item ratings
  console.log('\n📊 Updating item ratings based on orders...');
  
  const ordersCollection = db.collection('orders');
  const ratedOrders = await ordersCollection.find({
    'rating.stars': { $exists: true, $gte: 1 }
  }).toArray();
  
  console.log(`Found ${ratedOrders.length} rated orders`);
  
  // Group ratings by item
  const itemRatings = {};
  
  ratedOrders.forEach(order => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach(orderItem => {
        const itemId = orderItem.menuItem?.toString();
        if (itemId) {
          if (!itemRatings[itemId]) {
            itemRatings[itemId] = { totalStars: 0, count: 0, soldCount: 0 };
          }
          itemRatings[itemId].totalStars += order.rating.stars;
          itemRatings[itemId].count += 1;
          itemRatings[itemId].soldCount += orderItem.quantity || 1;
        }
      });
    }
  });
  
  // Update each item with calculated ratings
  console.log('\n🎯 Updating items with calculated ratings:');
  
  for (const [itemId, ratings] of Object.entries(itemRatings)) {
    const average = (ratings.totalStars / ratings.count).toFixed(2);
    
    await menuItemsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(itemId) },
      { 
        $set: { 
          'ratings.average': parseFloat(average),
          'ratings.count': ratings.count,
          soldCount: ratings.soldCount
        }
      }
    );
    
    console.log(`✅ Updated item ${itemId}: avg=${average}, count=${ratings.count}`);
  }
  
  // Show final results
  console.log('\n🎉 FINAL RESULTS:');
  const finalItems = await menuItemsCollection.find({}).toArray();
  
  finalItems.forEach((item, i) => {
    console.log(`\n${i+1}. ${item.name}:`);
    console.log(`   Ratings: avg=${item.ratings?.average || 0}, count=${item.ratings?.count || 0}`);
    console.log(`   Sold Count: ${item.soldCount || 0}`);
  });
  
  mongoose.disconnect();
}).catch(console.error);
