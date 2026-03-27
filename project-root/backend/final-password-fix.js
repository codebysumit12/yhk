import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('Updating delivery boy password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('delivery123', 10);
    
    // Update using updateOne with select: false workaround
    const result = await User.default.updateOne(
      { phone: '9370330486' },
      { 
        $set: { 
          password: hashedPassword,
          isActive: true
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Verify with select: true
    const user = await User.default.findOne({ phone: '9370330486' }).select('+password');
    if (user) {
      console.log('✅ User found with password:', !!user.password);
      
      // Test the password
      const isValid = await bcrypt.compare('delivery123', user.password);
      console.log('✅ Password verification:', isValid);
    }
    
    console.log('\n=== LOGIN READY ===');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    console.log('The delivery boy should now be able to login and see orders!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
