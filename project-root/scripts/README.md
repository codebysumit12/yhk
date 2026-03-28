# 📹 Video Upload Scripts

This folder contains scripts for uploading videos to Cloudinary and storing them as banners in the database.

## 🚀 Quick Start

### Method 1: Quick Upload (Recommended)
```bash
cd project-root
node scripts/quick-video-upload.js
```

This will upload the default video from:
`c:/projects/yhk-main/project-root/frontend/src/customer-view/components/video/foodmp4.mp4`

### Method 2: Custom Upload
```bash
cd project-root
node scripts/upload-hero-video.js [video-path] --title "Your Title" --position "hero" --isActive true
```

## 📋 Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--title` | Banner title | "Hero Background Video - Food MP4" |
| `--description` | Banner description | "Dynamic hero banner video from database" |
| `--position` | Banner position | "hero" |
| `--isActive` | Banner active status | true |
| `--displayOrder` | Display order | 1 |
| `--link` | Click-through link | "" |
| `--linkText` | Link button text | "" |

## 🎯 Examples

### Upload with custom title:
```bash
node scripts/upload-hero-video.js --title "Special Offer Video" --description "Limited time offer"
```

### Upload specific video file:
```bash
node scripts/upload-hero-video.js "C:/videos/my-promo.mp4" --title "My Promo Video"
```

### Upload for menu-hero position:
```bash
node scripts/upload-hero-video.js --position "menu-hero" --title "Menu Background Video"
```

### Upload inactive banner (for later activation):
```bash
node scripts/upload-hero-video.js --isActive false --title "Future Banner"
```

## 📁 Video File Locations

### Default Path:
```
c:/projects/yhk-main/project-root/frontend/src/customer-view/components/video/foodmp4.mp4
```

### Alternative Paths (update as needed):
```
project-root/frontend/src/assets/videos/
project-root/public/videos/
```

## 🔧 Configuration

The scripts use these pre-configured settings:

### Cloudinary:
- **Cloud Name**: dyq3mqury
- **Folder**: yhk-banners
- **Resource Type**: video
- **Auto-thumbnail**: 640x360 JPG

### Database:
- **MongoDB**: yhk_database
- **Collection**: banners
- **Required**: At least one user exists for `uploadedBy` field

## 🎬 Video Requirements

### Supported Formats:
- MP4 (recommended)
- WebM
- MOV
- AVI

### Recommended Specs:
- **Resolution**: 1920x1080 or 1280x720
- **Duration**: 10-60 seconds
- **File Size**: Under 50MB
- **Aspect Ratio**: 16:9

### Thumbnail Generation:
- **Size**: 640x360 pixels
- **Format**: JPG
- **Auto-generated** from video frame

## 🔄 After Upload

1. **Frontend Update**: The video will appear automatically in:
   - Main.jsx hero section
   - Admin banner management

2. **Video URL**: Available in database as `mediaUrl`

3. **Thumbnail**: Auto-generated and stored as `thumbnailUrl`

4. **Streaming**: Optimized for web playback

## 🛠️ Troubleshooting

### "Video file not found"
- Check the file path exists
- Use absolute paths
- Ensure video file is accessible

### "No user found for uploadedBy"
- Create at least one user in the database first
- Check User model has required fields

### "Cloudinary upload failed"
- Check internet connection
- Verify Cloudinary credentials
- Ensure video format is supported

## 📱 Frontend Integration

The uploaded video will automatically appear in:
- **Hero Section**: If position is "hero"
- **Menu Hero**: If position is "menu-hero"
- **Admin Panel**: For management

The frontend logic prioritizes videos over images:
```javascript
const heroVideo = banners.find(b => b.position === 'hero' && b.mediaType === 'video');
const heroImage = banners.find(b => b.position === 'hero' && b.mediaType === 'image');
// Video takes priority
```

## 🎨 Customization

### Modify Upload Options:
Edit `upload-hero-video.js` to change:
- Cloudinary folder
- Thumbnail settings
- Video transformations
- Default banner data

### Add New Positions:
Update `bannerOptions.position` to use new positions like:
- "footer"
- "sidebar"
- "popup"

## 📞 Support

For issues with:
- **Database**: Check MongoDB connection
- **Cloudinary**: Verify API credentials
- **File paths**: Use absolute paths
- **Formats**: Check video compatibility
