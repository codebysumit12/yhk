import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING CATEGORY MAPPING ISSUE');
  console.log('===================================');
  
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection('categories');
  const menuItemsCollection = db.collection('menuitems');
  
  // Get all categories
  const categories = await categoriesCollection.find({}).toArray();
  console.log('\n📋 All categories:');
  categories.forEach(cat => {
    console.log(`  "${cat.name}" (ID: ${cat._id})`);
  });
  
  // Get all items with their categories
  const items = await menuItemsCollection.find({}).toArray();
  console.log('\n📦 Items and their categories:');
  items.forEach(item => {
    console.log(`  "${item.name}" -> category: "${item.category}"`);
  });
  
  // Find the problematic category ID
  console.log('\n🎯 Looking for category ID: 69b927bc512cc0d1b21cd63c');
  const targetCategory = categories.find(cat => cat._id.toString() === '69b927bc512cc0d1b21cd63c');
  
  if (targetCategory) {
    console.log(`✅ Found: "${targetCategory.name}"`);
    
    // Check if any items match this category name
    const matchingItems = items.filter(item => item.category === targetCategory.name);
    console.log(`Items matching "${targetCategory.name}": ${matchingItems.length}`);
    
    if (matchingItems.length === 0) {
      console.log('❌ No items match this category name!');
      console.log('Available item categories:', [...new Set(items.map(item => item.category))]);
    }
  } else {
    console.log('❌ Category ID not found!');
  }
  
  // Show category mapping that should work
  console.log('\n🔧 Correct category mappings:');
  const categoryMap = {
    'main_course': 'Main Course',
    'beverage': 'Beverages', 
    'appetizer': 'Appetizers'
  };
  
  Object.entries(categoryMap).forEach(([itemCategory, categoryName]) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      console.log(`  "${itemCategory}" -> "${categoryName}" (ID: ${category._id})`);
    } else {
      console.log(`  "${itemCategory}" -> "${categoryName}" (NOT FOUND)`);
    }
  });
  
  mongoose.disconnect();
}).catch(console.error);
