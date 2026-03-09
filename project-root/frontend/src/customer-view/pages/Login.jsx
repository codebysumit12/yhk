import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Call the login API
        const response = await fetch('http://localhost:5001/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          // Store token in localStorage
          if (data.data.token) {
            localStorage.setItem('token', data.data.token);
          }
          
          // Check if admin login
          if (data.data.isAdmin) {
            // Redirect to admin panel
            window.location.href = data.data.redirectUrl;
          } else {
            // Regular user - navigate to home
            navigate('/');
          }
        } else {
          // Show error
          setErrors({ ...errors, password: data.error || 'Login failed' });
        }
      } catch (err) {
        setErrors({ ...errors, password: 'Server error. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
          <i className="fas fa-utensils"></i>
            </div>
            <h1>Welcome Back!</h1>
            <p>Sign in to continue to Yeswanth's Healthy Kitchen</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
        {/*       <i className="fas fa-envelope input-icon"></i> */}
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className={`form-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            {/*     <i className="fas fa-lock input-icon"></i> */}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="" className="forgot-password">Forgot Password?</Link>
            </div>
            
            <button type="submit" className={`auth-btn ${isLoading ? 'loading' : ''}`}>
              {isLoading && <span className="spinner"></span>}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="social-divider">
            <span>or continue with</span>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button" 
              className="social-btn google"
              onClick={() => handleSocialLogin('google')}
            >
              <i className="fab fa-google"></i>
              Google
            </button>
            <button 
              type="button" 
              className="social-btn facebook"
              onClick={() => handleSocialLogin('facebook')}
            >
              <i className="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;