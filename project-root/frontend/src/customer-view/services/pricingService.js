import { API_CONFIG } from '../../config/api';

// Cache pricing configuration to avoid repeated API calls
let pricingCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch pricing configuration from backend
 * @returns {Object} Pricing configuration
 */
export const fetchPricingConfig = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pricingCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return pricingCache;
  }

  try {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    const response = await fetch(`${API_CONFIG.API_URL}/settings/pricing`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        pricingCache = data.data;
        cacheTimestamp = now;
        return data.data;
      }
    }
  } catch (error) {
    console.error('Error fetching pricing config:', error);
  }

  // Fallback to default pricing if API fails
  return getDefaultPricing();
};

/**
 * Get default pricing configuration
 * @returns {Object} Default pricing configuration
 */
const getDefaultPricing = () => ({
  delivery: {
    upto5km: 10,
    upto10km: 20,
    above10km: 30,
    freeDeliveryAbove: 500,
    enabled: true
  },
  packaging: {
    perOrder: 10,
    enabled: true
  },
  gst: {
    percentage: 5,
    enabled: true
  },
  platformFee: {
    amount: 5,
    enabled: false
  },
  discount: {
    percentage: 20,
    maxAmount: 100,
    enabled: true
  }
});

/**
 * Calculate delivery fee based on distance and pricing config
 * @param {number} distance - Distance in KM
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {number} Delivery fee
 */
export const calculateDeliveryFee = (distance, pricingConfig) => {
  if (!pricingConfig?.delivery?.enabled) return 0;
  
  const { upto5km, upto10km, above10km } = pricingConfig.delivery;
  
  if (distance <= 5) return upto5km;
  if (distance <= 10) return upto10km;
  return above10km;
};

/**
 * Check if delivery is free based on order value
 * @param {number} orderValue - Order subtotal
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {boolean} Whether delivery is free
 */
export const isDeliveryFree = (orderValue, pricingConfig) => {
  if (!pricingConfig?.delivery?.enabled) return true;
  return orderValue >= (pricingConfig.delivery.freeDeliveryAbove || 0);
};

/**
 * Calculate packaging fee
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {number} Packaging fee
 */
export const calculatePackagingFee = (pricingConfig) => {
  return pricingConfig?.packaging?.enabled ? pricingConfig.packaging.perOrder : 0;
};

/**
 * Calculate GST
 * @param {number} subtotal - Order subtotal
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {number} GST amount
 */
export const calculateGST = (subtotal, pricingConfig) => {
  if (!pricingConfig?.gst?.enabled) return 0;
  return Math.round(subtotal * pricingConfig.gst.percentage / 100);
};

/**
 * Calculate platform fee
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {number} Platform fee
 */
export const calculatePlatformFee = (pricingConfig) => {
  return pricingConfig?.platformFee?.enabled ? pricingConfig.platformFee.amount : 0;
};

/**
 * Calculate discount
 * @param {number} subtotal - Order subtotal
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {number} Discount amount
 */
export const calculateDiscount = (subtotal, pricingConfig) => {
  if (!pricingConfig?.discount?.enabled) return 0;
  
  const discountAmount = Math.round(subtotal * pricingConfig.discount.percentage / 100);
  return Math.min(discountAmount, pricingConfig.discount.maxAmount);
};

/**
 * Calculate complete order pricing
 * @param {number} subtotal - Order subtotal
 * @param {number} distance - Delivery distance in KM
 * @param {Object} pricingConfig - Pricing configuration
 * @returns {Object} Complete pricing breakdown
 */
export const calculateOrderPricing = async (subtotal, distance = 0) => {
  const pricingConfig = await fetchPricingConfig();
  
  // Calculate individual components
  const discount = calculateDiscount(subtotal, pricingConfig);
  const discountedSubtotal = subtotal - discount;
  
  const deliveryFee = isDeliveryFree(discountedSubtotal, pricingConfig) 
    ? 0 
    : calculateDeliveryFee(distance, pricingConfig);
  
  const packagingFee = calculatePackagingFee(pricingConfig);
  const gst = calculateGST(discountedSubtotal + deliveryFee + packagingFee, pricingConfig);
  const platformFee = calculatePlatformFee(pricingConfig);
  
  // Calculate total with proper rounding to avoid floating-point precision issues
  const total = Math.round((discountedSubtotal + deliveryFee + packagingFee + gst + platformFee) * 100) / 100;
  
  return {
    subtotal,
    discount,
    deliveryFee,
    packagingFee,
    gst,
    platformFee,
    total,
    pricingConfig,
    breakdown: {
      subtotal: { label: 'Subtotal', amount: subtotal },
      discount: { label: 'Discount', amount: -discount },
      deliveryFee: { label: 'Delivery Fee', amount: deliveryFee, free: isDeliveryFree(discountedSubtotal, pricingConfig) },
      packagingFee: { label: 'Packaging', amount: packagingFee },
      gst: { label: `GST (${pricingConfig.gst.percentage}%)`, amount: gst },
      platformFee: { label: 'Platform Fee', amount: platformFee },
      total: { label: 'Total', amount: total }
    }
  };
};

/**
 * Get pricing breakdown for display
 * @param {Object} pricing - Pricing object
 * @returns {Array} Formatted breakdown for display
 */
export const getPricingBreakdown = (pricing) => {
  if (!pricing?.breakdown) return [];
  
  return Object.values(pricing.breakdown).filter(item => item.amount !== 0);
};
