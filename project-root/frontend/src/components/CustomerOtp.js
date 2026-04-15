import React, { useState } from 'react';
import { API_CONFIG } from '../config/api';
import './CustomerOtp.css';

const CustomerOtp = ({ activeOrder, onClose, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Send OTP to customer
  const sendOtpToCustomer = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: activeOrder.customer.phone 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP sent to customer successfully!');
        console.log('✅ OTP sent to customer:', activeOrder.customer.phone);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and confirm delivery
  const verifyOtpAndConfirm = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First verify OTP
      const otpResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: activeOrder.customer.phone,
          otp: otp,
          name: activeOrder.customer.name 
        })
      });

      const otpData = await otpResponse.json();

      if (!otpData.success) {
        setError(otpData.message || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Then confirm delivery
      const token = localStorage.getItem('token') || '';
      const deliveryResponse = await fetch(`${API_CONFIG.BASE_URL}/api/orders/${activeOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'delivered' })
      });

      const deliveryData = await deliveryResponse.json();

      if (deliveryData.success) {
        setSuccess('Delivery confirmed successfully!');
        console.log('✅ Order delivered:', activeOrder.orderNumber);
        
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(deliveryData.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('❌ Confirm delivery error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-otp-container">
      <div className="customer-otp-modal">
        <div className="customer-otp-header">
          <h3>🔐 Confirm Delivery</h3>
          <button className="close-btn" onClick={onClose} disabled={loading}>✕</button>
        </div>
        
        <div className="customer-otp-body">
          <div className="order-summary">
            <p><strong>Order:</strong> {activeOrder.orderNumber}</p>
            <p><strong>Customer:</strong> {activeOrder.customer.name}</p>
            <p><strong>Phone:</strong> {activeOrder.customer.phone}</p>
            <p><strong>Address:</strong> {activeOrder.deliveryAddress?.street}, {activeOrder.deliveryAddress?.city}</p>
            {activeOrder.paymentMethod === 'cod' && (
              <p className="cod-note">
                💵 Collect <strong>₹{activeOrder.pricing?.total}</strong> cash from customer
              </p>
            )}
          </div>

          <div className="otp-section">
            <p className="otp-instruction">
              Send OTP to customer's phone number
            </p>
            
            <button 
              className="send-otp-btn"
              onClick={sendOtpToCustomer}
              disabled={loading}
            >
              {loading ? '📤 Sending...' : '📱 Send OTP to Customer'}
            </button>

            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="verify-section">
            <p className="verify-instruction">
              Enter 6-digit OTP from customer:
            </p>
            
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="otp-input"
              disabled={loading}
            />
            
            <button 
              className="verify-btn"
              onClick={verifyOtpAndConfirm}
              disabled={loading || otp.length !== 6}
            >
              {loading ? '🔄 Confirming...' : '✅ Confirm Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOtp;
