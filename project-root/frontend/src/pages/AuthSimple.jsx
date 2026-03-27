import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import YHKLoader from '../customer-view/pages/Yhkloader';
import './Auth.css';

const AuthSimple = () => {
  const [formData, setFormData] = useState({
    email: 'sumitkhekare@gmail.com',
    password: 'sumit123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful! Redirecting...');
        
        // Redirect based on user role
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
    <div className="auth-page">
      {/* Main Container */}
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <h1>🍕 YHK</h1>
            <h2>Yeswanth's Healthy Kitchen</h2>
            <p>Delicious meals, delivered fresh!</p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Form Header */}
            <div className="form-header">
              <h2>🎉 Welcome Back!</h2>
              <p>Login to explore delicious meals</p>
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
            <form onSubmit={handleLogin} className="auth-form">
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
                  placeholder="Enter your email"
                  required
                />
              </div>

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

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <YHKLoader message="Logging in..." />
                ) : (
                  <span>🚀 Login</span>
                )}
              </button>
            </form>

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
                Don't have an account?
                <button 
                  type="button" 
                  className="toggle-btn"
                  onClick={() => navigate('/auth')}
                >
                  🎉 Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSimple;
