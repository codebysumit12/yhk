import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('=== CHECKING DELIVERY PRATAP PASSWORD IN CLOUD DB ===');
    
    const deliveryPratap = await User.default.findOne({ 
      email: 'deliverypratap@gmail.com' 
    }).select('+password');
    
    if (deliveryPratap) {
      console.log('✅ Found delivery pratap');
      console.log('Password exists:', !!deliveryPratap.password);
      
      // Test common passwords
      const testPasswords = ['delivery123', 'Pass123', 'password', '123456'];
      
      for (const pwd of testPasswords) {
        const isMatch = await bcrypt.compare(pwd, deliveryPratap.password);
        if (isMatch) {
          console.log(`✅ Password found: ${pwd}`);
          console.log('\n=== LOGIN CREDENTIALS ===');
          console.log('Email: deliverypratap@gmail.com');
          console.log('Password:', pwd);
          console.log('Should work now!');
          process.exit(0);
        }
      }
      
      console.log('❌ No common passwords match');
      console.log('Setting password to "delivery123"...');
      
      const newHash = await bcrypt.hash('delivery123', 10);
      await User.default.updateOne(
        { _id: deliveryPratap._id },
        { $set: { password: newHash } }
      );
      
      console.log('✅ Password updated to "delivery123"');
      console.log('\n=== LOGIN CREDENTIALS ===');
      console.log('Email: deliverypratap@gmail.com');
      console.log('Password: delivery123');
      
    } else {
      console.log('❌ Delivery pratap not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
