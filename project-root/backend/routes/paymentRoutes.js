import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRazorpayOrder,
  savePayment,
  getPayments,
  getPaymentByOrderId
} from '../controllers/paymentController.js';

const router = express.Router();

// Optional auth middleware for savePayment
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User').default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yhk_secret_key_2024');
      req.user = await User.findById(decoded.id).select('-password');
    }
    next();
  } catch (error) {
    // Continue without auth if token is invalid/missing
    next();
  }
};

// Protected routes - require authentication for most operations
router.post('/create-razorpay-order', protect, createRazorpayOrder); // POST /api/payments/create-razorpay-order - Create Razorpay order
router.post('/', optionalAuth, savePayment); // POST /api/payments - Save payment (allows guest orders)
router.get('/', protect, getPayments); // GET /api/payments - Get user's payments
router.get('/order/:orderId', protect, getPaymentByOrderId); // GET /api/payments/order/:orderId - Get payment by order ID

export default router;
