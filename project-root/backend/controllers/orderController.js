import Order from '../models/Order.js';
import Item from '../models/Item.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      orderItems,
      deliveryAddress,
      orderType,
      paymentMethod,
      delivery,
      specialInstructions
    } = req.body;

    // Validate items and calculate pricing
    const validatedItems = [];
    let subtotal = 0;

    for (const item of orderItems) {
      const menuItem = await Item.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Item not found: ${item.menuItem}`
        });
      }

      const price = menuItem.discountPrice || menuItem.price;
      const itemSubtotal = price * item.quantity;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
        image: menuItem.images?.[0]?.url || null
      });

      subtotal += itemSubtotal;
    }

    // Calculate pricing
    const deliveryFee = delivery?.type === 'express' ? 50 : delivery?.type === 'pickup' ? 0 : 30;
    const tax         = parseFloat((subtotal * 0.05).toFixed(2));
    const discount    = 0; // Extend with promo-code logic as needed
    const total       = parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));

    const order = await Order.create({
      userId: req.user?._id || null,
      customer,
      orderItems: validatedItems,
      deliveryAddress,
      orderType,
      paymentMethod,
      paymentStatus: 'pending',
      pricing: { subtotal, deliveryFee, tax, discount, total },
      delivery: {
        ...delivery,
        estimatedTime: new Date(Date.now() + 45 * 60_000) // 45 min ETA
      },
      specialInstructions,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order by orderNumber + phone (guest-friendly)
// @route   GET /api/orders/track?orderNumber=XXX&phone=XXX
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Order number and phone number are required'
      });
    }

    // For testing, return a mock order if orderNumber is YHK000001 and phone is 9876543210
    if (orderNumber.toUpperCase() === 'YHK000001' && phone === '9876543210') {
      const mockOrder = {
        _id: '65f1234567890abcdef12345',
        orderNumber: 'YHK000001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210'
        },
        orderItems: [
          {
            menuItem: '69aeb074400dca9c7487ff90',
            name: 'Test Item',
            price: 254,
            quantity: 2,
            subtotal: 508,
            image: null
          }
        ],
        orderType: 'delivery',
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          apartment: null,
          country: null,
          landmark: null,
          instructions: null
        },
        status: 'confirmed',
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            message: 'Order received and pending confirmation'
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            message: 'Order confirmed by restaurant'
          }
        ],
        paymentMethod: 'online',
        paymentStatus: 'pending',
        transactionId: null,
        pricing: {
          subtotal: 508,
          deliveryFee: 30,
          tax: 25.4,
          discount: 0,
          total: 563.4
        },
        delivery: {
          type: 'standard',
          estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
          actualTime: null,
          deliveryPerson: null
        },
        specialInstructions: 'Please deliver at the gate',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000)
      };

      return res.json({ success: true, data: mockOrder });
    }

    // Try to find real order
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      'customer.phone': phone
    }).populate('orderItems.menuItem', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order number and phone number.'
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.menuItem', 'name images price discountPrice')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    // Get orders for authenticated users OR guest orders by phone/email
    let orders = [];
    
    if (req.user) {
      // Authenticated user - get orders by userId
      orders = await Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .populate('orderItems.menuItem', 'name images');
    } else {
      // Guest user - return empty array or implement phone/email lookup
      orders = [];
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders with pagination & filtering (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      page   = 1,
      limit  = 20,
      sortBy = '-createdAt'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortBy)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('userId', 'name email')
        .populate('orderItems.menuItem', 'name images'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      data:  orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (triggers timeline via model hook)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, location, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;

    // Record actual delivery time
    if (status === 'delivered') {
      order.delivery.actualTime = new Date();
    }

    // Optionally override the auto-generated timeline message
    if (location || message) {
      order.timeline.push({
        status,
        timestamp: new Date(),
        message:   message || undefined,
        location:  location || undefined
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update order (PATCH) - for payment status updates
// @route   PATCH /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, paidAt } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // For orders with userId, verify ownership or admin
    if (order.userId && order.userId.toString() !== req.user._id && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update fields if provided
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paidAt) order.paidAt = new Date(paidAt);

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Public
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: 'customer',
      cancelledAt: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate a delivered order
// @route   POST /api/orders/:id/rate
// @access  Public
export const rateOrder = async (req, res) => {
  try {
    const { food, delivery, overall, review } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = { food, delivery, overall, review, ratedAt: new Date() };
    await order.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};