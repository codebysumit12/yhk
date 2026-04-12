import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';   // Import once
import paymentRoutes from './routes/paymentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import searchRoutes from './routes/searchRoutes.js'; // NEW - Search routes
import simpleSearchRoutes from './routes/simpleSearchRoutes.js'; // NEW - Simple search routes

// ... rest of the code remains the same ...
import User from './models/User.js';

// Import cleanup script
// import { cleanupTempFiles } from './utils/cleanupTempFiles.js';

// Import all models to sync with MongoDB
import './models/MenuItem.js';
import './models/Category.js';
import './models/Item.js';
import './models/Order.js';
import './models/Reservation.js';
import './models/Review.js';
import './models/Payment.js';
import './models/RestaurantInfo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CREATE UPLOADS DIRECTORY IF IT DOESN'T EXIST
const uploadsDir = path.join(__dirname, '..', 'uploads', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(' Created uploads/temp directory');
}

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3001',
        'https://sumitweb.xyz',
    'https://www.sumitweb.xyz',
    'http://www.sumitweb.xyz',
    /^https:\/\/.*\.netlify\.app$/,
    'http://159.65.144.135'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle JSON parsing with multipart detection
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Skip JSON parsing for multipart requests
    next();
  } else {
    // Parse JSON for non-multipart requests
    express.json({ limit: '50mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files with error handling
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  
  // Check if file exists before serving
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`❌ Upload file not found: ${req.path}`);
      console.log(`❌ Looking for file at: ${filePath}`);
      // Return a placeholder image or 404
      res.status(404).json({ 
        message: 'Upload file not found',
        path: req.path 
      });
      return;
    }
    
    // File exists, serve it
    express.static(path.join(__dirname, 'uploads'))(req, res, next);
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Connect to MongoDB
connectDB();

// ROUTES (Use each route ONCE only) - Updated with Razorpay
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);        
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', searchRoutes); // NEW - Search routes (add after existing routes)
app.use('/api', simpleSearchRoutes); // NEW - Simple search routes (standalone)

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Seed Admin User
const seedAdminUser = async () => {
  try {
    // Wait a bit for MongoDB to be fully connected
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const adminExists = await User.findOne({ email: 'admin@yhk.com' });

    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Admin Manager',
        email: 'admin@yhk.com',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error(' Error seeding admin user:', error);
  }
};

const PORT = process.env.PORT || 50017;

// Start server
app.listen(PORT, async () => {
  console.log(` Server running on port ${PORT}`);
  await seedAdminUser();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Export app for testing
export default app;