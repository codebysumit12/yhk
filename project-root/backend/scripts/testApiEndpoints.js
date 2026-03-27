import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🌐 TESTING FRONTEND API ENDPOINTS');
  console.log('==================================');
  
  // Test 1: Get item by ID (frontend might use this)
  console.log('\n📡 Test 1: GET /api/items/:id');
  const itemById = await Item.findById('69c0ddb502811983d1005fc0');
  if (itemById) {
    console.log('✅ Item found by ID');
    console.log(`   Name: ${itemById.name}`);
    console.log(`   Ratings: avg=${itemById.ratings.average}, count=${itemById.ratings.count}`);
  } else {
    console.log('❌ Item not found by ID');
  }
  
  // Test 2: Get item by slug (frontend might use this)
  console.log('\n📡 Test 2: GET /api/items/slug/:slug');
  const itemBySlug = await Item.findOne({ slug: 'tyytty' });
  if (itemBySlug) {
    console.log('✅ Item found by slug');
    console.log(`   Name: ${itemBySlug.name}`);
    console.log(`   Ratings: avg=${itemBySlug.ratings.average}, count=${itemBySlug.ratings.count}`);
  } else {
    console.log('❌ Item not found by slug');
  }
  
  // Test 3: Get all items (frontend might use this and filter)
  console.log('\n📡 Test 3: GET /api/items (all items)');
  const allItems = await Item.find({}).select('name slug ratings');
  const tyyttyItems = allItems.filter(item => 
    item.name.toLowerCase().includes('tyytty') || 
    item.slug.toLowerCase().includes('tyytty')
  );
  
  console.log(`Found ${tyyttyItems.length} items matching "tyytty":`);
  tyyttyItems.forEach((item, i) => {
    console.log(`  ${i+1}. ${item.name} (slug: ${item.slug})`);
    console.log(`     Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
  });
  
  // Test 4: Check if there are multiple similar items
  console.log('\n🔍 Test 4: Check for similar item names');
  const similarItems = await Item.find({
    name: { $regex: 'tyytty', $options: 'i' }
  });
  
  console.log(`Found ${similarItems.length} items with similar names:`);
  similarItems.forEach((item, i) => {
    console.log(`  ${i+1}. ID: ${item._id}`);
    console.log(`     Name: "${item.name}"`);
    console.log(`     Slug: "${item.slug}"`);
    console.log(`     Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
  });
  
  // Test 5: Create a fresh order with rating to test the system
  console.log('\n🧪 Test 5: Create fresh rated order');
  const Order = mongoose.model('Order');
  
  // Check if we have any other orders to rate
  const unratedOrders = await Order.find({
    'orderItems.menuItem': '69c0ddb502811983d1005fc0',
    'rating.stars': { $exists: false }
  });
  
  if (unratedOrders.length > 0) {
    console.log(`Found ${unratedOrders.length} unrated orders, rating one now...`);
    const orderToRate = unratedOrders[0];
    
    // Add a 5-star rating
    orderToRate.rating = {
      stars: 5,
      comment: 'Test rating from comprehensive test',
      ratedAt: new Date()
    };
    orderToRate.status = 'delivered';
    
    await orderToRate.save();
    console.log(`✅ Rated order ${orderToRate.orderNumber} with 5 stars`);
    
    // Now test the rating update
    const { updateItemRatings } = await import('../controllers/orderController.js');
    await updateItemRatings(orderToRate.orderItems);
    
    // Check final result
    const finalItem = await Item.findById('69c0ddb502811983d1005fc0');
    console.log(`\n🎯 Final item ratings after new rating:`);
    console.log(`   Average: ${finalItem.ratings.average}`);
    console.log(`   Count: ${finalItem.ratings.count}`);
    
    // Calculate expected: (1 + 5) / 2 = 3.0
    const expectedAverage = ((1 + 5) / 2).toFixed(2);
    console.log(`   Expected average: ${expectedAverage}`);
    
  } else {
    console.log('No unrated orders found to test with');
  }
  
  mongoose.disconnect();
}).catch(console.error);
