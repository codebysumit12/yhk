import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK&retryWrites=true&w=majority';

const testMenuData = async () => {
  try {
    console.log('🔍 Testing menu data relationships...');
    
    await mongoose.connect(ATLAS_URI);
    const db = mongoose.connection.db;
    
    // Get all categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`\n📋 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   ${cat.name}: ${cat._id} (active: ${cat.isActive})`);
    });
    
    // Get all items
    const items = await db.collection('items').find({}).toArray();
    console.log(`\n🍽️ Found ${items.length} items:`);
    items.forEach(item => {
      console.log(`   ${item.name}: categoryId = ${item.categoryId}`);
    });
    
    // Check which items match which categories
    console.log('\n🔗 Item-Category Relationships:');
    items.forEach(item => {
      const matchingCategory = categories.find(cat => cat._id === item.categoryId);
      if (matchingCategory) {
        console.log(`   ✅ ${item.name} → ${matchingCategory.name} (${item.categoryId})`);
      } else {
        console.log(`   ❌ ${item.name} → NO MATCH (categoryId: ${item.categoryId})`);
      }
    });
    
    // Check active categories with items
    console.log('\n📊 Active Categories with Items:');
    const activeCategories = categories.filter(cat => cat.isActive);
    activeCategories.forEach(cat => {
      const itemsInCategory = items.filter(item => item.categoryId === cat._id);
      console.log(`   ${cat.name}: ${itemsInCategory.length} items`);
      if (itemsInCategory.length > 0) {
        itemsInCategory.forEach(item => {
          console.log(`     - ${item.name}`);
        });
      }
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMenuData();
