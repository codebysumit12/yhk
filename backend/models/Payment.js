import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for guest orders
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet', 'razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  // Razorpay specific fields
  razorpayOrderId: String,
  razorpaySignature: String,
  razorpayPaymentId: String, // Store Razorpay payment ID separately
  cardLastFour: {
    type: String
  },
  cardType: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate transaction ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Payment', paymentSchema);
