import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateOrderPricing } from '../services/pricingService';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose, cart: externalCart, isUpdatingCart, setIsUpdatingCart }) => {
  const [cart, setCart] = useState(externalCart || []);
  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    packagingFee: 0,
    gst: 0,
    platformFee: 0,
    total: 0,
    breakdown: {}
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [cartUpdating, setCartUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(externalCart || []);
  }, [externalCart]);

  // Calculate dynamic pricing whenever cart changes
  useEffect(() => {
    const calculatePricing = async () => {
      const subtotal = cart.reduce((s, item) => s + (item.finalPrice || item.price || 0) * (item.quantity || 1), 0);
      
      if (subtotal === 0) {
        setPricing({
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          packagingFee: 0,
          gst: 0,
          platformFee: 0,
          total: 0,
          breakdown: {}
        });
        return;
      }

      setPricingLoading(true);
      try {
        // Default to 5km distance for delivery calculation
        const pricingResult = await calculateOrderPricing(subtotal, 5);
        setPricing(pricingResult);
      } catch (error) {
        console.error('Error calculating pricing:', error);
        // Fallback to simple calculation
        setPricing({
          subtotal,
          discount: 0,
          deliveryFee: 0,
          packagingFee: 0,
          gst: 0,
          platformFee: 0,
          total: subtotal,
          breakdown: {}
        });
      } finally {
        setPricingLoading(false);
      }
    };

    calculatePricing();
  }, [cart]);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const increaseQuantity = async (index) => {
    if (setIsUpdatingCart) {
      setIsUpdatingCart(true);
    }
    try {
      const updated = [...cart];
      updated[index].quantity = updated[index].quantity + 1;
      updateCart(updated);
    } finally {
      if (setIsUpdatingCart) {
        setIsUpdatingCart(false);
      }
    }
  };

  const decreaseQuantity = async (index) => {
    if (cart[index].quantity <= 1) return;
    
    if (setIsUpdatingCart) {
      setIsUpdatingCart(true);
    }
    try {
      const updated = [...cart];
      updated[index].quantity -= 1;
      updateCart(updated);
    } finally {
      if (setIsUpdatingCart) {
        setIsUpdatingCart(false);
      }
    }
  };

  const removeItem = (index) => updateCart(cart.filter((_, i) => i !== index));

  const clearCart = () => {
    setShowClearConfirm(true);
  };

  const handleClearCart = () => {
    updateCart([]);
    setShowClearConfirm(false);
  };

  const totalItems = cart.reduce((n, item) => n + (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (!cart.length) { alert('Your cart is empty!'); return; }
    
    // Save cart data to localStorage for checkout page
    const checkoutData = {
      items: cart,
      subtotal: pricing.subtotal,
      tax: pricing.gst,
      delivery: pricing.deliveryFee,
      total: pricing.total,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}

      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>

        {/* ── Header ── */}
        <div className="cart-header">
          <div className="cart-header-left">
            <h3>🛒 Your Cart</h3>
            <span className="cart-header-sub">
              {totalItems > 0
                ? `${totalItems} yummy item${totalItems > 1 ? 's' : ''} 🎉`
                : 'Nothing here yet!'}
            </span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-cart-icon">🍽️</div>
              <h4>Your cart is empty!</h4>
              <p>
                Looks like you haven't added anything yet.<br />
                Let's fix that — something delicious is waiting! 😋
              </p>
              <button className="browse-menu-btn" onClick={() => { onClose(); navigate('/'); }}>
                🌿 Browse Menu
              </button>
            </div>
          ) : (
            <>
              <p className="cart-section-label">🍀 Your Items</p>

              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={`cart-item-${index}-${item._id || item.name}`} className="cart-item">
                    <div className="cart-item-image">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="no-image-cart">🍽️</div>
                      }
                    </div>

                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <div className="cart-item-price">
                        ₹{((item.finalPrice || item.price || 0) * (item.quantity || 1)).toFixed(0)}
                      </div>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => decreaseQuantity(index)}>−</button>
                        <span className="qty-value">{item.quantity || 1}</span>
                        <button className="qty-btn" onClick={() => increaseQuantity(index)}>+</button>
                      </div>
                    </div>

                    <button className="remove-item-btn" onClick={() => removeItem(index)} title="Remove">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button className="clear-cart-btn" onClick={clearCart}>
                🗑️ Clear entire cart
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="bill-summary">
              <h4>💚 Bill Summary</h4>
              {pricingLoading ? (
                <div className="bill-row"><span>Calculating...</span></div>
              ) : (
                <>
                  <div className="bill-row">
                    <span>Subtotal</span>
                    <span>₹{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="bill-row">
                      <span>Discount</span>
                      <span style={{ color: '#28a745' }}>-₹{pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="bill-row">
                    <span>Delivery fee</span>
                    <span style={{ color: pricing.deliveryFee === 0 ? '#28a745' : 'inherit' }}>
                      {pricing.deliveryFee === 0 ? 'FREE' : `₹${pricing.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {pricing.packagingFee > 0 && (
                    <div className="bill-row">
                      <span>Packaging</span>
                      <span>₹{pricing.packagingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.gst > 0 && (
                    <div className="bill-row">
                      <span>GST</span>
                      <span>₹{pricing.gst.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.platformFee > 0 && (
                    <div className="bill-row">
                      <span>Platform Fee</span>
                      <span>₹{pricing.platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="bill-row total">
                    <strong>Total</strong>
                    <strong>₹{pricing.total.toFixed(2)}</strong>
                  </div>
                </>
              )}
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              <span>🛵 Proceed to Checkout · ₹{pricing.total.toFixed(0)}</span>
            </button>
          </div>
        )}

      </div>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-icon">🗑️</div>
              <h3>Clear Cart?</h3>
              <p>Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
              <div className="confirm-dialog-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm-delete"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartSidebar;