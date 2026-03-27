import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING YOUR ACTUAL FOOD CATEGORIES');
  console.log('======================================');
  
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection('categories');
  const menuItemsCollection = db.collection('menuitems');
  
  // Get all your items
  const items = await menuItemsCollection.find({}).toArray();
  console.log('\n📦 Your items and their categories:');
  items.forEach(item => {
    console.log(`  "${item.name}" → category: "${item.category}"`);
  });
  
  // Get all your database categories
  const categories = await categoriesCollection.find({}).toArray();
  console.log('\n📋 All your database categories:');
  categories.forEach((cat, i) => {
    console.log(`  ${i+1}. "${cat.name}" (ID: ${cat._id})`);
  });
  
  // Find the correct matches
  console.log('\n🔍 Finding correct category matches:');
  const itemCategories = ['main_course', 'beverage', 'appetizer'];
  
  itemCategories.forEach(itemCat => {
    const matches = categories.filter(cat => 
      cat.name.toLowerCase().includes(itemCat.toLowerCase()) ||
      itemCat.toLowerCase().includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === itemCat.toLowerCase()
    );
    
    if (matches.length > 0) {
      console.log(`  ✅ "${itemCat}" matches:`);
      matches.forEach(match => {
        console.log(`    → "${match.name}" (ID: ${match._id})`);
      });
    } else {
      console.log(`  ❌ "${itemCat}" → NO MATCH FOUND`);
    }
  });
  
  // Show what categories might be related to food items
  console.log('\n🍽️ Food-related categories in your database:');
  const foodCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes('pizza') ||
    cat.name.toLowerCase().includes('food') ||
    cat.name.toLowerCase().includes('sweet') ||
    cat.name.toLowerCase().includes('katli') ||
    cat.name.toLowerCase().includes('test')
  );
  
  foodCategories.forEach(cat => {
    console.log(`  "${cat.name}" (ID: ${cat._id})`);
  });
  
  mongoose.disconnect();
}).catch(console.error);
