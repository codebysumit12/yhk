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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// ROUTES (Use each route ONCE only)
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);        
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/banners', bannerRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Seed Admin User
const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@yhk.com' });

    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Admin Manager',
        email: 'admin@yhk.com',
        password: 'admin123',
        isAdmin: true
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdminUser();
});