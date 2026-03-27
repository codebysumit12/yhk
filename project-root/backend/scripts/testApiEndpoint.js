import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test the API endpoint directly
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🌐 TESTING API ENDPOINT DIRECTLY');
  console.log('==================================');
  
  try {
    // Import the controller function
    const { getItems } = await import('./controllers/itemController.js');
    
    // Mock request and response objects
    const mockReq = {
      query: {
        isAvailable: 'true',
        _t: Date.now()
      }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ API Response:');
        console.log(JSON.stringify(data, null, 2));
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, data);
          return data;
        }
      })
    };
    
    // Call the controller
    await getItems(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Controller error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  mongoose.disconnect();
}).catch(console.error);
