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

// Connect to MongoDB
connectDB();

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', getMe);
app.put('/api/auth/profile', updateProfile);
app.post('/api/auth/logout', logout);
app.post('/api/auth/dropdown', handleDropdownClick);

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

export default app;
