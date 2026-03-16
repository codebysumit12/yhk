import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Login successful!');
        
        setTimeout(() => {
          if (data.user.isAdmin || data.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/customer';
          }
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setConfirmationResult(null);
    setOtp('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    if (usePhoneAuth && !recaptchaVerifierRef.current) {
      try {
        // ✅ FIXED: Use new Firebase v9+ syntax
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'invisible',
            callback: (response) => {
              console.log('✅ reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA expired');
            }
          },
          auth  // ✅ Pass auth as third parameter
        );
      } catch (error) {
        console.error('❌ reCAPTCHA init error:', error);
      }
    }
  }, [usePhoneAuth]);

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const phoneNumber = `+91${formData.phone}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess('OTP sent to your phone!');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      console.error('OTP send error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Create or update user in your backend
      const response = await fetch(`${API_URL}/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          phone: user.phoneNumber,
          name: formData.name || 'User'
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Login successful!');
        
        setTimeout(() => {
          if (data.user.isAdmin || data.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/customer';
          }
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Floating Food Elements */}
      <div className="floating-food food-1">🍕</div>
      <div className="floating-food food-2">🍔</div>
      <div className="floating-food food-3">🍜</div>
      <div className="floating-food food-4">🍰</div>
      <div className="floating-food food-5">🥗</div>
      <div className="floating-food food-6">🍱</div>
      <div className="floating-food food-7">🌮</div>
      <div className="floating-food food-8">🍩</div>

      {/* Main Container */}
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-circle">
                <span className="logo-icon">🍽️</span>
              </div>
            </div>
            <h1 className="brand-name">
              Yeswanth's
              <br />
              <span className="highlight">Healthy Kitchen</span>
            </h1>
            <p className="brand-tagline">
              Your Complete Food Ordering & Delivery Platform �️
            </p>
            
            <div className="brand-description">
              <h3>Welcome to Yeswanth's Healthy Kitchen!</h3>
              <p>
                Your ultimate food ordering and delivery platform for healthy, delicious meals. 
                We connect you with nutritious food options from local kitchens, 
                making healthy eating convenient and enjoyable.
              </p>
              <p>
                Order fresh, organic meals crafted with love and delivered fast to your doorstep. 
                Whether you're looking for meal prep, dietary-specific options, or just want to eat healthier - 
                Yeswanth's Healthy Kitchen has you covered!
              </p>
            </div>
            
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Fresh & Organic</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Fast Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">❤️</span>
                <span>Made with Love</span>
              </div>
            </div>

            {/* Happy Mascot */}
            <div className="mascot">
              <div className="mascot-character">
                😋
              </div>
              <div className="mascot-speech">
                {isLogin ? "Welcome back, foodie!" : "Join our food family!"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Form Header */}
            <div className="form-header">
              <h2>{isLogin ? '🎉 Welcome Back!' : '🌟 Join Us!'}</h2>
              <p>
                {isLogin 
                  ? 'Login to explore delicious meals' 
                  : 'Create your account and start your food journey'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Auth Method Toggle */}
            <div className="auth-method-toggle">
              <button 
                type="button" 
                className={`auth-method-btn ${!usePhoneAuth ? 'active' : ''}`}
                onClick={() => setUsePhoneAuth(false)}
              >
                📧 Email & Password
              </button>
              <button 
                type="button" 
                className={`auth-method-btn ${usePhoneAuth ? 'active' : ''}`}
                onClick={() => setUsePhoneAuth(true)}
              >
                📱 Phone Number
              </button>
            </div>

            {/* reCAPTCHA Container */}
            <div id="recaptcha-container"></div>

            {/* Auth Form */}
            {!usePhoneAuth ? (
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
                {/* Name Field (Signup Only) */}
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="name">
                      <span className="label-icon">👤</span>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {/* Phone Field (Signup Only) */}
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="phone">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password">
                    <span className="label-icon">🔒</span>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    minLength="6"
                  />
                </div>

                {/* Confirm Password (Signup Only) */}
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <span className="label-icon">🔑</span>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required={!isLogin}
                      minLength="6"
                    />
                  </div>
                )}

                {/* Forgot Password Link (Login Only) */}
                {isLogin && (
                  <div className="form-extras">
                    <button type="button" className="forgot-link" onClick={(e) => { e.preventDefault(); /* Add forgot password logic */ }}>
                      Forgot Password? 🤔
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner">⏳ {isLogin ? 'Logging in...' : 'Creating account...'}</span>
                  ) : (
                    <span>{isLogin ? '🚀 Login' : '🎉 Create Account'}</span>
                  )}
                </button>
              </form>
            ) : (
              /* Phone Auth Form */
              !otpSent ? (
                <form onSubmit={handleSendOTP} className="auth-form">
                  {/* Name Field (Signup Only) */}
                  {!isLogin && (
                    <div className="form-group">
                      <label htmlFor="name">
                        <span className="label-icon">👤</span>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {/* Phone Field */}
                  <div className="form-group">
                    <label htmlFor="phone">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                    />
                    <small>We'll send a 6-digit OTP to this number</small>
                  </div>

                  {/* Send OTP Button */}
                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner">⏳ Sending OTP...</span>
                    ) : (
                      <span>📤 Send OTP</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="auth-form">
                  {/* OTP Field */}
                  <div className="form-group">
                    <label htmlFor="otp">
                      <span className="label-icon">🔢</span>
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                    />
                    <small>Enter the 6-digit OTP sent to {formData.phone}</small>
                  </div>

                  {/* Verify OTP Button */}
                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner">⏳ Verifying...</span>
                    ) : (
                      <span>✅ Verify OTP</span>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <button 
                    type="button" 
                    className="resend-otp-btn"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      handleSendOTP(new Event('submit'));
                    }}
                    disabled={loading}
                  >
                    🔄 Resend OTP
                  </button>
                </form>
              )
            )}

            {/* Privacy Policy Link */}
            <div className="privacy-link">
              <a href="/privacy-policy" className="privacy-policy-link">
                🔒 Privacy Policy
              </a>
              <span className="separator">•</span>
              <a href="/terms" className="terms-link">
                📋 Terms of Service
              </a>
            </div>

            {/* Toggle Auth Mode */}
            <div className="auth-toggle">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button" 
                  className="toggle-btn"
                  onClick={toggleMode}
                >
                  {isLogin ? '🎉 Sign Up' : '🔐 Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
