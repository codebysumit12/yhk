import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  delivery: {
    upto5km: { type: Number, default: 0 },
    upto10km: { type: Number, default: 30 },
    above10km: { type: Number, default: 50 },
    freeDeliveryAbove: { type: Number, default: 500 },
    enabled: { type: Boolean, default: true }
  },
  packaging: {
    perOrder: { type: Number, default: 10 },
    enabled: { type: Boolean, default: true }
  },
  gst: {
    percentage: { type: Number, default: 5 },
    enabled: { type: Boolean, default: true }
  },
  platformFee: {
    amount: { type: Number, default: 5 },
    enabled: { type: Boolean, default: false }
  },
  discount: {
    percentage: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 100 },
    enabled: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);