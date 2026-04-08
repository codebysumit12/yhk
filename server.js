import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import auth controller with nodemailer fix
import { register, login, getMe, updateProfile, logout, handleDropdownClick } from './controllers/authController.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://yhk-66ta.onrender.com',
    'https://sumitweb.xyz',
    'https://www.sumitweb.xyz',
    /^https:\/\/.*\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Connect to MongoDB
connectDB();

// Mock data for frontend
const mockBanners = [
  {
    _id: '1',
    title: 'Welcome to Yashwanth\'s Healthy Kitchen',
    subtitle: 'Fresh, Healthy, Delicious',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    position: 'hero',
    isActive: true,
    createdAt: new Date()
  }
];

const mockCategories = [
  {
    _id: '1',
    name: 'Starters',
    description: 'Fresh appetizers to begin your meal',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    isActive: true,
    order: 1
  },
  {
    _id: '2',
    name: 'Main Course',
    description: 'Hearty and satisfying main dishes',
    image: 'https://images.unsplash.com/photo-1546833999-b03f31985c5e?w=400',
    isActive: true,
    order: 2
  },
  {
    _id: '3',
    name: 'Desserts',
    description: 'Sweet endings to your meal',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    isActive: true,
    order: 3
  },
  {
    _id: '4',
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    isActive: true,
    order: 4
  }
];

const mockItems = [
  {
    _id: '1',
    name: 'Garden Fresh Salad',
    description: 'Mixed greens with seasonal vegetables',
    price: 8.99,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    preparationTime: 10,
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    _id: '2',
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken with herbs',
    price: 15.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b03f31985c5e?w=400',
    isAvailable: true,
    isPopular: true,
    isFeatured: false,
    preparationTime: 25,
    dietary: ['non-vegetarian']
  },
  {
    _id: '3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with ganache',
    price: 6.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928311d6c7?w=400',
    isAvailable: true,
    isPopular: false,
    isFeatured: true,
    preparationTime: 5,
    dietary: ['vegetarian']
  },
  {
    _id: '4',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    isAvailable: true,
    isPopular: true,
    isFeatured: false,
    preparationTime: 5,
    dietary: ['vegan', 'gluten-free']
  }
];

// Banners endpoint
app.get('/api/banners', (req, res) => {
  try {
    const { position, isActive } = req.query;
    let filteredBanners = mockBanners;
    
    if (position) {
      filteredBanners = filteredBanners.filter(b => b.position === position);
    }
    
    if (isActive !== undefined) {
      filteredBanners = filteredBanners.filter(b => b.isActive === (isActive === 'true'));
    }
    
    res.json({
      success: true,
      data: filteredBanners,
      count: filteredBanners.length
    });
  } catch (error) {
    console.error('Banners endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners'
    });
  }
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  try {
    const { isActive } = req.query;
    let filteredCategories = mockCategories;
    
    if (isActive !== undefined) {
      filteredCategories = filteredCategories.filter(c => c.isActive === (isActive === 'true'));
    }
    
    res.json({
      success: true,
      data: filteredCategories.sort((a, b) => a.order - b.order),
      count: filteredCategories.length
    });
  } catch (error) {
    console.error('Categories endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Items endpoint
app.get('/api/items', (req, res) => {
  try {
    const { isAvailable, isPopular, isFeatured, category } = req.query;
    let filteredItems = mockItems;
    
    if (isAvailable !== undefined) {
      filteredItems = filteredItems.filter(i => i.isAvailable === (isAvailable === 'true'));
    }
    
    if (isPopular !== undefined) {
      filteredItems = filteredItems.filter(i => i.isPopular === (isPopular === 'true'));
    }
    
    if (isFeatured !== undefined) {
      filteredItems = filteredItems.filter(i => i.isFeatured === (isFeatured === 'true'));
    }
    
    if (category) {
      filteredItems = filteredItems.filter(i => i.category === category);
    }
    
    res.json({
      success: true,
      data: filteredItems,
      count: filteredItems.length
    });
  } catch (error) {
    console.error('Items endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items'
    });
  }
});

// Orders endpoint
app.get('/api/orders', (req, res) => {
  try {
    // Return empty orders array for now
    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No orders found'
    });
  } catch (error) {
    console.error('Orders endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Auth Routes with better error handling
app.post('/api/auth/register', async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    await getMe(req, res);
  } catch (error) {
    console.error('Get user route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/auth/profile', async (req, res, next) => {
  try {
    await updateProfile(req, res);
  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    await logout(req, res);
  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/dropdown', async (req, res, next) => {
  try {
    await handleDropdownClick(req, res);
  } catch (error) {
    console.error('Dropdown route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error handling dropdown action',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Debug route to check server status
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug info',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
    port: process.env.PORT || 50017,
    endpoints: [
      '/api/banners',
      '/api/categories', 
      '/api/items',
      '/api/orders',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me'
    ]
  });
});

// Seed Admin User
const seedAdminUser = async () => {
  try {
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
      console.log(' Admin user created:', adminUser.email);
    } else {
      console.log(' Admin user already exists');
    }
  } catch (error) {
    console.error(' Error seeding admin user:', error);
  }
};

const PORT = process.env.PORT || 50017;

// Start server
app.listen(PORT, async () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Available endpoints: /api/banners, /api/categories, /api/items, /api/orders`);
  await seedAdminUser();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
