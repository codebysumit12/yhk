import express from 'express';
import Order from '../models/Order.js';
import {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  trackOrder,
  cancelOrder,
  rateOrder,
  backfillItemRatings,
  assignDeliveryBoy,
  getMyDeliveries,
  verifyDeliveryOtp,
  sendDeliveryOtp,
} from '../controllers/orderController.js';
import { protect, adminOnly, deliveryBoy } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/track', trackOrder);

// ── Authenticated user ────────────────────────────────────────────────────────
router.post('/',              protect, createOrder);
router.get('/my-orders',      protect, getMyOrders);
router.patch('/:id',          protect, updateOrder);
router.put('/:id/cancel',     protect, cancelOrder);
router.post('/:id/rating',    protect, rateOrder);

// ── Delivery partner ──────────────────────────────────────────────────────────
// FIX Issue 2: /my-deliveries must come BEFORE /:id so Express doesn't treat
// "my-deliveries" as an order ID. (It already did — kept for clarity.)
router.get('/my-deliveries',      protect, deliveryBoy, getMyDeliveries);
router.post('/:id/send-otp',      protect, deliveryBoy, sendDeliveryOtp);
router.post('/:id/verify-otp',    protect, deliveryBoy, verifyDeliveryOtp);

// ── FIX Issue 3: PUT /:id/status must accept BOTH admin AND delivery partner ──
// Original: protect, deliveryBoy  — blocked admins from confirming/preparing/etc.
// Fix: inline middleware that passes if user is admin OR delivery_partner.
const adminOrDelivery = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'admin' || role === 'delivery_partner' || req.user?.isAdmin) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin or delivery partner access required',
  });
};
router.put('/:id/status', protect, adminOrDelivery, updateOrderStatus);

// ── Admin only ────────────────────────────────────────────────────────────────
// FIX Issue 1: GET / was a public stub returning 10 orders with limited fields.
// Admin frontend calls GET /api/orders?status=... expecting the full list.
// Now properly protected and calls getAllOrders.
router.get('/',                       protect, adminOnly, getAllOrders);
router.get('/admin',                  protect, adminOnly, getAllOrders);   // keep alias
router.put('/:id/assign-delivery',    protect, adminOnly, assignDeliveryBoy);
router.delete('/:id',                 protect, adminOnly, deleteOrder);
router.post('/admin/backfill-ratings',protect, adminOnly, backfillItemRatings);

// ── Must be last — catches /:id ───────────────────────────────────────────────
router.get('/:id', protect, getOrderById);

export default router;