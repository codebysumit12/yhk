// Debug script to test search functionality directly
import mongoose from 'mongoose';

// Simple test without environment dependencies
const testDirectConnection = async () => {
  try {
    // Connect to MongoDB directly
    await mongoose.connect('mongodb://localhost:27017/yhk_database');
    console.log('✅ Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));

    // Check both collections
    const collectionsToCheck = ['menuitems', 'items'];
    
    for (const collectionName of collectionsToCheck) {
      if (collections.some(c => c.name === collectionName)) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📦 ${collectionName} collection has ${count} documents`);
        
        if (count > 0) {
          // Get a few sample documents
          const samples = await collection.find({}).limit(3).toArray();
          console.log(`📝 Sample documents from ${collectionName}:`);
          samples.forEach((doc, index) => {
            console.log(`  ${index + 1}. Name: "${doc.name}", Description: "${doc.description?.substring(0, 50)}..."`);
          });

          // Test regex search directly on collection
          const searchRegex = new RegExp('banana', 'i');
          const searchResults = await collection.find({
            $or: [
              { name: { $regex: searchRegex } },
              { description: { $regex: searchRegex } }
            ]
          }).toArray();
          
          console.log(`🔍 Regex search for "banana" in ${collectionName} found: ${searchResults.length} items`);
          searchResults.forEach(item => {
            console.log(`  - ${item.name}`);
          });

          // Test search for "black"
          const blackRegex = new RegExp('black', 'i');
          const blackResults = await collection.find({
            $or: [
              { name: { $regex: blackRegex } },
              { description: { $regex: blackRegex } }
            ]
          }).toArray();
          
          console.log(`🔍 Regex search for "black" in ${collectionName} found: ${blackResults.length} items`);
          blackResults.forEach(item => {
            console.log(`  - ${item.name}`);
          });
        }
      } else {
        console.log(`❌ ${collectionName} collection not found`);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testDirectConnection();
