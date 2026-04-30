#!/bin/bash

# Complete Deployment Script for YHK Restaurant
# Usage: ./deploy.sh [digitalocean_ip]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting YHK Restaurant Deployment${NC}"

# Check if DigitalOcean IP is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide DigitalOcean IP address${NC}"
    echo -e "${YELLOW}Usage: ./deploy.sh <digitalocean_ip>${NC}"
    exit 1
fi

DO_IP=$1
REPO_URL="https://github.com/codebysumit12/yhk.git"

echo -e "${GREEN}📦 Step 1: Starting Local Server${NC}"

# Start local server in background
echo "Starting backend server..."
cd backend
npm start &
LOCAL_PID=$!
echo "Local server started with PID: $LOCAL_PID"

# Wait a moment for server to start
sleep 3

# Test local server
echo "Testing local server..."
curl -f http://localhost:5000/api/health || echo "Local server may not be ready yet"

echo -e "${GREEN}🔗 Step 2: Connecting to DigitalOcean${NC}"

# Connect to DigitalOcean and setup
ssh root@$DO_IP << 'EOF'
set -e

echo "🔧 Setting up DigitalOcean server..."

# Update system
apt update && apt upgrade -y

# Install Node.js if not exists
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Install Nginx if not exists
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt install nginx -y
fi

# Install Git if not exists
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    apt install git -y
fi

echo "✅ Server setup complete"

echo "📥 Cloning repository..."
cd /root
if [ -d "yhk" ]; then
    echo "Repository exists, pulling latest changes..."
    cd yhk
    git pull origin master
else
    echo "Cloning fresh repository..."
    git clone $REPO_URL yhk
    cd yhk
fi

echo "🔧 Setting up backend..."
cd backend

# Install dependencies
npm install --production

# Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << ENVEOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=https://yourdomain.com
ENVEOF
    echo "⚠️  Please update .env file with your actual credentials"
fi

# Stop existing process if running
pm2 stop yhk-backend || true
pm2 delete yhk-backend || true

# Start backend with PM2
pm2 start server.js --name "yhk-backend"
pm2 save
pm2 startup

echo "🎨 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

# Build React app
npm run build

# Copy to Nginx
mkdir -p /var/www/html
rm -rf /var/www/html/*
cp -r build/* /var/www/html/

echo "⚙️  Configuring Nginx..."

# Create Nginx config
cat > /etc/nginx/sites-available/yhk << NGINXEOF
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/yhk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

echo "🔒 Setting up firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "🔐 Installing SSL..."
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (non-interactive)
certbot --nginx --non-interactive --agree-tos --email admin@yourdomain.com -d yourdomain.com || echo "⚠️  SSL setup skipped - please configure manually"

echo "🎉 Deployment complete!"

echo "📊 Server Status:"
pm2 status
systemctl status nginx --no-pager

echo "🌐 Server Information:"
echo "Backend API: http://$DO_IP/api/"
echo "Frontend: http://$DO_IP/"
echo "SSH: ssh root@$DO_IP"

EOF

echo -e "${GREEN}🔗 Step 3: Testing Deployment${NC}"

# Wait for deployment to complete
sleep 10

# Test deployment
echo "Testing DigitalOcean deployment..."
curl -f http://$DO_IP/api/health || echo "⚠️  Backend may not be ready yet"

echo -e "${GREEN}🎯 Deployment Summary${NC}"
echo "✅ Local server running on http://localhost:5000"
echo "✅ Code deployed to DigitalOcean: http://$DO_IP"
echo "✅ GitHub repository: $REPO_URL"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update .env file on DigitalOcean with your actual credentials"
echo "2. Configure your domain DNS to point to $DO_IP"
echo "3. Update SSL certificate with your actual domain"
echo "4. Monitor server with: pm2 logs yhk-backend"

# Clean up local server if needed
echo -e "${YELLOW}🛑 Local server PID: $LOCAL_PID${NC}"
echo "To stop local server: kill $LOCAL_PID"

echo -e "${GREEN}✨ Deployment Complete!${NC}"
