import mongoose from 'mongoose';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import { geocodeAddress } from '../services/geocoding.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { customer, orderItems, deliveryAddress, orderType, paymentMethod, delivery, specialInstructions } = req.body;
    const userId = req.user?._id || req.user?.id || null;

    const validatedItems = [];
    let subtotal = 0;

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Item not found: ${item.menuItem}` });
      }
      const price = menuItem.discountPrice || menuItem.price;
      const itemSubtotal = price * item.quantity;
      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
        image: menuItem.images?.[0]?.url || null,
      });
      subtotal += itemSubtotal;
    }

    const deliveryFee = 0;
    const tax         = parseFloat((subtotal * 0.05).toFixed(2));
    const discount    = 0;
    const total       = parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));

    let coordinates = {
      latitude: 20.5937, longitude: 78.9629,
      accuracy: null, provider: 'nominatim',
      rawResponse: { fallback: 'default' }, capturedAt: new Date(),
    };

    if (orderType === 'delivery' && deliveryAddress) {
      coordinates = await geocodeAddress(deliveryAddress);
      if (!coordinates.latitude || !coordinates.longitude) {
        coordinates = { latitude: 20.5937, longitude: 78.9629, accuracy: null, provider: 'nominatim', rawResponse: { fallback: 'emergency_null_check' }, capturedAt: new Date() };
      }
    }

    const order = await Order.create({
      userId,
      customer,
      orderItems: validatedItems,
      deliveryAddress,
      orderType,
      paymentMethod,
      paymentStatus: 'pending',
      pricing: { subtotal, deliveryFee, tax, discount, total },
      delivery: { ...delivery, estimatedTime: new Date(Date.now() + 45 * 60_000) },
      specialInstructions,
      status: 'pending',
      coordinates,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order (public)
// @route   GET /api/orders/track
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber || !phone) {
      return res.status(400).json({ success: false, message: 'Order number and phone number are required' });
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      'customer.phone': phone,
    }).populate('orderItems.menuItem', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found. Please check your order number and phone number.' });
    }

    // Debug: Log order structure
    console.log('🔍 DEBUG - Order structure:', {
      orderNumber: order.orderNumber,
      customer: order.customer,
      orderItemsLength: order.orderItems?.length || 0,
      pricing: order.pricing,
      status: order.status,
      fullOrder: JSON.stringify(order, null, 2)
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.menuItem', 'name images price discountPrice')
      .populate('userId', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('orderItems.menuItem', 'name images');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = '-createdAt' } = req.query;
    const filter = {};
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      filter.status = { $in: statusArray };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortBy)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('userId', 'name email')
        .populate('orderItems.menuItem', 'name images price discountPrice')
        .populate('delivery.deliveryPerson', 'name phone vehicleNumber')
        .exec(),
      Order.countDocuments(filter),
    ]);

    // Debug: Log first order structure
    if (orders.length > 0) {
      console.log('🔍 DEBUG - getAllOrders first order:', {
        orderNumber: orders[0].orderNumber,
        customer: orders[0].customer,
        orderItemsLength: orders[0].orderItems?.length || 0,
        pricing: orders[0].pricing,
        status: orders[0].status,
        fullOrder: JSON.stringify(orders[0], null, 2)
      });
    }

    res.json({ success: true, count: orders.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin or Delivery partner
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, location, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;

    if (status === 'delivered') {
      order.delivery.actualTime    = new Date();
      order.delivery.deliveredAt   = new Date();
      order.delivery.otpVerified   = true;
    }

    if (location || message) {
      order.timeline.push({ status, timestamp: new Date(), message: message || undefined, location: location || undefined });
    }

    await order.save();
    res.json({ success: true, message: 'Order status updated successfully', data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update order (PATCH)
// @route   PATCH /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, paidAt } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.userId && order.userId.toString() !== req.user._id && req.user?.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this order' });
    }

    if (status)        order.status        = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paidAt)        order.paidAt        = new Date(paidAt);

    await order.save();
    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// FIX Issue 8: use cancelledBy from request body, not hardcoded 'customer'
export const cancelOrder = async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;   // ← FIX: was hardcoded 'customer'

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: cancelledBy || 'customer',   // ← FIX
      cancelledAt: new Date(),
    };

    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate order
// @route   POST /api/orders/:id/rating
export const rateOrder = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'delivered') return res.status(400).json({ success: false, message: 'Only delivered orders can be rated.' });
    if (order.rating?.stars) return res.status(400).json({ success: false, message: 'You have already rated this order.' });

    order.rating = { stars: Number(stars), comment: (comment || '').trim().slice(0, 500), ratedAt: new Date() };
    await order.save();

    updateItemRatings(order.orderItems).catch(err => console.error('Background item-rating update failed:', err));

    res.json({ success: true, message: 'Rating submitted successfully.', data: { orderId: order._id, orderNumber: order.orderNumber, rating: order.rating } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit rating.', error: error.message });
  }
};

// Helper: update MenuItem ratings
export const updateItemRatings = async (orderItems) => {
  const itemIds = [...new Set(orderItems.map(oi => oi.menuItem?.toString()).filter(Boolean))];

  for (const itemId of itemIds) {
    try {
      const oid = new mongoose.Types.ObjectId(itemId);

      const [ratingAgg, soldAgg] = await Promise.all([
        Order.aggregate([
          { $match: { 'orderItems.menuItem': { $eq: oid }, 'rating.stars': { $gte: 1 } } },
          { $group: { _id: null, totalStars: { $sum: '$rating.stars' }, ratingCount: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { 'orderItems.menuItem': { $eq: oid }, status: { $nin: ['cancelled'] } } },
          { $unwind: '$orderItems' },
          { $match: { 'orderItems.menuItem': { $eq: oid } } },
          { $group: { _id: null, totalSold: { $sum: '$orderItems.quantity' } } },
        ]),
      ]);

      const newCount     = ratingAgg[0]?.ratingCount ?? 0;
      const newAverage   = newCount > 0 ? parseFloat((ratingAgg[0].totalStars / newCount).toFixed(2)) : 0;
      const newSoldCount = soldAgg[0]?.totalSold ?? 0;

      await MenuItem.findByIdAndUpdate(itemId, {
        $set: { 'ratings.average': newAverage, 'ratings.count': newCount, soldCount: newSoldCount },
      }, { new: true });
    } catch (error) {
      console.error('Error updating item ratings:', error);
    }
  }
};

// @desc    Backfill all item ratings
// @route   POST /api/orders/admin/backfill-ratings
export const backfillItemRatings = async (req, res) => {
  try {
    const distinctItems = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.menuItem' } },
      { $match: { _id: { $ne: null } } },
    ]);

    const itemIds = distinctItems.map(d => d._id);
    const results = [];

    for (const oid of itemIds) {
      try {
        const [ratingAgg, soldAgg] = await Promise.all([
          Order.aggregate([
            { $match: { 'orderItems.menuItem': { $eq: oid }, 'rating.stars': { $gte: 1 } } },
            { $group: { _id: null, totalStars: { $sum: '$rating.stars' }, ratingCount: { $sum: 1 } } },
          ]),
          Order.aggregate([
            { $match: { 'orderItems.menuItem': { $eq: oid }, status: { $nin: ['cancelled'] } } },
            { $unwind: '$orderItems' },
            { $match: { 'orderItems.menuItem': { $eq: oid } } },
            { $group: { _id: null, totalSold: { $sum: '$orderItems.quantity' } } },
          ]),
        ]);

        const newCount     = ratingAgg[0]?.ratingCount ?? 0;
        const newAverage   = newCount > 0 ? parseFloat((ratingAgg[0].totalStars / newCount).toFixed(2)) : 0;
        const newSoldCount = soldAgg[0]?.totalSold ?? 0;

        const updated = await MenuItem.findByIdAndUpdate(oid, {
          $set: { 'ratings.average': newAverage, 'ratings.count': newCount, soldCount: newSoldCount },
        }, { new: true, select: 'name ratings soldCount' });

        if (updated) results.push({ itemId: oid, name: updated.name, average: newAverage, count: newCount, soldCount: newSoldCount });
      } catch (itemErr) {
        console.error(`Failed for item ${oid}:`, itemErr.message);
      }
    }

    res.json({ success: true, message: `Backfill complete. Processed ${results.length} of ${itemIds.length} items.`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get delivery boy's assigned orders
// @route   GET /api/orders/my-deliveries
export const getMyDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.user._id || req.user.id;
    const { status } = req.query;

    const query = {
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId },
      ],
    };
    if (status) query.status = status;

    let orders;
    try {
      orders = await Order.find(query).sort({ createdAt: -1 }).populate('orderItems.menuItem', 'name images');
    } catch {
      orders = await Order.find(query).sort({ createdAt: -1 });
    }

    res.json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to customer for delivery verification
// @route   POST /api/orders/:id/send-otp
export const sendDeliveryOtp = async (req, res) => {
  try {
    const orderId       = req.params.id;
    const deliveryBoyId = req.user._id || req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const assignedId = order.delivery?.deliveryPerson?.id;
    if (!assignedId || assignedId.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
    }
    if (order.status !== 'out-for-delivery') {
      return res.status(400).json({ success: false, message: 'Order is not out for delivery' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.delivery.otp             = otp;
    order.delivery.otpGeneratedAt  = new Date();
    await order.save();

    console.log(`OTP for ${order.orderNumber}: ${otp} → ${order.customer.phone}`);

    res.json({
      success: true,
      message: 'OTP sent to customer successfully',
      data: {
        orderId:       order.orderNumber,
        customerPhone: order.customer.phone,
        // Only expose in development for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify delivery OTP and mark order delivered
// @route   POST /api/orders/:id/verify-otp
// FIX Issue 5: removed insecure orderNumber-based fallback OTP
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { otp }       = req.body;
    const orderId       = req.params.id;
    const deliveryBoyId = req.user._id || req.user.id;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit OTP is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const assignedId = order.delivery?.deliveryPerson?.id;
    if (!assignedId || assignedId.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
    }
    if (order.status !== 'out-for-delivery') {
      return res.status(400).json({ success: false, message: 'Order is not out for delivery' });
    }

    // ── Test bypass (Firebase test number only) ───────────────────────────────
    const isTestBypass =
      order.customer.phone === '9370337263' &&
      otp === '123456' &&
      process.env.NODE_ENV !== 'production';

    if (!isTestBypass) {
      // FIX Issue 5: removed insecure orderNumber fallback.
      // OTP must have been generated by send-otp endpoint.
      if (!order.delivery?.otp || !order.delivery?.otpGeneratedAt) {
        return res.status(400).json({ success: false, message: 'No OTP has been sent for this order. Please send OTP first.' });
      }

      // Check expiry (10 minutes)
      const otpAge = Date.now() - new Date(order.delivery.otpGeneratedAt).getTime();
      if (otpAge > 10 * 60 * 1000) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      if (otp !== order.delivery.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check with the customer.' });
      }
    }

    // Mark delivered
    order.status                   = 'delivered';
    order.delivery.deliveredAt     = new Date();
    order.delivery.actualTime      = new Date();
    order.delivery.otpVerified     = true;
    order.delivery.otp             = undefined;   // clear OTP after use
    order.delivery.otpGeneratedAt  = undefined;

    await order.save();

    res.json({ success: true, message: 'Delivery confirmed successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign delivery boy to order
// @route   PUT /api/orders/:id/assign-delivery
// FIX Issue 4: removed automatic status promotion — admin controls status separately
export const assignDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    if (!deliveryBoyId) {
      return res.status(400).json({ success: false, message: 'Delivery boy ID is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== 'delivery_partner') {
      return res.status(404).json({ success: false, message: 'Delivery partner not found or invalid role' });
    }

    order.delivery.deliveryPerson = {
      id:            deliveryBoy._id,
      name:          deliveryBoy.name,
      phone:         deliveryBoy.phone,
      vehicleNumber: deliveryBoy.vehicleNumber || '',
    };

    // FIX Issue 4: NO automatic status change.
    // Status flow (pending→confirmed→preparing→ready→out-for-delivery→delivered)
    // is controlled exclusively by updateOrderStatus.
    // Assigning a delivery boy is independent of the status workflow.

    await order.save();

    res.json({ success: true, message: 'Delivery boy assigned successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};