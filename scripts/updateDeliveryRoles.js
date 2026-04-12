import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Update delivery boy roles script
const updateDeliveryRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find users who might be delivery boys
    // Look for users with email patterns or specific names that suggest delivery role
    const potentialDeliveryUsers = await User.find({
      $or: [
        { email: /delivery/i },
        { email: /driver/i },
        { name: /delivery/i },
        { name: /driver/i },
        { role: { $nin: ['customer', 'admin', 'restaurant'] } }, // Users with non-standard roles
      ]
    });
    
    console.log(`Found ${potentialDeliveryUsers.length} potential delivery users`);
    
    // Update each user to have delivery_partner role
    for (const user of potentialDeliveryUsers) {
      console.log(`Updating user: ${user.email} (${user.name}) - Current role: ${user.role}`);
      user.role = 'delivery_partner';
      await user.save();
      console.log(`Updated role to delivery_partner`);
    }
    
    // Also check if there are any users with delivery_partner role already
    const existingDeliveryPartners = await User.find({ role: 'delivery_partner' });
    console.log(`Found ${existingDeliveryPartners.length} existing delivery partners`);
    
    console.log('Role update completed successfully');
    
  } catch (error) {
    console.error('Error updating delivery roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
updateDeliveryRoles();
