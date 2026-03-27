import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('=== TESTING LOGIN MANUALLY ===');
    
    // 1. Find the delivery boy
    const deliveryBoy = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
    
    if (!deliveryBoy) {
      console.log('❌ Delivery boy not found');
      process.exit(1);
    }
    
    console.log('✅ Found delivery boy:', deliveryBoy.name);
    console.log('Password hash exists:', !!deliveryBoy.password);
    console.log('Password hash length:', deliveryBoy.password?.length);
    
    // 2. Test password comparison
    const testPassword = 'delivery123';
    console.log('\nTesting password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, deliveryBoy.password);
    console.log('Password match result:', isMatch);
    
    // 3. Test the model method
    const methodMatch = await deliveryBoy.matchPassword(testPassword);
    console.log('Model method match result:', methodMatch);
    
    // 4. If password doesn't match, reset it
    if (!isMatch) {
      console.log('\n❌ Password mismatch, resetting...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash length:', newHash.length);
      
      // Update directly without pre-save hook
      await User.default.updateOne(
        { _id: deliveryBoy._id },
        { $set: { password: newHash } }
      );
      
      console.log('✅ Password reset successfully');
      
      // Test again
      const updatedUser = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
      const finalMatch = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('Final password match:', finalMatch);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
