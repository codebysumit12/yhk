import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING ITEM CATEGORIES VS DATABASE CATEGORIES');
  console.log('===============================================');
  
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  const categoriesCollection = db.collection('categories');
  
  // Get all items and their categories
  const items = await menuItemsCollection.find({}).toArray();
  console.log('\n📦 Items and their category strings:');
  const itemCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
  console.log('Item category strings:', itemCategories);
  
  // Get all categories from database
  const categories = await categoriesCollection.find({}).toArray();
  console.log('\n📋 All database categories:');
  categories.forEach((cat, i) => {
    console.log(`  ${i+1}. "${cat.name}" (ID: ${cat._id})`);
  });
  
  // Find matching categories
  console.log('\n🔍 Finding category matches:');
  itemCategories.forEach(itemCat => {
    const matchingDbCategory = categories.find(cat => 
      cat.name.toLowerCase() === itemCat.toLowerCase() ||
      cat.name.toLowerCase().includes(itemCat.toLowerCase()) ||
      itemCat.toLowerCase().includes(cat.name.toLowerCase())
    );
    
    if (matchingDbCategory) {
      console.log(`  ✅ "${itemCat}" → "${matchingDbCategory.name}" (ID: ${matchingDbCategory._id})`);
    } else {
      console.log(`  ❌ "${itemCat}" → NO MATCH FOUND`);
    }
  });
  
  // Show what the correct mapping should be
  console.log('\n🔧 Correct category mapping for frontend:');
  const categoryMap = {};
  itemCategories.forEach(itemCat => {
    const matchingDbCategory = categories.find(cat => 
      cat.name.toLowerCase() === itemCat.toLowerCase() ||
      cat.name.toLowerCase().includes(itemCat.toLowerCase()) ||
      itemCat.toLowerCase().includes(cat.name.toLowerCase())
    );
    
    if (matchingDbCategory) {
      categoryMap[itemCat] = matchingDbCategory._id;
    }
  });
  
  console.log('Frontend categoryMap should be:');
  console.log(JSON.stringify(categoryMap, null, 2));
  
  mongoose.disconnect();
}).catch(console.error);
