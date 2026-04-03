import React, { useEffect } from 'react';
import './CartNotification.css';

const CartNotification = ({ show, itemName, onViewCart, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="cart-notification-overlay">
      <div className="cart-notification">
        <div className="cart-notification-icon">✅</div>
        <div className="cart-notification-content">
          <h4>Added to Cart!</h4>
          <p>{itemName}</p>
        </div>
        <div className="cart-notification-actions">
          <button className="btn-view-cart" onClick={onViewCart}>
            🛒 View Cart
          </button>
          <button className="btn-close-notification" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;