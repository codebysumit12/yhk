import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ 
  message = "You need to sign up to continue", 
  type = "info", 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Call onClose after animation completes
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className={`notification-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`notification notification-${type} ${isVisible ? 'slide-in' : 'slide-out'}`}>
        <div className="notification-content">
          <div className="notification-icon">
            {type === 'info' && 'i'}
            {type === 'warning' && '!'}
            {type === 'error' && 'x'}
            {type === 'success' && 'v'}
          </div>
          <div className="notification-message">
            <h4>Authentication Required</h4>
            <p>{message}</p>
            <div className="notification-actions">
              <button className="notification-btn primary" onClick={handleClose}>
                Sign Up Now
              </button>
            </div>
          </div>
          <button className="notification-close" onClick={handleClose}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
