import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register
// @access  Public
router.post('/verify-otp', verifyOTP);

export default router;
