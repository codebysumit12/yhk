import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// @desc    Create Razorpay order
// @route   POST /api/payments/create-razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SSKxoURQgSmXB7';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '8M12SAay68hrhYWILxwTJQVI';
    
    // Create order using Razorpay API directly
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      throw new Error(errorData.error?.description || 'Razorpay API error');
    }

    const order = await response.json();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order: ' + error.message
    });
  }
};

// @desc    Save payment record after successful payment
// @route   POST /api/payments
// @access  Private (users are already authenticated) or guest with valid order
export const savePayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus,
      razorpayOrderId,
      razorpaySignature
    } = req.body;

    // Verify the order exists
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Determine userId based on order and authentication
    let paymentUserId = null;
    
    // If order has a userId, verify ownership for authenticated users
    if (order.userId) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required for this order'
        });
      }
      
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to make payment for this order'
        });
      }
      
      paymentUserId = req.user._id;
    } else {
      // Guest order - use null userId or authenticated user if available
      paymentUserId = req.user ? req.user._id : null;
    }

    // Create payment record
    const payment = await Payment.create({
      userId: paymentUserId,
      orderId,
      amount,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: paymentStatus || 'completed',
      transactionId,
      razorpayOrderId,
      razorpaySignature
    });

    // Update order payment status
    order.paymentStatus = 'paid';
    order.status = 'confirmed'; // Move to confirmed status after payment
    order.paidAt = new Date(); // Set payment timestamp
    await order.save();

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Payment save error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private
export const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId })
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Verify the payment belongs to the user or user is admin
    if (payment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
