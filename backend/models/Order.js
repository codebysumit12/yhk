import mongoose from 'mongoose';

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  },
  image: String
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  message: String,
  location: String
});

// ─── Main Order Schema ───────────────────────────────────────────────────────

const orderSchema = new mongoose.Schema({

  // ── Order Identification ──────────────────────────────────────────────────
  orderNumber: {
    type: String,
    unique: true
    // auto-generated in pre('save') hook below
  },

  // ── Customer ──────────────────────────────────────────────────────────────
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for guest orders
  },
  customer: {
    name:  { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },

  // ── Items ─────────────────────────────────────────────────────────────────
  orderItems: [orderItemSchema],

  // ── Order Type ────────────────────────────────────────────────────
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'delivery'],
    required: true
  },

  // ── Delivery Information ──────────────────────────────────────────────
  delivery: {
    type: { type: String, default: 'standard' },
    estimatedTime: { type: Date, default: null },
    actualTime: { type: Date, default: null },
    deliveryPerson: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: null },
      phone: { type: String, default: null },
      vehicleNumber: { type: String, default: null }
    }
  },

  // ── Delivery Address ──────────────────────────────────────────────────────
  deliveryAddress: {
    street:      String,
    apartment:   String,
    city:        String,
    state:       String,
    zipCode:     String,
    country:     String,
    landmark:    String,
    instructions: String
  },

  // ── Status & Timeline ─────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  timeline: [timelineSchema],

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paidAt: Date,

  // ── Pricing ───────────────────────────────────────────────────────────────
  pricing: {
    subtotal:    { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, required: true, min: 0 }
  },

  // ── Restaurant/Branch ─────────────────────────────────────────────────────
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },

  // ── Special Instructions ──────────────────────────────────────────────────
  specialInstructions: String,

  // ── Ratings & Feedback ────────────────────────────────────────────────────
 


   rating: {
      stars:   { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, trim: true, maxlength: 500, default: '' },
      ratedAt: { type: Date, default: null },
    },

  // ── Cancellation ──────────────────────────────────────────────────────────
  cancellation: {
    reason:      String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'restaurant', 'system']
    },
    cancelledAt: Date
  }

}, { timestamps: true });

// ─── Hooks ───────────────────────────────────────────────────────────────────

// Auto-generate a human-readable order number (e.g. YHK000042)
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `YHK${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Append a timeline entry whenever status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const statusMessages = {
      'pending':          'Order received and pending confirmation',
      'confirmed':        'Order confirmed by restaurant',
      'preparing':        'Your food is being prepared',
      'ready':            'Order is ready for pickup/delivery',
      'out-for-delivery': 'Your order is on the way',
      'delivered':        'Order delivered successfully',
      'cancelled':        'Order has been cancelled'
    };

    this.timeline.push({
      status:    this.status,
      timestamp: new Date(),
      message:   statusMessages[this.status]
    });
  }
  next();
});

// ─── Instance Methods ────────────────────────────────────────────────────────

// Recalculate pricing from orderItems
orderSchema.methods.calculateTotal = function () {
  const subtotal = this.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax   = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
  const total = parseFloat(
    (subtotal + (this.pricing.deliveryFee || 0) + tax - (this.pricing.discount || 0)).toFixed(2)
  );

  this.pricing.subtotal = subtotal;
  this.pricing.tax      = tax;
  this.pricing.total    = total;
};

// ─── Indexes ─────────────────────────────────────────────────────────────────

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// ─── Middleware to update item ratings when order is rated ─────────────────────────────────────────────────────────────────

orderSchema.post('save', async function() {
  // Only update ratings if rating has changed and order is delivered
  if (this.isModified('rating.stars') && this.status === 'delivered' && this.rating.stars) {
    try {
      const MenuItem = mongoose.model('MenuItem');
      
      // Update ratings for each item in the order
      for (const orderItem of this.orderItems) {
        // Find all delivered orders with ratings for this item
        const ratedOrders = await mongoose.model('Order').find({
          'orderItems.menuItem': orderItem.menuItem,
          'rating.stars': { $exists: true, $ne: null },
          status: 'delivered'
        });
        
        if (ratedOrders.length > 0) {
          // Calculate new average rating
          const totalRatings = ratedOrders.reduce((sum, order) => sum + order.rating.stars, 0);
          const averageRating = totalRatings / ratedOrders.length;
          
          // Update item with new ratings
          await MenuItem.findByIdAndUpdate(orderItem.menuItem, {
            'ratings.average': averageRating,
            'ratings.count': ratedOrders.length
          });
        }
      }
    } catch (error) {
      console.error('Error updating item ratings:', error);
    }
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

export default mongoose.model('Order', orderSchema);