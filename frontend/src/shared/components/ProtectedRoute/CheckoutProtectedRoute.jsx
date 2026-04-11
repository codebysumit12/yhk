import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Notification from '../Notification/Notification';

const CheckoutProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const userStr = localStorage.getItem('user');
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClose = () => {
    setShowNotification(false);
    // Store current path for redirect after signup
    localStorage.setItem('redirectAfterAuth', '/checkout');
    navigate('/auth?mode=signup');
  };

  const handleCheckoutClick = () => {
    if (!token || !userStr) {
      setShowNotification(true);
      return false;
    }
    return true;
  };

  if (!token || !userStr) {
    return (
      <>
        {showNotification && (
          <Notification
            message="Your food is waiting — sign up to place your order"
            type="info"
            duration={30000}
            onClose={handleNotificationClose}
          />
        )}
        <div onClick={handleCheckoutClick}>
          {children}
        </div>
      </>
    );
  }

  // User is authenticated, render children normally
  return children;
};

export default CheckoutProtectedRoute;
