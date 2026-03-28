import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [tab, setTab] = useState('email'); // 'email' | 'phone'

  // ── Email login state ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: 'sumitkhekare@gmail.com',
    password: 'sumit123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Registration state ─────────────────────────────────────────────────────
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Phone login state ──────────────────────────────────────────────────────
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState('input'); // 'input' | 'otp' | 'verified'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(60);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Refs
  const otpInputsRef = useRef([]);
  const isVerifyingRef = useRef(false);
  const otpExpiredRef = useRef(false);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaRenderedRef = useRef(false);

  // ── Resend timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── OTP expiry countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (phoneStep !== 'otp') return;
    if (otpExpiryTimer <= 0) {
      otpExpiredRef.current = true;
      return;
    }
    const t = setTimeout(() => setOtpExpiryTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpExpiryTimer, phoneStep]);

  // ── reCAPTCHA helpers ──────────────────────────────────────────────────────
  const clearRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    const el = document.getElementById('auth-recaptcha-container');
    if (el) el.innerHTML = '';
    recaptchaRenderedRef.current = false;
  }, []);

  const initRecaptcha = useCallback(() => new Promise((resolve, reject) => {
    if (recaptchaRenderedRef.current && recaptchaVerifierRef.current) {
      return resolve(recaptchaVerifierRef.current);
    }
    const container = document.getElementById('auth-recaptcha-container');
    if (!container) return reject(new Error('reCAPTCHA container missing'));

    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    container.innerHTML = '';

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'auth-recaptcha-container',
        {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => clearRecaptcha(),
        }
      );
      recaptchaVerifierRef.current
        .render()
        .then(() => {
          recaptchaRenderedRef.current = true;
          resolve(recaptchaVerifierRef.current);
        })
        .catch(err => {
          clearRecaptcha();
          reject(err);
        });
    } catch (err) {
      clearRecaptcha();
      reject(err);
    }
  }), [clearRecaptcha]);

  // Pre-init reCAPTCHA when phone tab + input step is visible
  useEffect(() => {
    if (tab !== 'phone' || phoneStep !== 'input') return;
    const t = setTimeout(() => {
      initRecaptcha().catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [tab, phoneStep, initRecaptcha]);

  // Cleanup on unmount
  useEffect(() => () => clearRecaptcha(), [clearRecaptcha]);

  // ── Switch mode ────────────────────────────────────────────────────────────
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setRegisterErrors({});
    if (newMode === 'register') {
      setRegisterData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
      });
    }
  };

  // ── Switch tab ─────────────────────────────────────────────────────────────
  const switchTab = (newTab) => {
    setTab(newTab);
    setError('');
    setSuccess('');
    setRegisterErrors({});
    if (newTab === 'email') clearRecaptcha();
    if (newTab === 'phone') {
      setPhoneStep('input');
      setPhoneNumber('');
      setOtp(['', '', '', '', '', '']);
      setPhoneError('');
      setOtpError('');
      otpExpiredRef.current = false;
      setOtpExpiryTimer(60);
      setResendTimer(0);
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateRegisterForm = () => {
    const errors = {};

    // Name validation
    if (!registerData.name || registerData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(registerData.name)) {
      errors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!registerData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!registerData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(registerData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number starting with 6-9';
    }

    // Password validation
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(registerData.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }

    // Confirm password validation
    if (!registerData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  // ── Registration handler ───────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setIsRegistering(true);
    setRegisterErrors({});
    setError('');

    try {
      console.log('🔍 Attempting registration:', registerData.email);

      const response = await fetch(`${API_CONFIG.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name.trim(),
          email: registerData.email.toLowerCase(),
          phone: registerData.phone,
          password: registerData.password,
          role: registerData.role
        })
      });

      const data = await response.json();
      console.log('📦 Registration response:', data);

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setSuccess('Registration successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          if (data.user.isAdmin || data.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (data.user.role === 'delivery_partner') {
            navigate('/delivery-app', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1500);
      } else {
        // Handle specific error messages
        if (data.message.includes('email')) {
          setRegisterErrors({ email: data.message });
        } else if (data.message.includes('phone')) {
          setRegisterErrors({ phone: data.message });
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // ── Email login ────────────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          if (data.user.isAdmin) navigate('/admin', { replace: true });
          else if (data.user.role === 'delivery_partner') navigate('/delivery-app', { replace: true });
          else navigate('/', { replace: true });
        }, 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOTP = useCallback(async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError('Enter a valid 10-digit number.');
      return;
    }
    setPhoneError('');
    setIsSendingOTP(true);
    try {
      const verifier = await initRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, verifier);
      setConfirmationResult(confirmation);
      otpExpiredRef.current = false;
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setOtpExpiryTimer(60);
      setResendTimer(45);
      setPhoneStep('otp');
    } catch (err) {
      clearRecaptcha();
      if (err.code === 'auth/too-many-requests') setPhoneError('Too many attempts. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number') setPhoneError('Invalid phone number.');
      else setPhoneError('Failed to send OTP. Try again.');
    } finally {
      setIsSendingOTP(false);
    }
  }, [phoneNumber, initRecaptcha, clearRecaptcha]);

  // ── OTP input ──────────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6 && !otpExpiredRef.current) {
      handleVerifyOTP(next.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOTP = async (otpOverride) => {
    const val = otpOverride || otp.join('');
    if (val.length < 6) {
      setOtpError('Enter all 6 digits.');
      return;
    }
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    if (otpExpiredRef.current) {
      setOtpError('OTP expired. Request a new one.');
      isVerifyingRef.current = false;
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const result = await confirmationResult.confirm(val);
      setPhoneStep('verified');
      otpExpiredRef.current = false;
      setOtpExpiryTimer(0);

      const phone = result.user.phoneNumber;
      try {
        const resp = await fetch(`${API_CONFIG.API_URL}/auth/firebase-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uid: result.user.uid, 
            phone: phone, 
            name: null, 
            email: null 
          }),
        });
        const data = await resp.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setSuccess('Phone verified! Redirecting...');
          setTimeout(() => {
            if (data.user.isAdmin) navigate('/admin', { replace: true });
            else if (data.user.role === 'delivery_partner') navigate('/delivery-app', { replace: true });
            else navigate('/', { replace: true });
          }, 1000);
        } else {
          localStorage.setItem('verifiedPhone', phone);
          setSuccess('Phone verified! Redirecting...');
          setTimeout(() => navigate('/', { replace: true }), 1000);
        }
      } catch {
        localStorage.setItem('verifiedPhone', phone);
        setSuccess('Phone verified! Redirecting...');
        setTimeout(() => navigate('/', { replace: true }), 1000);
      }
    } catch (err) {
      if (err.code === 'auth/code-expired') setOtpError('OTP expired. Request a new one.');
      else if (err.code === 'auth/invalid-verification-code') setOtpError('Incorrect OTP. Try again.');
      else setOtpError('Verification failed. Try again.');
    } finally {
      setIsVerifyingOTP(false);
      isVerifyingRef.current = false;
    }
  };

  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0) return;
    clearRecaptcha();
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    otpExpiredRef.current = false;
    setOtpExpiryTimer(60);
    await handleSendOTP();
  }, [resendTimer, clearRecaptcha, handleSendOTP]);

  const handleChangePhone = () => {
    setPhoneStep('input');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    otpExpiredRef.current = false;
    setOtpExpiryTimer(60);
    setResendTimer(0);
    setConfirmationResult(null);
    clearRecaptcha();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page-modern">
      {/* reCAPTCHA */}
      <div id="auth-recaptcha-container" style={{ display: 'none' }} />

      {/* Background */}
      <div className="auth-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="floating-elements">
          {[
            ['🥗', '10%', '8%', '0s'],
            ['🥑', '20%', null, '2s', '12%'],
            ['🍇', null, '15%', '4s', null, '10%'],
            ['🥕', null, '25%', '1s', null, '8%'],
            ['🥦', '50%', '5%', '3s'],
            ['🍓', '60%', null, '5s', null, '6%']
          ].map(([icon, top, bottom, delay, right, left], i) => (
            <span
              key={i}
              className="float-item"
              style={{
                top,
                bottom,
                left: left || (right ? undefined : '8%'),
                right,
                animationDelay: delay,
              }}
            >
              {icon}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="auth-card-modern">
        {/* Left brand panel */}
        <div className="auth-brand-panel">
          <div className="brand-overlay" />
          <div className="brand-content-modern">
            <div className="brand-logo-modern">
              <div className="logo-wrapper">
                <div className="logo-glow" />
                <span className="logo-emoji">🍽️</span>
              </div>
            </div>
            <h1 className="brand-title-modern">
              Yeswanth's<br />
              <span className="brand-highlight">Healthy Kitchen</span>
            </h1>
            <p className="brand-subtitle-modern">Experience the joy of healthy eating</p>
            <div className="brand-features-modern">
              {['100% Fresh Ingredients', 'Farm to Table', 'Zero Preservatives'].map(f => (
                <div key={f} className="feature-badge">
                  <span className="feature-icon">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="decorative-image">
              <div className="image-placeholder">
                <span className="placeholder-icon">🥗🥑🍇</span>
                <div className="image-glow" />
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="form-container-modern">
            <div className="form-header-modern">
              <h2 className="form-title">
                {mode === 'login' ? 'Welcome Back!' : 'Join Us Today!'}
              </h2>
              <p className="form-subtitle">
                {mode === 'login' 
                  ? 'Sign in to continue your healthy journey' 
                  : 'Create your account and start your healthy journey'}
              </p>
            </div>

            {/* Mode switcher */}
            <div style={{
              display: 'flex',
              gap: 0,
              marginBottom: 24,
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {[
                ['login', '🔑 Login'],
                ['register', '📝 Register']
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchMode(key)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.2s',
                    background: mode === key ? '#22c55e' : 'white',
                    color: mode === key ? 'white' : '#64748b',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab switcher (only for login mode) */}
            {mode === 'login' && (
              <div style={{
                display: 'flex',
                gap: 0,
                marginBottom: 28,
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {[
                  ['email', '📧 Email'],
                  ['phone', '📱 Phone']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTab(key)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 14,
                      transition: 'all 0.2s',
                      background: tab === key ? '#22c55e' : 'white',
                      color: tab === key ? 'white' : '#64748b',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Alerts */}
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

            {/* ════════════════ REGISTRATION FORM ════════════════ */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="auth-form-modern">
                {/* Full Name */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">👤</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={e => {
                      setRegisterData({ ...registerData, name: e.target.value });
                      setRegisterErrors({ ...registerErrors, name: '' });
                    }}
                    placeholder="Enter your full name"
                    className={`input-field-modern ${registerErrors.name ? 'input-error' : ''}`}
                  />
                  {registerErrors.name && (
                    <span className="field-error">{registerErrors.name}</span>
                  )}
                </div>

                {/* Email */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">📧</span> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={e => {
                      setRegisterData({ ...registerData, email: e.target.value });
                      setRegisterErrors({ ...registerErrors, email: '' });
                    }}
                    placeholder="your.email@example.com"
                    className={`input-field-modern ${registerErrors.email ? 'input-error' : ''}`}
                  />
                  {registerErrors.email && (
                    <span className="field-error">{registerErrors.email}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">📱</span> Phone Number
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      padding: '14px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 12,
                      background: '#f8fafc',
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                    }}>
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      maxLength="10"
                      value={registerData.phone}
                      onChange={e => {
                        setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, '') });
                        setRegisterErrors({ ...registerErrors, phone: '' });
                      }}
                      placeholder="10-digit number"
                      className={`input-field-modern ${registerErrors.phone ? 'input-error' : ''}`}
                      style={{ flex: 1 }}
                    />
                  </div>
                  {registerErrors.phone && (
                    <span className="field-error">{registerErrors.phone}</span>
                  )}
                </div>

                {/* Password */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">🔒</span> Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registerData.password}
                      onChange={e => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        setRegisterErrors({ ...registerErrors, password: '' });
                      }}
                      placeholder="At least 6 characters"
                      className={`input-field-modern ${registerErrors.password ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <span className="field-error">{registerErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">🔒</span> Confirm Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={e => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value });
                        setRegisterErrors({ ...registerErrors, confirmPassword: '' });
                      }}
                      placeholder="Re-enter your password"
                      className={`input-field-modern ${registerErrors.confirmPassword ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <span className="field-error">{registerErrors.confirmPassword}</span>
                  )}
                </div>

                {/* Role Selection */}
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">🎭</span> I want to join as
                  </label>
                  <select
                    value={registerData.role}
                    onChange={e => setRegisterData({ ...registerData, role: e.target.value })}
                    className="input-field-modern"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="customer">🛒 Customer - Order delicious meals</option>
                    <option value="delivery_partner">🛵 Delivery Partner - Join our team</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn-modern" disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ════════════════ EMAIL LOGIN ════════════════ */}
            {mode === 'login' && tab === 'email' && (
              <form onSubmit={handleEmailLogin} className="auth-form-modern">
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">📧</span> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="input-field-modern"
                  />
                </div>
                <div className="input-group-modern">
                  <label className="input-label-modern">
                    <span className="label-icon-modern">🔒</span> Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="input-field-modern"
                  />
                </div>
                <button type="submit" className="submit-btn-modern" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
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
            )}

            {/* ════════════════ PHONE LOGIN ════════════════ */}
            {mode === 'login' && tab === 'phone' && (
              <div>
                {phoneStep === 'input' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input-group-modern">
                      <label className="input-label-modern">
                        <span className="label-icon-modern">📱</span> Mobile Number
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{
                          padding: '14px 12px',
                          border: '2px solid #e2e8f0',
                          borderRadius: 12,
                          background: '#f8fafc',
                          fontSize: 15,
                          whiteSpace: 'nowrap',
                        }}>
                          🇮🇳 +91
                        </div>
                        <input
                          type="tel"
                          maxLength="10"
                          value={phoneNumber}
                          onChange={e => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ''));
                            setPhoneError('');
                          }}
                          onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                          placeholder="10-digit number"
                          className="input-field-modern"
                          style={{ flex: 1 }}
                        />
                      </div>
                      {phoneError && (
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#ef4444' }}>
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="submit-btn-modern"
                      onClick={handleSendOTP}
                      disabled={isSendingOTP}
                    >
                      {isSendingOTP ? (
                        <>
                          <span className="btn-spinner" />
                          <span>Sending OTP…</span>
                        </>
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <span className="btn-arrow">→</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {phoneStep === 'otp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#f0fdf4',
                      borderRadius: 10,
                      border: '1px solid #86efac',
                      fontSize: 14,
                    }}>
                      <span>
                        OTP sent to <strong>+91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleChangePhone}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#22c55e',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '.7px',
                      }}>
                        Enter 6-digit OTP
                      </label>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => (otpInputsRef.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            disabled={otpExpiredRef.current}
                            style={{
                              width: 46,
                              height: 52,
                              textAlign: 'center',
                              fontSize: 22,
                              fontWeight: 700,
                              border: `2px solid ${otpError ? '#ef4444' : digit ? '#22c55e' : '#e2e8f0'}`,
                              borderRadius: 10,
                              outline: 'none',
                              background: digit ? '#f0fdf4' : '#f8fafc',
                              transition: 'all 0.15s',
                            }}
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                          {otpError}
                        </p>
                      )}
                    </div>

                    <div style={{
                      fontSize: 13,
                      color: otpExpiryTimer === 0 ? '#ef4444' : '#64748b',
                      textAlign: 'center'
                    }}>
                      {otpExpiryTimer > 0
                        ? `⏱️ OTP valid for ${otpExpiryTimer}s`
                        : '⏰ OTP expired — please resend'}
                    </div>

                    <button
                      type="button"
                      className="submit-btn-modern"
                      onClick={() => handleVerifyOTP()}
                      disabled={isVerifyingOTP || otpExpiredRef.current}
                    >
                      {isVerifyingOTP ? (
                        <>
                          <span className="btn-spinner" />
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <span className="btn-arrow">→</span>
                        </>
                      )}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
                      Didn't receive it?{' '}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: resendTimer > 0 ? 'default' : 'pointer',
                          color: resendTimer > 0 ? '#9ca3af' : '#22c55e',
                          fontWeight: 600,
                          fontSize: 13,
                          padding: 0,
                        }}
                      >
                        Resend OTP{resendTimer > 0 && ` (${resendTimer}s)`}
                      </button>
                    </p>
                  </div>
                )}

                {phoneStep === 'verified' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: 12,
                    border: '1.5px solid #86efac',
                  }}>
                    <span style={{ fontSize: 28 }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>Phone Verified!</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        +91 {phoneNumber.slice(0, 5)} {phoneNumber.slice(5)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="form-footer-modern">
              <div className="footer-links-modern">
                <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
                <span className="link-divider">•</span>
                <a href="/terms" className="footer-link">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="trust-badges">
        {[
          ['🔒', 'Secure & Encrypted'],
          ['⚡', 'Fast & Reliable'],
          ['💚', '100% Organic']
        ].map(([icon, text]) => (
          <div key={text} className="trust-badge">
            <span className="trust-icon">{icon}</span>
            <span className="trust-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auth;