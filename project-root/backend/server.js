import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

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






import User from './models/User.js';

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

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'https://yhk-66ta.onrender.com', /^https:\/\/.*\.netlify\.app$/],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Connect to MongoDB
connectDB();

// ROUTES (Use each route ONCE only)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);        
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/banners', bannerRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

// Serve frontend for all non-API routes (MUST be last)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../frontend/build/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log('Frontend build not found, serving API response');
      res.status(404).json({ 
        message: 'Frontend not built yet. API is running.',
        status: 'API_AVAILABLE'
      });
    }
  });
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
    console.error('❌ Error seeding admin user:', error);
  }
};

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdminUser();
});