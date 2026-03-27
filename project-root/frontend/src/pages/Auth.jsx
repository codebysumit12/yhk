import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import YHKLoader from '../customer-view/pages/Yhkloader';
import './Auth.css';

const Auth = () => {
  const [formData, setFormData] = useState({
    email: 'sumitkhekare@gmail.com',
    password: 'sumit123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Attempting login with:', formData.email);
      
      const response = await fetch(`${API_CONFIG.API_URL}/auth/login`, {
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
      console.log('📦 Login response:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          if (data.user.isAdmin) {
            navigate('/admin', { replace: true });
          } else if (data.user.role === 'delivery_partner') {
            navigate('/delivery-app', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        
        {/* Floating Food Icons */}
        <div className="floating-elements">
          <span className="float-item" style={{ top: '10%', left: '8%', animationDelay: '0s' }}>🥗</span>
          <span className="float-item" style={{ top: '20%', right: '12%', animationDelay: '2s' }}>🥑</span>
          <span className="float-item" style={{ bottom: '15%', left: '10%', animationDelay: '4s' }}>🍇</span>
          <span className="float-item" style={{ bottom: '25%', right: '8%', animationDelay: '1s' }}>🥕</span>
          <span className="float-item" style={{ top: '50%', left: '5%', animationDelay: '3s' }}>🥦</span>
          <span className="float-item" style={{ top: '60%', right: '6%', animationDelay: '5s' }}>🍓</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="auth-card-modern">
        {/* Left Panel - Brand Section */}
        <div className="auth-brand-panel">
          <div className="brand-overlay"></div>
          <div className="brand-content-modern">
            {/* Logo */}
            <div className="brand-logo-modern">
              <div className="logo-wrapper">
                <div className="logo-glow"></div>
                <span className="logo-emoji">🍽️</span>
              </div>
            </div>

            {/* Brand Text */}
            <h1 className="brand-title-modern">
              Yeswanth's<br />
              <span className="brand-highlight">Healthy Kitchen</span>
            </h1>
            <p className="brand-subtitle-modern">
              Experience the joy of healthy eating
            </p>

            {/* Features */}
            <div className="brand-features-modern">
              <div className="feature-badge">
                <span className="feature-icon">✓</span>
                <span>100% Fresh Ingredients</span>
              </div>
              <div className="feature-badge">
                <span className="feature-icon">✓</span>
                <span>Farm to Table</span>
              </div>
              <div className="feature-badge">
                <span className="feature-icon">✓</span>
                <span>Zero Preservatives</span>
              </div>
            </div>

            {/* Decorative Image */}
            <div className="decorative-image">
              <div className="image-placeholder">
                <span className="placeholder-icon">🥗🥑🍇</span>
                <div className="image-glow"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="auth-form-panel">
          <div className="form-container-modern">
            {/* Header */}
            <div className="form-header-modern">
              <h2 className="form-title">Welcome Back!</h2>
              <p className="form-subtitle">Sign in to continue your healthy journey</p>
            </div>

            {/* Success Alert */}
            {success && (
              <div className="alert-modern alert-success">
                <div className="alert-icon-wrapper success">
                  <span className="checkmark">✓</span>
                </div>
                <div className="alert-content">
                  <strong>Success!</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert-modern alert-error">
                <div className="alert-icon-wrapper error">
                  <span className="error-icon">✕</span>
                </div>
                <div className="alert-content">
                  <strong>Error</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="auth-form-modern">
              {/* Email Input */}
              <div className="input-group-modern">
                <label className="input-label-modern">
                  <span className="label-icon-modern">📧</span>
                  Email Address
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="input-field-modern"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group-modern">
                <label className="input-label-modern">
                  <span className="label-icon-modern">🔒</span>
                  Password
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input-field-modern"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn-modern"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="form-footer-modern">
              <div className="footer-links-modern">
                <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
                <span className="link-divider">•</span>
                <a href="/terms" className="footer-link">Terms of Service</a>
              </div>

              <div className="signup-prompt">
                <p>Don't have an account?</p>
                <button 
                  type="button"
                  className="signup-btn"
                  onClick={() => navigate('/auth')}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="trust-badge">
          <span className="trust-icon">🔒</span>
          <span className="trust-text">Secure & Encrypted</span>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">⚡</span>
          <span className="trust-text">Fast & Reliable</span>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">💚</span>
          <span className="trust-text">100% Organic</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;