import React, { useState } from 'react';
import './Auth.css';
import { API_CONFIG } from '../config/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const API_URL = API_CONFIG.API_URL;

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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
  // ✅ Save token and user to localStorage FIRST
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  setSuccess('Login successful!');
        // Redirect based on role
        setTimeout(() => {
          if (data.user.isAdmin || data.user.role === 'admin') {
            window.location.href = '/admin';      // → Admin dashboard
          } else {
            window.location.href = '/customer';       // → Customer view
          }
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account created! Please login.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            name: '',
            email: formData.email,
            phone: '',
            password: '',
            confirmPassword: ''
          });
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
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
              Yashwanth's
              <br />
              <span className="highlight">Healthy Kitchen</span>
            </h1>
            <p className="brand-tagline">
              Where every bite tells a story of health & happiness! 🌿
            </p>
            
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

            {/* Auth Form */}
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
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    <span className="btn-icon">{isLogin ? '🚀' : '🎊'}</span>
                    {isLogin ? 'Login to Continue' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="toggle-auth">
              <p>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={toggleMode} className="toggle-btn">
                  {isLogin ? '✨ Sign Up' : '🎉 Login'}
                </button>
              </p>
            </div>

            {/* Quick Info */}
            <div className="quick-info">
              <p className="info-text">
                🔒 Your data is safe with us
              </p>
              <div className="footer-links">
                <a href="/privacy-policy" className="privacy-link">
                  Privacy Policy
                </a>
                <span className="link-separator">•</span>
                <a href="/terms" className="privacy-link">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;