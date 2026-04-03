# Google OAuth Setup for Local Development

## Steps to Fix Origin Mismatch Error:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (the one with the existing Client ID)
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID**: 579329797638-hd52etnj43u7camu9qrh8ev8i53imukp.apps.googleusercontent.com
5. **Click "Edit" button**
6. **Under "Authorized JavaScript origins"**, add these URLs:
   - http://localhost:3001
   - http://localhost:3000
   - https://localhost:3001
   - https://localhost:3000
7. **Click "Save"**
8. **Wait 2-3 minutes** for changes to propagate
9. **Test the Google OAuth again**

## Alternative: Create New Development Client ID

If you prefer to keep production separate:
1. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
2. Select "Web application"
3. Name: "YHK Development"
4. Add localhost origins as above
5. Use the new Client ID for development

## Current Client ID in Use:
579329797638-hd52etnj43u7camu9qrh8ev8i53imukp.apps.googleusercontent.com
