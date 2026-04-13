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

  sendDeliveryOtp

} from '../controllers/orderController.js';

import { protect, adminOnly, deliveryBoy } from '../middleware/authMiddleware.js';



const router = express.Router();



// Public routes

router.get('/track', trackOrder);

// Public GET orders endpoint (returns limited data for unauthenticated users)
router.get('/', async (req, res) => {
  try {
    // Return limited order data for unauthenticated users
    const orders = await Order.find({}).select('orderNumber status totalAmount createdAt').sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Orders endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

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

router.get('/admin', protect, adminOnly, getAllOrders);

router.put('/:id/status', protect, deliveryBoy, updateOrderStatus);

router.put('/:id/assign-delivery', protect, adminOnly, assignDeliveryBoy);

router.delete('/:id', protect, adminOnly, deleteOrder);



// Order by ID route (must be last)

router.get('/:id', protect, getOrderById);



export default router;