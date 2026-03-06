import cloudinary from './config/cloudinary.js';

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test API access
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test upload (optional)
    console.log('Cloudinary is ready for uploads!');
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
  }
};

testCloudinary();
