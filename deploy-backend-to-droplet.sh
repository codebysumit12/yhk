#!/bin/bash

# Quick backend deployment to DigitalOcean Droplet
echo "=== Deploying Backend Fixes to Droplet ==="

# Configuration - UPDATE THESE VALUES
DROPLET_IP="YOUR_DROPLET_IP_HERE"  # <-- Replace with actual droplet IP
DROPLET_USER="root"
DROPLET_PATH="/var/www/yhk"

if [ "$DROPLET_IP" = "YOUR_DROPLET_IP_HERE" ]; then
    echo "ERROR: Please update DROPLET_IP in this script"
    exit 1
fi

echo "Droplet IP: $DROPLET_IP"

# Create temporary deployment package
echo "1. Creating deployment package..."
mkdir -p temp-deploy
cp models/User.js temp-deploy/
cp backend/routes/orderRoutes.js temp-deploy/
cp scripts/setupDeliveryPartner.js temp-deploy/
cp server.js temp-deploy/  # In case server.js was modified

# Add database update script
cat > temp-deploy/update-database.js << 'EOF'
const mongoose = require('mongoose');
const User = require('./models/User');

const updateDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/yhk');
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
    console.log('Delivery partner created/updated:', delivery.email);
    
    // Check if role exists in enum
    const userSchema = User.schema;
    const roles = userSchema.paths.role.enumValues;
    if (!roles.includes('delivery_partner')) {
      console.log('Note: delivery_partner role needs to be added to User model enum');
    }
    
    console.log('Database update completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database update error:', error);
    process.exit(1);
  }
};

updateDatabase();
EOF

# Create deployment script for droplet
cat > temp-deploy/deploy.sh << 'EOF'
#!/bin/bash
echo "=== Deploying on Droplet ==="

# Stop services
pm2 stop yhk-backend || true
pm2 delete yhk-backend || true

# Backup current files
cd /var/www/yhk
cp models/User.js models/User.js.backup
cp backend/routes/orderRoutes.js backend/routes/orderRoutes.js.backup

# Update files (these will be copied from temp directory)
echo "Updating backend files..."

# Run database update
echo "Updating database..."
node update-database.js

# Restart services
echo "Restarting services..."
pm2 start server.js --name yhk-backend

# Verify service is running
sleep 3
pm2 status

echo "=== Deployment Complete ==="
EOF

# Copy files to droplet
echo "2. Copying files to droplet..."
scp -r temp-deploy/* ${DROPLET_USER}@${DROPLET_IP}:/tmp/

# Execute deployment on droplet
echo "3. Executing deployment on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
cd /tmp
chmod +x deploy.sh
# Copy files to correct locations
sudo cp User.js /var/www/yhk/models/
sudo cp orderRoutes.js /var/www/yhk/backend/routes/
sudo cp update-database.js /var/www/yhk/
sudo cp deploy.sh /var/www/yhk/
cd /var/www/yhk
sudo ./deploy.sh
EOF

# Clean up
echo "4. Cleaning up..."
rm -rf temp-deploy

echo "=== Backend Deployment Complete ==="
echo "Test the delivery functionality now!"
