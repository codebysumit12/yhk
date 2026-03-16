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
    console.log(' Firebase login attempt START');
    
    const { uid, phone, name } = req.body;
    console.log(' Request body:', { uid, phone, name });

    // Validation
    if (!uid || !phone) {
      console.log(' Validation failed: missing uid or phone');
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and phone number are required'
      });
    }

    console.log(' Validation passed, looking for user...');

    // Check if user exists with this Firebase UID
    let user = await User.findOne({ firebaseUid: uid });
    console.log(' User lookup result:', user ? 'Found existing user' : 'User not found');

    if (!user) {
      console.log(' Creating new user for Firebase UID:', uid);
      
      try {
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

        console.log(' User object created, attempting to save...');
        await user.save();
        console.log(' New user created successfully:', user._id);
      } catch (saveError) {
        console.error(' User save error:', saveError);
        console.error(' Error details:', saveError.message);
        console.error(' Error stack:', saveError.stack);
        return res.status(500).json({
          success: false,
          message: 'User creation failed',
          error: saveError.message,
          details: saveError.stack
        });
      }
    } else {
      console.log(' Existing user found:', user._id);
    }

    console.log(' Generating JWT token...');

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' Token generated successfully for user:', user._id);

    const response = {
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
    };

    console.log(' Sending success response');
    res.json(response);

  } catch (error) {
    console.error(' Firebase login ERROR:', error);
    console.error(' Error message:', error.message);
    console.error(' Error stack:', error.stack);
    console.error(' Error name:', error.name);
    
    res.status(500).json({
      success: false,
      message: 'Server error during Firebase login',
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;