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

router.put('/:id/status', protect, async (req, res, next) => {
  try {
    // Admin can always update status
    if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
      return next();
    }
    
    // Delivery partners can only update status if they're assigned to the order
    if (req.user && req.user.role === 'delivery_partner') {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Check if this delivery partner is assigned to this order
      const assignedDeliveryBoyId = order.delivery?.deliveryPerson?.id;
      if (!assignedDeliveryBoyId || assignedDeliveryBoyId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You can only update status for orders assigned to you'
        });
      }
      
      return next();
    }
    
    // If neither admin nor delivery partner, deny access
    res.status(401).json({
      success: false,
      error: 'Admin or delivery partner access required'
    });
  } catch (error) {
    console.error('Error in order status middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Server error validating access'
    });
  }
}, updateOrderStatus);

router.put('/:id/assign-delivery', protect, adminOnly, assignDeliveryBoy);

router.delete('/:id', protect, adminOnly, deleteOrder);



// Order by ID route (must be last)

router.get('/:id', protect, getOrderById);



export default router;