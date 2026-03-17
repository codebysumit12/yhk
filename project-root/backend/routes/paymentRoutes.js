import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRazorpayOrder,
  savePayment,
  getPayments,
  getPaymentByOrderId
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes - all require authentication (users are already logged in)
router.post('/create-razorpay-order', protect, createRazorpayOrder); // POST /api/payments/create-razorpay-order - Create Razorpay order
router.post('/', protect, savePayment); // POST /api/payments - Save payment
router.get('/', protect, getPayments); // GET /api/payments - Get user's payments
router.get('/order/:orderId', protect, getPaymentByOrderId); // GET /api/payments/order/:orderId - Get payment by order ID

export default router;
