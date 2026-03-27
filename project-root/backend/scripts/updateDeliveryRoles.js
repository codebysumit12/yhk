import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

console.log('🔧 Updating delivery user roles to delivery_partner...');

try {
  // Find all users with old delivery roles
  const deliveryUsers = await User.find({
    $or: [
      { role: 'delivery' },
      { role: 'delivery_boy' }
    ]
  });

  console.log(`Found ${deliveryUsers.length} delivery users to update`);

  // Update each user
  for (const user of deliveryUsers) {
    console.log(`Updating user: ${user.name} (${user.email}) - Current role: ${user.role}`);
    
    user.role = 'delivery_partner';
    await user.save();
    
    console.log(`✅ Updated to: delivery_partner`);
  }

  if (deliveryUsers.length === 0) {
    console.log('ℹ️ No users with old delivery roles found');
  }

  // Verify the update
  const updatedUsers = await User.find({ role: 'delivery_partner' });
  console.log(`\n✅ Total delivery_partner users: ${updatedUsers.length}`);
  
  updatedUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email})`);
  });

} catch (error) {
  console.error('❌ Error updating delivery users:', error);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from database');
}
