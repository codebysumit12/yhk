import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
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
    
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Success - navigate to login
          navigate('/login');
        } else {
          // API returned error
          setErrors({ api: data.error || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        // Network error
        setErrors({ api: 'Unable to connect to server. Please make sure the backend is running.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signing up with ${provider}`);
    // Implement social signup logic here
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
        {/*        <i className="fas fa-user-plus"></i>  */}
            </div>
            <h1>Create Account!</h1>
            <p>Join Yeswanth's Healthy Kitchen today</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className={`form-group ${errors.name ? 'error' : ''}`}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            {/* <i className="fas fa-user input-icon"></i> */}
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
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
                autoComplete="new-password"
              />
        {/*        <i className="fas fa-lock input-icon"></i>*/}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
           {/*  <i className="fas fa-lock input-icon"></i>*/}   
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            
            <div className={`form-options ${errors.terms ? 'error' : ''}`}>
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>I agree to the <Link to="">Terms</Link> and <Link to="">Conditions</Link></span>
              </label>
              {errors.terms && <span className="error-message" style={{display: 'block'}}>{errors.terms}</span>}
            </div>
            
            {errors.api && <div className="api-error-message">{errors.api}</div>}
            
            <button type="submit" className={`auth-btn ${isLoading ? 'loading' : ''}`}>
              {isLoading && <span className="spinner"></span>}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="social-divider">
            <span>or continue with</span>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button" 
              className="social-btn google"
              onClick={() => handleSocialSignup('google')}
            >
              <i className="fab fa-google"></i>
              Google
            </button>
            <button 
              type="button" 
              className="social-btn facebook"
              onClick={() => handleSocialSignup('facebook')}
            >
              <i className="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;