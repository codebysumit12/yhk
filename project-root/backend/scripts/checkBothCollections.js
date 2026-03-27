import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING BOTH COLLECTIONS');
  console.log('============================');
  
  const db = mongoose.connection.db;
  
  // Check items collection
  console.log('\n📦 Checking "items" collection:');
  const itemsCollection = db.collection('items');
  const itemsCount = await itemsCollection.countDocuments();
  const itemsData = await itemsCollection.find({}).toArray();
  
  console.log(`Found ${itemsCount} documents in "items" collection`);
  if (itemsCount > 0) {
    console.log('Sample item:', itemsData[0]);
  }
  
  // Check menuitems collection
  console.log('\n📦 Checking "menuitems" collection:');
  const menuItemsCollection = db.collection('menuitems');
  const menuItemsCount = await menuItemsCollection.countDocuments();
  const menuItemsData = await menuItemsCollection.find({}).toArray();
  
  console.log(`Found ${menuItemsCount} documents in "menuitems" collection`);
  if (menuItemsCount > 0) {
    console.log('Sample menuitem:', menuItemsData[0]);
  }
  
  // Look for your specific item
  console.log('\n🔍 Looking for item "tyytty":');
  
  const tyyttyInItems = await itemsCollection.findOne({ name: 'tyytty' });
  const tyyttyInMenuItems = await menuItemsCollection.findOne({ name: 'tyytty' });
  
  if (tyyttyInItems) {
    console.log('✅ Found "tyytty" in "items" collection:');
    console.log('   Ratings:', tyyttyInItems.ratings);
  }
  
  if (tyyttyInMenuItems) {
    console.log('✅ Found "tyytty" in "menuitems" collection:');
    console.log('   Ratings:', tyyttyInMenuItems.ratings);
  }
  
  // If data is in menuitems, we need to move it or update the model
  if (tyyttyInMenuItems && !tyyttyInItems) {
    console.log('\n🔧 DATA IS IN "menuitems" COLLECTION!');
    console.log('Backend is looking in "items" collection.');
    console.log('Need to either:');
    console.log('1. Move data from menuitems to items, OR');
    console.log('2. Update backend model to use menuitems collection');
  }
  
  mongoose.disconnect();
}).catch(console.error);
