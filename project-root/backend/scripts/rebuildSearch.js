import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import dotenv from 'dotenv';

dotenv.config();

const rebuildSearch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing text indexes
    try {
      await MenuItem.collection.dropIndex('name_text_description_text_tags_text');
      console.log('🗑️ Dropped existing text index');
    } catch (error) {
      console.log('ℹ️ No existing text index to drop');
    }

    // Create new comprehensive text indexes
    await MenuItem.collection.createIndex({ 
      name: 'text', 
      description: 'text', 
      tags: 'text',
      ingredients: 'text'
    });

    console.log('✅ Enhanced text indexes created successfully');
    
    // Test the search
    const testSearch = await MenuItem.find({ 
      $text: { $search: 'do' } 
    }).limit(3);
    
    console.log(`🧪 Test search for "do" found ${testSearch.length} items`);
    testSearch.forEach(item => {
      console.log(`   - ${item.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

rebuildSearch();
