import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import Banner from '../backend/models/Banner.js';
import User from '../backend/models/User.js';

// Cloudinary config
cloudinary.config({
  cloud_name: 'dyq3mqury',
  api_key: '842329713383541',
  api_secret: 'mArYbsZMXp_IpARHBWCcieToiLo',
  secure: true
});

// DB connect
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('MongoDB Connected for banner upload');
  } catch (error) {
    console.error('DB Error:', error.message);
    process.exit(1);
  }
};

const uploadVideo = async (videoPath, bannerOptions = {}) => {
  await connectDB();

  // Default video path if not provided
  const defaultVideoPath = 'c:/projects/yhk-main/project-root/frontend/src/customer-view/components/video/foodmp4.mp4';
  const finalVideoPath = videoPath || defaultVideoPath;
  
  if (!fs.existsSync(finalVideoPath)) {
    console.error('Video file not found:', finalVideoPath);
    console.log('Please ensure the video file exists at the specified path');
    process.exit(1);
  }

  try {
    console.log('🎬 Uploading video to Cloudinary...');
    console.log('📁 File path:', finalVideoPath);
    
    // Upload options for video with thumbnail
    const uploadOptions = {
      folder: 'yhk-banners',
      resource_type: 'video',
      eager: [
        { 
          width: 640, 
          height: 360, 
          crop: 'pad', 
          format: 'jpg',
          background: 'auto'
        }
      ]
    };

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      
      const fileStream = fs.createReadStream(finalVideoPath);
      fileStream.pipe(stream);
    });

    console.log('✅ Cloudinary upload success:', uploadResult.public_id);
    console.log('📹 Video info:', {
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      size: uploadResult.bytes,
      format: uploadResult.format
    });
    
    // Find an admin user for uploadedBy (required)
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne({ isAdmin: true }) || await User.findOne();
    if (!adminUser) {
      console.error('❌ No user found for uploadedBy field');
      console.log('💡 Please create at least one user in the database first');
      return;
    }

    // Banner data with defaults and overrides
    const bannerData = {
      title: bannerOptions.title || "Hero Background Video - Food MP4",
      description: bannerOptions.description || "Dynamic hero banner video from database",
      mediaType: 'video',
      mediaUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      thumbnailUrl: uploadResult.eager[0]?.secure_url,
      position: bannerOptions.position || 'hero',
      isActive: bannerOptions.isActive !== undefined ? bannerOptions.isActive : true,
      displayOrder: bannerOptions.displayOrder || 1,
      link: bannerOptions.link || '',
      linkText: bannerOptions.linkText || '',
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height
      },
      fileSize: uploadResult.bytes,
      duration: uploadResult.duration,
      uploadedBy: adminUser._id
    };

    const banner = await Banner.create(bannerData);
    console.log('🎯 Banner created successfully:', banner._id);
    console.log('🌐 Media URL:', banner.mediaUrl);
    console.log('🖼️ Thumbnail URL:', banner.thumbnailUrl);
    console.log('🎬 Streaming URL:', cloudinary.url(banner.cloudinaryId, {
      resource_type: 'video', 
      transformation: ['fl_video', 'q_auto', 'f_auto', 'vc_h264']
    }).secure_url);
    console.log('🔄 Frontend will now show this video as hero background! Refresh Main.jsx page.');
    
    return banner;

  } catch (error) {
    console.error('❌ Upload/Create error:', error.message);
    throw error;
  } finally {
    mongoose.connection.close();
  }
};

// Export for use as module
export { uploadVideo };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  const videoPath = args[0]; // First argument: video path
  
  // Parse banner options from command line
  const bannerOptions = {};
  for (let i = 1; i < args.length; i += 2) {
    if (args[i] && args[i + 1]) {
      const key = args[i].replace('--', '');
      const value = args[i + 1];
      
      // Convert string values to appropriate types
      if (key === 'isActive') bannerOptions[key] = value === 'true';
      else if (key === 'displayOrder') bannerOptions[key] = parseInt(value);
      else bannerOptions[key] = value;
    }
  }
  
  console.log('🚀 Starting video upload with options:', bannerOptions);
  uploadVideo(videoPath, bannerOptions).catch(console.error);
}

export default uploadVideo;
