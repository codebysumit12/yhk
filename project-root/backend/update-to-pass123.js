import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('=== UPDATING PASSWORD TO Pass123 ===');
    
    const deliveryBoy = await User.default.findOne({ email: 'delivery34@gmail.com' });
    
    if (!deliveryBoy) {
      console.log('❌ Delivery boy not found');
      process.exit(1);
    }
    
    // Update password to Pass123
    const newHash = await bcrypt.hash('Pass123', 10);
    await User.default.updateOne(
      { _id: deliveryBoy._id },
      { $set: { password: newHash } }
    );
    
    console.log('✅ Password updated to "Pass123"');
    
    // Verify
    const updatedUser = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
    const pass123Match = await bcrypt.compare('Pass123', updatedUser.password);
    console.log('✅ Password "Pass123" verification:', pass123Match);
    
    console.log('\n=== USE THESE CREDENTIALS ===');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: Pass123');
    console.log('This should work now!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
