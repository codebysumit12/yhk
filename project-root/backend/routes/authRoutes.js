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

// Firebase Phone Auth Login - Direct Implementation
router.post('/firebase-login', async (req, res) => {
  try {
    const { uid, phone, name } = req.body;

    if (!uid || !phone) {
      return res.status(400).json({
        success: false,
        message: 'UID and phone number are required'
      });
    }

    // Check if user exists with this Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        phone: phone,
        name: name || 'User',
        email: `${uid}@firebase-phone.com`, // Placeholder email
        role: 'customer',
        isEmailVerified: true // Phone is verified via Firebase
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    console.error('Firebase login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;