import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  firebaseLogin,
  sendEmailOTP,
  verifyEmailOTP,
  googleLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Firebase Phone Auth Login
router.post('/firebase-login', firebaseLogin);

// Email OTP Auth
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);

// Google Auth
router.post('/google-login', googleLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;