#!/bin/bash

# Deployment script for DigitalOcean Droplet
# Usage: ./deploy-to-droplet.sh

echo "=== Deploying to DigitalOcean Droplet ==="

# Configuration
DROPLET_IP="your-droplet-ip"  # Replace with actual droplet IP
DROPLET_USER="root"
DROPLET_PATH="/var/www/yhk"

echo "1. Building frontend..."
cd project-root/frontend
npm ci --force
npm run build

echo "2. Preparing backend files..."
cd ../..
cp -r project-root/backend ./deployment-backend/
cp server.js ./deployment-backend/
cp package.json ./deployment-backend/
cp .env.example ./deployment-backend/.env

echo "3. Creating deployment package..."
tar -czf yhk-deployment.tar.gz deployment-backend/ project-root/frontend/build/

echo "4. Uploading to droplet..."
scp yhk-deployment.tar.gz ${DROPLET_USER}@${DROPLET_IP}:/tmp/

echo "5. Deploying on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
    # Stop existing services
    pm2 stop yhk-backend || true
    pm2 delete yhk-backend || true
    
    # Extract new deployment
    cd /tmp
    tar -xzf yhk-deployment.tar.gz
    
    # Update backend files
    sudo rm -rf /var/www/yhk/backend
    sudo mkdir -p /var/www/yhk
    sudo cp -r deployment-backend/* /var/www/yhk/
    
    # Update frontend files
    sudo rm -rf /var/www/yhk/frontend
    sudo cp -r project-root/frontend/build /var/www/yhk/frontend
    
    # Install dependencies
    cd /var/www/yhk
    sudo npm install --force
    
    # Update database with new roles
    cd /var/www/yhk
    node -e "
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    mongoose.connect('mongodb://localhost:27017/yhk')
      .then(async () => {
        console.log('Connected to MongoDB');
        
        // Update User schema to include delivery_partner
        const userSchema = User.schema;
        if (!userSchema.paths.role.enumValues.includes('delivery_partner')) {
          userSchema.paths.role.enumValues.push('delivery_partner');
          console.log('Added delivery_partner to role enum');
        }
        
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
    
    # Start backend service
    cd /var/www/yhk
    pm2 start server.js --name yhk-backend
    
    # Restart nginx
    sudo systemctl reload nginx
    
    echo "Deployment completed successfully"
EOF

echo "6. Cleaning up local files..."
rm -rf deployment-backend/
rm yhk-deployment.tar.gz

echo "=== Deployment Complete ==="
echo "Frontend: https://sumitweb.xyz"
echo "Backend API: https://sumitweb.xyz/api"
