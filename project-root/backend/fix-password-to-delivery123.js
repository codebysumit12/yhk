import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('=== CHECKING ACTUAL PASSWORD ===');
    
    const deliveryBoy = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
    
    if (!deliveryBoy) {
      console.log('❌ Delivery boy not found');
      process.exit(1);
    }
    
    console.log('✅ Found delivery boy:', deliveryBoy.name);
    
    // Test both passwords
    const pass123Match = await bcrypt.compare('Pass123', deliveryBoy.password);
    const delivery123Match = await bcrypt.compare('delivery123', deliveryBoy.password);
    
    console.log('Password "Pass123" match:', pass123Match);
    console.log('Password "delivery123" match:', delivery123Match);
    
    if (pass123Match && !delivery123Match) {
      console.log('\n🔧 Current password is "Pass123", updating to "delivery123"...');
      
      const newHash = await bcrypt.hash('delivery123', 10);
      await User.default.updateOne(
        { _id: deliveryBoy._id },
        { $set: { password: newHash } }
      );
      
      console.log('✅ Password updated to "delivery123"');
      
      // Verify the update
      const updatedUser = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
      const newMatch = await bcrypt.compare('delivery123', updatedUser.password);
      console.log('✅ New password verification:', newMatch);
      
    } else if (delivery123Match) {
      console.log('✅ Password is already "delivery123"');
    } else {
      console.log('❌ Neither password matches. Resetting to "delivery123"...');
      
      const newHash = await bcrypt.hash('delivery123', 10);
      await User.default.updateOne(
        { _id: deliveryBoy._id },
        { $set: { password: newHash } }
      );
      
      console.log('✅ Password reset to "delivery123"');
    }
    
    console.log('\n=== FINAL LOGIN CREDENTIALS ===');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    console.log('Ready to use!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
