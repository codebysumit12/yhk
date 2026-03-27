import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 VERIFYING DATABASE DATA');
  console.log('==========================');
  
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  
  const items = await menuItemsCollection.find({}).toArray();
  
  console.log(`Found ${items.length} items in menuitems collection:`);
  items.forEach((item, i) => {
    console.log(`\n${i+1}. ${item.name}:`);
    console.log(`   Description: ${item.description}`);
    console.log(`   Price: ₹${item.price}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Image: ${item.image}`);
    console.log(`   Available: ${item.isAvailable}`);
    console.log(`   Created: ${item.createdAt}`);
    console.log(`   _id: ${item._id}`);
  });
  
  console.log('\n✅ CONCLUSION:');
  console.log('These are YOUR actual database items from the menuitems collection!');
  console.log('This is NOT static data - this is your real data!');
  
  mongoose.disconnect();
}).catch(console.error);
