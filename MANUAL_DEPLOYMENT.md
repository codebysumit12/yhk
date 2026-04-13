# Manual Deployment to DigitalOcean Droplet

## Issue
The fixes work on localhost but not on the droplet because the backend code changes haven't been deployed to the production server.

## Required Changes to Deploy

### 1. Backend Code Changes
- Updated `models/User.js` - Added `delivery_partner` role
- Updated `routes/orderRoutes.js` - Enhanced order status validation
- Created scripts for database updates

### 2. Frontend Changes
- Updated `netlify.toml` - Added CSP headers for Google OAuth
- Updated `DeliveryBoyApp.jsx` - Fixed reCAPTCHA initialization

## Manual Deployment Steps

### Step 1: Connect to Droplet
```bash
ssh root@your-droplet-ip
```

### Step 2: Update Backend Files
```bash
# Navigate to project directory
cd /var/www/yhk

# Backup current files
cp server.js server.js.backup
cp -r backend backend.backup

# Update User model
# Replace /var/www/yhk/models/User.js with the new version
# The key change is adding 'delivery_partner' to the role enum

# Update order routes
# Replace /var/www/yhk/routes/orderRoutes.js with the new version
# The key change is enhanced validation for delivery partner access

# Install any new dependencies if needed
npm install --force
```

### Step 3: Update Database
```bash
# Run the database update script
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/yhk')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create/update delivery partner
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
    console.log('Delivery partner updated:', delivery.email);
    
    await mongoose.disconnect();
    console.log('Database updated successfully');
  })
  .catch(err => {
    console.error('Database update error:', err);
    process.exit(1);
  });
"
```

### Step 4: Restart Services
```bash
# Restart backend service
pm2 restart yhk-backend

# Or if not using pm2:
pm2 start server.js --name yhk-backend

# Restart nginx
sudo systemctl reload nginx
```

### Step 5: Update Frontend (Netlify)
The frontend changes are already configured in `netlify.toml`. You need to:
1. Push the changes to your Git repository
2. Netlify will automatically deploy with the new CSP headers

## Files to Copy from Local to Droplet

### Backend Files:
- `project-root/models/User.js`
- `project-root/routes/orderRoutes.js`
- `project-root/server.js` (if modified)

### Frontend Files:
- `netlify.toml` (deployed via Git)
- `project-root/frontend/src/admin-view/pages/DeliveryBoyApp.jsx` (deployed via Git)

## Verification

After deployment, test the delivery functionality:

1. Login as delivery partner:
   - Email: `delivery@yhk.com`
   - Password: `delivery123`

2. Try to mark an order as delivered
3. Check that the 401 error is resolved
4. Verify Google OAuth works without CSP violations

## Troubleshooting

If issues persist:
1. Check droplet logs: `pm2 logs yhk-backend`
2. Verify database connection: `mongo --eval "db.users.find()"`
3. Check nginx configuration: `sudo nginx -t`
4. Restart all services: `sudo systemctl restart nginx && pm2 restart all`
