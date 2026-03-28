import { uploadVideo } from './upload-hero-video.js';

// Quick upload with default settings
const quickUpload = async () => {
  try {
    console.log('🚀 Quick video upload - using default foodmp4.mp4');
    
    const banner = await uploadVideo(null, {
      title: "Hero Food Video - Quick Upload",
      description: "Appetizing food video for hero banner",
      position: 'hero',
      isActive: true
    });
    
    console.log('🎉 Upload completed successfully!');
    console.log('📱 Refresh your frontend to see the video banner');
    
  } catch (error) {
    console.error('❌ Quick upload failed:', error.message);
  }
};

quickUpload();
