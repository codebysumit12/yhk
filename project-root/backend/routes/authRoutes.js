import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Firebase Phone Auth Login - Enhanced Implementation
router.post('/firebase-login', async (req, res) => {
  try {
    const { uid, phone, name } = req.body;

    console.log(' Firebase login attempt:', { uid, phone, name });

    // Validation
    if (!uid || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and phone number are required'
      });
    }

    // Check if user exists with this Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      console.log(' Creating new user for Firebase UID:', uid);
      
      // Create new user
      user = new User({
        firebaseUid: uid,
        phone: phone.replace('+91', ''), // Remove country code
        name: name || 'User',
        email: `${uid}@firebase.temp`, // Temporary email
        role: 'customer',
        isEmailVerified: true, // Phone verified via Firebase
        isActive: true
      });

      await user.save();
      console.log(' New user created:', user._id);
    } else {
      console.log(' Existing user found:', user._id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' Token generated for user:', user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error(' Firebase login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Firebase login',
      error: error.message
    });
  }
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;