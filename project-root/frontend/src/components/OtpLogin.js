import React, { useState } from 'react';
import { API_CONFIG } from '../config/api';
import './OtpLogin.css';

const OtpLogin = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP sent successfully!');
        setStep('otp');
        console.log('✅ OTP sent to:', phone);
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

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, name })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful!');
        console.log('✅ OTP verified, user:', data.user);
        
        // Call parent callback
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-login-container">
      <div className="otp-login-card">
        <h2>Delivery Partner Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 'phone' ? (
          <form onSubmit={sendOTP} className="otp-form">
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                required
                className="phone-input"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !phone}
              className="send-otp-btn"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="otp-form">
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                disabled
                className="phone-input disabled"
              />
            </div>

            <div className="form-group">
              <label>OTP Code:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="otp-input"
              />
            </div>

            <div className="form-group">
              <label>Name (for new users):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="name-input"
              />
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading || !otp}
                className="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="back-btn"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OtpLogin;
