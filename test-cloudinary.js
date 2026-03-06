import cloudinary from './project-root/backend/config/cloudinary.js';

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test by getting account info
    const result = await cloudinary.api.resource('test', { resource_type: 'image' });
    console.log('Cloudinary connection successful!');
    console.log('Account info:', result);
  } catch (error) {
    console.log('Cloudinary connection test failed:', error.message);
    
    // Try a simpler test - just check if config is valid
    try {
      const config = cloudinary.config();
      console.log('Cloudinary config loaded:');
      console.log('Cloud Name:', config.cloud_name);
      console.log('API Key:', config.api_key ? 'Set' : 'Not set');
      console.log('API Secret:', config.api_secret ? 'Set' : 'Not set');
      console.log('Secure:', config.secure);
      
      if (config.cloud_name && config.api_key && config.api_secret) {
        console.log('✅ Cloudinary configuration appears valid');
      } else {
        console.log('❌ Cloudinary configuration is incomplete');
      }
    } catch (configError) {
      console.error('Error accessing Cloudinary config:', configError.message);
    }
  }
};

testCloudinary();
