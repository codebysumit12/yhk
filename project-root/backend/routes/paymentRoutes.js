import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRazorpayOrder,
  savePayment,
  getPayments,
  getPaymentByOrderId
} from '../controllers/paymentController.js';

const router = express.Router();

// TEMPORARY DEBUG — remove after fixing
router.post('/debug-save', async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const Order   = (await import('../models/Order.js')).default;

    const order = await Order.findById(req.body.orderId);
    if (!order) return res.json({ step: 'order_lookup', error: 'Order not found', orderId: req.body.orderId });

    const payment = await Payment.create({
      userId: order.userId || null,
      orderId: req.body.orderId,
      amount: req.body.amount || 1,
      paymentMethod: 'razorpay',
      paymentStatus: 'completed',
      transactionId: 'DEBUG-' + Date.now(),
      razorpayOrderId: 'debug_order',
      razorpaySignature: 'debug_sig',
      razorpayPaymentId: 'debug_pay'
    });

    res.json({ step: 'success', paymentId: payment._id });
  } catch (err) {
    res.json({ step: 'failed', error: err.message, code: err.code, keyPattern: err.keyPattern });
  }
});

// Routes
router.post('/create-razorpay-order', createRazorpayOrder); // POST /api/payments/create-razorpay-order - Create Razorpay order (public for guest checkout)
router.post('/', savePayment); // POST /api/payments - Save payment (public endpoint)
router.get('/', protect, getPayments); // GET /api/payments - Get user's payments
router.get('/order/:orderId', protect, getPaymentByOrderId); // GET /api/payments/order/:orderId - Get payment by order ID

export default router;
