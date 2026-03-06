import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  savePayment,
  getPayments,
  getPaymentByOrderId
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes - all require authentication
router.post('/', protect, savePayment); // POST /api/payments - Save payment
router.get('/', protect, getPayments); // GET /api/payments - Get user's payments
router.get('/order/:orderId', protect, getPaymentByOrderId); // GET /api/payments/order/:orderId - Get payment by order ID

export default router;
