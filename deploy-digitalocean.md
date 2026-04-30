# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- Git installed
- Node.js (v18+) installed locally
- MongoDB Atlas account (for database)

## 1. Setup DigitalOcean Droplet

```bash
# Create Ubuntu 22.04 Droplet with at least 2GB RAM
# Connect to your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y
```

## 2. Backend Deployment

```bash
# Clone your repository
git clone https://github.com/yourusername/yhk-restaurant.git
cd yhk-restaurant

# Navigate to backend
cd backend

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env
```

**Environment Variables (.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=https://yourdomain.com
```

```bash
# Start backend with PM2
pm2 start server.js --name "yhk-backend"

# Save PM2 process
pm2 save
pm2 startup
```

## 3. Frontend Deployment

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build the React app
npm run build

# Copy build files to Nginx
cp -r build/* /var/www/html/
```

## 4. Nginx Configuration

```bash
# Create Nginx config file
nano /etc/nginx/sites-available/yhk-restaurant

# Add the following configuration:
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/yhk-restaurant /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
```

## 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 6. Firewall Setup

```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

## 7. Deployment Commands Summary

### Initial Setup:
```bash
# Connect to server
ssh root@your_droplet_ip

# System setup
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs npm nginx git
npm install -g pm2

# Clone and setup
git clone https://github.com/yourusername/yhk-restaurant.git
cd yhk-restaurant
```

### Backend Commands:
```bash
cd backend
npm install --production
nano .env  # Add your environment variables
pm2 start server.js --name "yhk-backend"
pm2 save
pm2 startup
```

### Frontend Commands:
```bash
cd ../frontend
npm install
npm run build
cp -r build/* /var/www/html/
```

### Nginx Commands:
```bash
# Configure
nano /etc/nginx/sites-available/yhk-restaurant
ln -s /etc/nginx/sites-available/yhk-restaurant /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. Update Deployment

```bash
# Pull latest changes
cd /root/yhk-restaurant
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart yhk-backend

# Update frontend
cd ../frontend
npm install
npm run build
cp -r build/* /var/www/html/

# Restart Nginx if needed
systemctl restart nginx
```

## 9. Monitoring Commands

```bash
# Check PM2 processes
pm2 status

# Check PM2 logs
pm2 logs yhk-backend

# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 10. Troubleshooting

```bash
# Restart backend
pm2 restart yhk-backend

# Restart Nginx
systemctl restart nginx

# Check ports
netstat -tulpn | grep :80
netstat -tulpn | grep :443
netstat -tulpn | grep :5000

# Check disk space
df -h

# Check memory
free -h
```

## Important Notes:

1. **Replace `yourdomain.com` with your actual domain**
2. **Update MongoDB URI with your Atlas connection string**
3. **Set up proper environment variables for security**
4. **Regularly backup your database**
5. **Monitor server resources and logs**
6. **Keep dependencies updated**

## Domain & DNS Setup:

1. Go to your domain registrar
2. Add A record: `@` → `your_droplet_ip`
3. Add A record: `www` → `your_droplet_ip`
4. Wait for DNS propagation (usually 1-24 hours)

## Cost Optimization:

- Start with $6/month droplet (2GB RAM, 1 vCPU, 50GB SSD)
- Scale up as traffic increases
- Use MongoDB Atlas free tier initially
- Monitor resource usage regularly
