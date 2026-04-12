import express from 'express';

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

  sendDeliveryOtp

} from '../controllers/orderController.js';

import { protect, adminOnly, deliveryBoy } from '../middleware/authMiddleware.js';



const router = express.Router();



// Public routes

router.get('/track', trackOrder);



// Protected routes (User)

router.post('/', protect, createOrder);

router.get('/my-orders', protect, getMyOrders);

router.get('/my-deliveries', protect, deliveryBoy, getMyDeliveries);

router.post('/:id/send-otp', protect, deliveryBoy, sendDeliveryOtp);

router.post('/:id/verify-otp', protect, deliveryBoy, verifyDeliveryOtp);

router.patch('/:id', protect, updateOrder);

router.put('/:id/cancel', protect, cancelOrder);

router.post('/:id/rating', protect, rateOrder);



// Protected routes (Admin)

router.get('/', protect, adminOnly, getAllOrders);

router.put('/:id/status', protect, (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true || req.user.role === 'delivery_partner')) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Admin or delivery partner access required'
    });
  }
}, updateOrderStatus);

router.put('/:id/assign-delivery', protect, adminOnly, assignDeliveryBoy);

router.delete('/:id', protect, adminOnly, deleteOrder);



// Order by ID route (must be last)

router.get('/:id', protect, getOrderById);



export default router;