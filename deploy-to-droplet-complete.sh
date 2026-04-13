#!/bin/bash

# Complete deployment to DigitalOcean Droplet (Frontend + Backend)
echo "=== Complete Droplet Deployment ==="

# Configuration - UPDATE THESE VALUES
DROPLET_IP="YOUR_DROPLET_IP_HERE"  # <-- Replace with actual droplet IP
DROPLET_USER="root"
DROPLET_PATH="/var/www/yhk"

if [ "$DROPLET_IP" = "YOUR_DROPLET_IP_HERE" ]; then
    echo "ERROR: Please update DROPLET_IP in this script"
    exit 1
fi

echo "Droplet IP: $DROPLET_IP"

# 1. Build frontend locally
echo "1. Building frontend..."
cd project-root/frontend
npm ci --force
npm run build

# 2. Create deployment package
echo "2. Creating deployment package..."
cd ../..
mkdir -p temp-deploy

# Backend files
cp models/User.js temp-deploy/
cp backend/routes/orderRoutes.js temp-deploy/
cp scripts/setupDeliveryPartner.js temp-deploy/

# Frontend build
cp -r project-root/frontend/build temp-deploy/frontend-build

# Database update script
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
    
    await mongoose.disconnect();
    console.log('Database update completed');
  } catch (error) {
    console.error('Database update error:', error);
    process.exit(1);
  }
};

updateDatabase();
EOF

# Deployment script for droplet
cat > temp-deploy/deploy.sh << 'EOF'
#!/bin/bash
echo "=== Deploying on Droplet ==="

cd /var/www/yhk

# Stop backend services
pm2 stop yhk-backend || true
pm2 delete yhk-backend || true

# Backup current files
echo "Creating backups..."
cp models/User.js models/User.js.backup
cp backend/routes/orderRoutes.js backend/routes/orderRoutes.js.backup
cp -r frontend frontend.backup || true

# Update backend files
echo "Updating backend files..."
cp User.js models/
cp orderRoutes.js backend/routes/
cp update-database.js ./

# Update frontend build
echo "Updating frontend..."
rm -rf frontend
cp -r frontend-build frontend

# Update database
echo "Updating database..."
node update-database.js

# Restart services
echo "Restarting services..."
pm2 start server.js --name yhk-backend

# Restart nginx
sudo systemctl reload nginx

# Verify services
sleep 3
echo "Backend status:"
pm2 status
echo "Nginx status:"
sudo systemctl status nginx --no-pager

echo "=== Deployment Complete ==="
EOF

# 3. Copy files to droplet
echo "3. Copying files to droplet..."
scp -r temp-deploy/* ${DROPLET_USER}@${DROPLET_IP}:/tmp/

# 4. Execute deployment on droplet
echo "4. Executing deployment on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
cd /tmp
chmod +x deploy.sh
sudo ./deploy.sh
EOF

# 5. Clean up
echo "5. Cleaning up..."
rm -rf temp-deploy

echo "=== Complete Deployment Finished ==="
echo "Frontend: https://sumitweb.xyz"
echo "Backend API: https://sumitweb.xyz/api"
echo ""
echo "Test with delivery partner:"
echo "Email: delivery@yhk.com"
echo "Password: delivery123"
