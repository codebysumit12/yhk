import mongoose from 'mongoose';

const fixUserSchema = async () => {
  try {
    // Connect to MongoDB using the same connection string as db.js
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the problematic phone index
    try {
      await usersCollection.dropIndex('phone_1');
      console.log('✅ Dropped phone_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  phone_1 index does not exist');
      } else {
        console.log('⚠️  Error dropping phone_1 index:', error.message);
      }
    }

    // List all indexes to verify
    const indexes = await usersCollection.listIndexes().toArray();
    console.log('Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('✅ Schema fix completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  }
};

fixUserSchema();
