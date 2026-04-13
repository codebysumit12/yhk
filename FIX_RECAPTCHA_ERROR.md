# Fix reCAPTCHA Enterprise Error

## Issue
"Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification."

## Quick Fix (1 minute)

The issue is in the DeliveryBoyApp.jsx reCAPTCHA initialization. The droplet needs the updated frontend code.

### 1. Build and Deploy Frontend
```bash
# On your local machine
cd project-root/frontend
npm ci --force
npm run build

# Upload to droplet
scp -r build/* root@your-droplet-ip:/tmp/frontend-new/
```

### 2. Update Frontend on Droplet
```bash
ssh root@your-droplet-ip
cd /var/www/yhk
sudo rm -rf frontend
sudo mkdir -p frontend
sudo cp -r /tmp/frontend-new/* frontend/
sudo systemctl reload nginx
```

### 3. Alternative Quick Fix (If build fails)
If you can't build the frontend right now, the reCAPTCHA error is not critical - the OTP functionality will still work with v2 verification. The main issue is the 401 error which should be fixed first.

## What the Fix Does
The updated DeliveryBoyApp.jsx has:
- Proper RecaptchaVerifier parameter format
- Better error handling
- Improved callback functions

The reCAPTCHA will fall back to v2 automatically if Enterprise fails, so functionality remains intact.
