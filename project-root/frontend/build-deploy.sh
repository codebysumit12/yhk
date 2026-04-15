#!/bin/bash
echo "Building and deploying frontend with MSG91..."

# Navigate to frontend directory
cd /var/www/yhk/project-root/frontend

# Build frontend
echo "Building frontend..."
npm run build

# Copy to backend
echo "Copying build to backend..."
cp -r build/* ../backend/build/

# Restart backend
echo "Restarting backend..."
pm2 restart yhk-backend

echo "Deployment complete!"
