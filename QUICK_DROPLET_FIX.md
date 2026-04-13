# Quick Fix for Droplet Backend

## Issue
Frontend is updated (via Git push) but droplet backend still returns "Admin access required"

## Quick Manual Fix (5 minutes)

### 1. SSH into Droplet
```bash
ssh root@your-droplet-ip
```

### 2. Update User Model
```bash
cd /var/www/yhk
sudo nano models/User.js
```

Find the role enum (around line 41):
```javascript
role: {
  type: String,
  enum: ['customer', 'admin', 'restaurant'],  // <-- ADD delivery_partner
  default: 'customer'
},
```

Change to:
```javascript
role: {
  type: String,
  enum: ['customer', 'admin', 'restaurant', 'delivery_partner'],
  default: 'customer'
},
```

Save: Ctrl+X, Y, Enter

### 3. Update Order Routes
```bash
sudo nano backend/routes/orderRoutes.js
```

Find the status route (around line 75):
```javascript
router.put('/:id/status', protect, (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true || req.user.role === 'delivery_partner')) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Admin or delivery partner access required'
    });
  }
}, updateOrderStatus);
```

Replace with the enhanced validation:
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

### 4. Create Delivery Partner User
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
    console.log('Delivery partner created:', delivery.email);
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
"
```

### 5. Restart Backend
```bash
pm2 restart yhk-backend
pm2 status
```

### 6. Test
Login with:
- Email: `delivery@yhk.com`
- Password: `delivery123`

Try marking an order as delivered - should work now!

## Expected Result
- No more 401 "Admin access required" error
- Delivery boy can update order status
- All functionality works like localhost
