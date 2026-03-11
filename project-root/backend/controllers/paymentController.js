import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// @desc    Save payment record after successful payment
// @route   POST /api/payments
// @access  Private (users are already authenticated)
export const savePayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      paymentMethod,
      transactionId,
      paymentStatus
    } = req.body;

    // Verify the order exists
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify the order belongs to the authenticated user
    if (order.userId && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to make payment for this order'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user._id,
      orderId,
      amount,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: paymentStatus || 'completed',
      transactionId
    });

    // Update order payment status
    order.paymentStatus = 'paid';
    order.status = 'confirmed'; // Move to confirmed status after payment
    await order.save();

    res.status(201).json({
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
