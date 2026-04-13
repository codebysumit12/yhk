# Quick Fix for 401 "Admin access required" Error

## Immediate Fix (2 minutes)

The 401 error is because the droplet backend doesn't recognize the `delivery_partner` role. Here's the fastest fix:

### 1. SSH into Droplet
```bash
ssh root@your-droplet-ip
```

### 2. Quick Fix - Just Add the Role
```bash
cd /var/www/yhk

# Backup current User model
sudo cp models/User.js models/User.js.backup

# Quick edit to add delivery_partner role
sudo sed -i "s/enum: \['customer', 'admin', 'restaurant'\]/enum: ['customer', 'admin', 'restaurant', 'delivery_partner']/" models/User.js
```

### 3. Create Delivery Partner User
```bash
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/yhk')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const delivery = await User.findOneAndUpdate(
      { email: 'delivery@yhk.com' },
      { 
        role: 'delivery_partner',
        name: 'Test Delivery Partner',
        phone: '9876543210',
        isActive: true,
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('Delivery partner created:', delivery.email, 'Role:', delivery.role);
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
"
```

### 4. Restart Backend
```bash
pm2 restart yhk-backend
pm2 status
```

### 5. Test Immediately
Try the delivery functionality again with:
- Email: `delivery@yhk.com`
- Password: `delivery123`

This should fix the 401 error. The other console errors (reCAPTCHA, CSP) are less critical and can be fixed after the main functionality works.

## If Still Getting 401 Error

Check what role the user actually has:
```bash
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/yhk')
  .then(async () => {
    const user = await User.findOne({ email: 'delivery@yhk.com' });
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Role:', user?.role);
    console.log('Email:', user?.email);
    await mongoose.disconnect();
  })
  .catch(err => console.error('Error:', err));
"
```
