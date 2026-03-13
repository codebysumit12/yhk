import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK', {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
