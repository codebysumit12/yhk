import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/yhk_database')
  .then(async () => {
    const User = await import('./models/User.js');
    
    console.log('=== CHECKING ALL DELIVERY BOYS ===');
    
    // Find all delivery partners
    const deliveryPartners = await User.default.find({ role: 'delivery_partner' }).select('+password');
    
    console.log('Total delivery partners:', deliveryPartners.length);
    
    for (const partner of deliveryPartners) {
      console.log('\n---');
      console.log('Name:', partner.name);
      console.log('Email:', partner.email);
      console.log('Phone:', partner.phone);
      console.log('Active:', partner.isActive);
      
      // Test both passwords
      const pass123Match = await bcrypt.compare('Pass123', partner.password);
      const delivery123Match = await bcrypt.compare('delivery123', partner.password);
      
      console.log('Password "Pass123" works:', pass123Match);
      console.log('Password "delivery123" works:', delivery123Match);
      
      if (partner.email === 'delivery34@gmail.com') {
        console.log('👈 THIS IS THE TARGET ACCOUNT');
      }
    }
    
    console.log('\n=== RECOMMENDATION ===');
    console.log('Try logging in with the account that accepts "Pass123"');
    console.log('Or use these credentials:');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
