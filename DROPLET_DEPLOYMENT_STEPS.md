# Droplet Deployment Steps (Frontend + Backend)

## Issue
Both frontend and backend need to be updated on the droplet since you're not using Netlify

## Quick Manual Deployment (10 minutes)

### 1. SSH into Droplet
```bash
ssh root@your-droplet-ip
```

### 2. Update Backend Files

#### Update User Model
```bash
cd /var/www/yhk
sudo nano models/User.js
```

Find the role enum and add 'delivery_partner':
```javascript
role: {
  type: String,
  enum: ['customer', 'admin', 'restaurant', 'delivery_partner'],
  default: 'customer'
},
```
Save: Ctrl+X, Y, Enter

#### Update Order Routes
```bash
sudo nano backend/routes/orderRoutes.js
```

Replace the status route with enhanced validation (around line 75):
```javascript
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    // Admin can always update status
    if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
      return next();
    }
    
    // Delivery partners can only update status if they're assigned to the order
    if (req.user && req.user.role === 'delivery_partner') {
      const Order = require('../models/Order.js');
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Check if this delivery partner is assigned to this order
      const assignedDeliveryBoyId = order.delivery?.deliveryPerson?.id;
      if (!assignedDeliveryBoyId || assignedDeliveryBoyId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You can only update status for orders assigned to you'
        });
      }
      
      return next();
    }
    
    // If neither admin nor delivery partner, deny access
    res.status(401).json({
      success: false,
      error: 'Admin or delivery partner access required'
    });
  } catch (error) {
    console.error('Error in order status middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Server error validating access'
    });
  }
}, updateOrderStatus);
```
Save: Ctrl+X, Y, Enter

### 3. Update Frontend Build

#### Build Frontend Locally First
```bash
# On your local machine
cd project-root/frontend
npm ci --force
npm run build
```

#### Upload to Droplet
```bash
# From your local machine
scp -r build/* root@your-droplet-ip:/tmp/frontend-build/
```

#### Update Frontend on Droplet
```bash
# On droplet
cd /var/www/yhk
sudo rm -rf frontend
sudo mkdir -p frontend
sudo cp -r /tmp/frontend-build/* frontend/
```

### 4. Create Delivery Partner User
```bash
cd /var/www/yhk
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
    console.log('Delivery partner created:', delivery.email);
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
"
```

### 5. Restart All Services
```bash
# Restart backend
pm2 restart yhk-backend
pm2 status

# Restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
```

### 6. Test Everything
Login with delivery partner:
- Email: `delivery@yhk.com`
- Password: `delivery123`

Test:
- Can access delivery dashboard
- Can view assigned orders
- Can mark order as "out for delivery"
- Can mark order as "delivered" (should work without 401 error)

## Expected Results
- No more 401 "Admin access required" errors
- Delivery boy can update order status
- Google OAuth works without CSP violations
- reCAPTCHA works properly

## Troubleshooting
If issues persist:
```bash
# Check backend logs
pm2 logs yhk-backend

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify database connection
mongo --eval "db.users.find({email: 'delivery@yhk.com'})"

# Restart everything
sudo systemctl restart nginx && pm2 restart all
```
