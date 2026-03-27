import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING CATEGORIES IN DATABASE');
  console.log('==================================');
  
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection('categories');
  
  const categories = await categoriesCollection.find({}).toArray();
  
  console.log(`Found ${categories.length} categories:`);
  categories.forEach((cat, i) => {
    console.log(`\n${i+1}. ${cat.name}:`);
    console.log(`   ID: ${cat._id}`);
    console.log(`   Slug: ${cat.slug}`);
    console.log(`   Active: ${cat.isActive}`);
  });
  
  // Check which category the frontend is trying to use
  console.log('\n🎯 Frontend is looking for category ID: 69c02026ade712947c4b700e');
  
  const targetCategory = categories.find(cat => cat._id.toString() === '69c02026ade712947c4b700e');
  if (targetCategory) {
    console.log(`✅ Found category: ${targetCategory.name}`);
    
    // Check if any items match this category
    const menuItemsCollection = db.collection('menuitems');
    const itemsInCategory = await menuItemsCollection.find({ category: targetCategory.name }).toArray();
    
    console.log(`Found ${itemsInCategory.length} items in "${targetCategory.name}" category:`);
    itemsInCategory.forEach(item => {
      console.log(`   - ${item.name}`);
    });
  } else {
    console.log('❌ Category not found');
    
    // Show all category names for reference
    console.log('\n📋 Available category names:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });
  }
  
  mongoose.disconnect();
}).catch(console.error);
