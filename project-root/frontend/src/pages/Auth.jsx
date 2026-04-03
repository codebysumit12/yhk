import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const GOOGLE_CLIENT_ID = '579329797638-hd52etnj43u7camu9qrh8ev8i53imukp.apps.googleusercontent.com';

/* ─── Swiggy-style micro components ──────────────────────────────── */

const Alert = ({ type, msg }) => msg ? (
  <div className={`sa-alert sa-alert--${type}`}>
    <span className="sa-alert__dot" />
    {msg}
  </div>
) : null;

const Spinner = () => <span className="sa-spinner" />;

const BackBtn = ({ to, goTo }) => (
  <button type="button" className="sa-back" onClick={() => goTo(to)}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  </button>
);

const FieldError = ({ msg }) => msg
  ? <span className="sa-field-error">{msg}</span>
  : null;

/* ─── SCREENS ─────────────────────────────────────────────────────── */

/* Landing: Phone + Email option, Google button — Swiggy exact */
const LandingScreen = ({ globalError, globalSuccess, goTo, onGoogleSuccess, handleTermsClick, handlePrivacyClick }) => (
  <div className="sa-screen">
    <h2 className="sa-title">Sign in or Sign up</h2>
    <Alert type="error" msg={globalError} />
    <Alert type="success" msg={globalSuccess} />

    {/* Phone CTA — primary Swiggy method */}
    <div className="sa-phone-banner">
      <div className="sa-phone-banner-text">
        <p className="sa-phone-banner-title">Use your mobile number</p>
        <p className="sa-phone-banner-sub">Get an OTP to sign in or sign up instantly</p>
      </div>
      <button className="sa-phone-banner-btn" onClick={() => goTo('phone')}>
        Continue
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    {/* Divider */}
    <div className="sa-or-divider"><span>or</span></div>

    {/* Google */}
    <div className="sa-google-row">
      <GoogleLogin
        onSuccess={onGoogleSuccess}
        onError={() => {}}
        useOneTap={false}
        shape="rectangular"
        size="large"
        width="380"
        text="signin_with"
      />
    </div>

    {/* Email link */}
    <button type="button" className="sa-email-link" onClick={() => goTo('email')}>
      Sign in with Email &amp; Password
    </button>

    <div className="sa-tnc">
      By continuing, you agree to our{' '}
      <button onClick={handleTermsClick} className="sa-text-btn">Terms of Service</button> and{' '}
      <button onClick={handlePrivacyClick} className="sa-text-btn">Privacy Policy</button>.
    </div>

    <div className="sa-register-prompt">
      New user?{' '}
      <button type="button" className="sa-text-btn" onClick={() => goTo('register')}>
        Create an account
      </button>
    </div>
  </div>
);

/* Phone number entry */
const PhoneScreen = ({ phone, setPhone, phoneError, setPhoneError, isSendingOTP, handleSendOTP, goTo, handleTermsClick, handlePrivacyClick }) => (
  <div className="sa-screen">
    <BackBtn to="landing" goTo={goTo} />
    <h2 className="sa-title">Enter your mobile number</h2>
    <p className="sa-subtitle">We'll send an OTP to verify your number</p>
    <Alert type="error" msg={phoneError} />

    <div className="sa-phone-input-wrap">
      <div className="sa-phone-country">
        <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2 }}>
          <rect width="20" height="4.67" y="0" fill="#FF9933"/>
          <rect width="20" height="4.66" y="4.67" fill="#fff"/>
          <rect width="20" height="4.67" y="9.33" fill="#138808"/>
          <circle cx="10" cy="7" r="2.1" fill="none" stroke="#000080" strokeWidth="0.4"/>
        </svg>
        <span>+91</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <input
        type="tel"
        maxLength="10"
        placeholder="Mobile number"
        value={phone}
        onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
        autoFocus
        className="sa-phone-input"
      />
    </div>

    <button
      type="button"
      className="sa-primary-btn"
      onClick={handleSendOTP}
      disabled={isSendingOTP || phone.length !== 10}
    >
      {isSendingOTP ? <><Spinner />Sending OTP…</> : 'Get OTP'}
    </button>

    <div className="sa-tnc">
      By continuing, you agree to our <button onClick={handleTermsClick} className="sa-text-btn">Terms</button> and <button onClick={handlePrivacyClick} className="sa-text-btn">Privacy Policy</button>.
    </div>
  </div>
);

/* OTP verification */
const OtpScreen = ({
  phone, otpDigits, otpError, otpTimer, resendTimer, isVerifyingOTP,
  otpExpired, handleOtpChange, handleOtpKeyDown, handleVerifyOTP, handleResendOTP,
  globalSuccess, goTo, otpRefs
}) => (
  <div className="sa-screen">
    <BackBtn to="phone" goTo={goTo} />
    <h2 className="sa-title">Enter OTP</h2>
    <p className="sa-subtitle">
      Sent to <strong>+91-{phone.slice(0,5)}-{phone.slice(5)}</strong>
      <button type="button" className="sa-text-btn" style={{ marginLeft: 8 }} onClick={() => goTo('phone')}>Change</button>
    </p>
    <Alert type="success" msg={globalSuccess} />
    <Alert type="error" msg={otpError} />

    <div className="sa-otp-row">
      {otpDigits.map((d, i) => (
        <input
          key={`otp-${i}`}
          ref={el => (otpRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={d}
          onChange={e => handleOtpChange(i, e.target.value)}
          onKeyDown={e => handleOtpKeyDown(i, e)}
          disabled={otpExpired}
          className={`sa-otp-cell ${d ? 'sa-otp-cell--filled' : ''} ${otpError ? 'sa-otp-cell--error' : ''}`}
        />
      ))}
    </div>

    <div className={`sa-otp-status ${otpTimer === 0 ? 'sa-otp-status--expired' : ''}`}>
      {otpTimer > 0 ? `OTP expires in ${otpTimer}s` : 'OTP expired'}
    </div>

    <button
      type="button"
      className="sa-primary-btn"
      onClick={() => handleVerifyOTP()}
      disabled={isVerifyingOTP || otpExpired || otpDigits.join('').length < 6}
    >
      {isVerifyingOTP ? <><Spinner />Verifying…</> : 'Verify & Continue'}
    </button>

    <p className="sa-resend">
      Didn't receive?{' '}
      <button
        type="button"
        className="sa-text-btn"
        onClick={handleResendOTP}
        disabled={resendTimer > 0}
        style={{ opacity: resendTimer > 0 ? .45 : 1 }}
      >
        Resend OTP{resendTimer > 0 ? ` in ${resendTimer}s` : ''}
      </button>
    </p>
  </div>
);

/* Email login */
const EmailScreen = ({
  globalError, globalSuccess, setGlobalError,
  emailVal, setEmailVal, passVal, setPassVal,
  showPass, setShowPass, emailLoading, handleEmailLogin, goTo
}) => (
  <div className="sa-screen">
    <BackBtn to="landing" goTo={goTo} />
    <h2 className="sa-title">Sign in with Email</h2>
    <Alert type="error" msg={globalError} />
    <Alert type="success" msg={globalSuccess} />
    <form onSubmit={handleEmailLogin} className="sa-form">
      <div className="sa-field">
        <label className="sa-label">Email address</label>
        <input
          type="email" required
          className="sa-input"
          placeholder="Enter your email"
          value={emailVal}
          onChange={e => { setEmailVal(e.target.value); setGlobalError(''); }}
          autoFocus
        />
      </div>
      <div className="sa-field">
        <label className="sa-label">Password</label>
        <div className="sa-input-wrap">
          <input
            type={showPass ? 'text' : 'password'} required minLength="6"
            className="sa-input"
            placeholder="Enter your password"
            value={passVal}
            onChange={e => { setPassVal(e.target.value); setGlobalError(''); }}
          />
          <button type="button" className="sa-eye-btn" onClick={() => setShowPass(p => !p)}>
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </div>
      <div className="sa-forgot-row">
        <button type="button" className="sa-text-btn">Forgot password?</button>
      </div>
      <button type="submit" className="sa-primary-btn" disabled={emailLoading}>
        {emailLoading ? <><Spinner />Signing in…</> : 'Sign In'}
      </button>
    </form>
    <p className="sa-register-prompt">
      Don't have an account?{' '}
      <button type="button" className="sa-text-btn" onClick={() => goTo('register')}>Create one</button>
    </p>
  </div>
);

/* Register */
const RegisterScreen = ({
  globalError, globalSuccess, reg, setReg, regErrors, setRegErrors,
  isRegistering, showRegPass, setShowRegPass, showRegConf, setShowRegConf,
  handleRegister, goTo, handleTermsClick, handlePrivacyClick
}) => (
  <div className="sa-screen">
    <BackBtn to="landing" goTo={goTo} />
    <h2 className="sa-title">Create account</h2>
    <p className="sa-subtitle">Fresh food awaits — sign up in 30 seconds</p>
    <Alert type="error" msg={globalError} />
    <Alert type="success" msg={globalSuccess} />
    <form onSubmit={handleRegister} className="sa-form">
      <div className="sa-field">
        <label className="sa-label">Full name</label>
        <input
          type="text" className={`sa-input ${regErrors.name ? 'sa-input--err' : ''}`}
          placeholder="Your full name"
          value={reg.name}
          onChange={e => { setReg(r => ({ ...r, name: e.target.value })); setRegErrors(r => ({ ...r, name: '' })); }}
        />
        <FieldError msg={regErrors.name} />
      </div>
      <div className="sa-field">
        <label className="sa-label">Email</label>
        <input
          type="email" className={`sa-input ${regErrors.email ? 'sa-input--err' : ''}`}
          placeholder="you@example.com"
          value={reg.email}
          onChange={e => { setReg(r => ({ ...r, email: e.target.value })); setRegErrors(r => ({ ...r, email: '' })); }}
        />
        <FieldError msg={regErrors.email} />
      </div>
      <div className="sa-field">
        <label className="sa-label">Phone number</label>
        <div className="sa-phone-input-wrap">
          <div className="sa-phone-country">
            <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2 }}>
              <rect width="20" height="4.67" y="0" fill="#FF9933"/>
              <rect width="20" height="4.66" y="4.67" fill="#fff"/>
              <rect width="20" height="4.67" y="9.33" fill="#138808"/>
              <circle cx="10" cy="7" r="2.1" fill="none" stroke="#000080" strokeWidth="0.4"/>
            </svg>
            <span>+91</span>
          </div>
          <input
            type="tel" maxLength="10"
            className={`sa-phone-input ${regErrors.phone ? 'sa-input--err' : ''}`}
            placeholder="10-digit mobile number"
            value={reg.phone}
            onChange={e => { setReg(r => ({ ...r, phone: e.target.value.replace(/\D/g, '') })); setRegErrors(r => ({ ...r, phone: '' })); }}
          />
        </div>
        <FieldError msg={regErrors.phone} />
      </div>
      <div className="sa-fields-row">
        <div className="sa-field">
          <label className="sa-label">Password</label>
          <div className="sa-input-wrap">
            <input
              type={showRegPass ? 'text' : 'password'}
              className={`sa-input ${regErrors.password ? 'sa-input--err' : ''}`}
              placeholder="Min. 6 chars"
              value={reg.password}
              onChange={e => { setReg(r => ({ ...r, password: e.target.value })); setRegErrors(r => ({ ...r, password: '' })); }}
            />
            <button type="button" className="sa-eye-btn" onClick={() => setShowRegPass(p => !p)}>{showRegPass ? '🙈' : '👁'}</button>
          </div>
          <FieldError msg={regErrors.password} />
        </div>
        <div className="sa-field">
          <label className="sa-label">Confirm password</label>
          <div className="sa-input-wrap">
            <input
              type={showRegConf ? 'text' : 'password'}
              className={`sa-input ${regErrors.confirmPassword ? 'sa-input--err' : ''}`}
              placeholder="Repeat password"
              value={reg.confirmPassword}
              onChange={e => { setReg(r => ({ ...r, confirmPassword: e.target.value })); setRegErrors(r => ({ ...r, confirmPassword: '' })); }}
            />
            <button type="button" className="sa-eye-btn" onClick={() => setShowRegConf(p => !p)}>{showRegConf ? '🙈' : '👁'}</button>
          </div>
          <FieldError msg={regErrors.confirmPassword} />
        </div>
      </div>
      <div className="sa-field">
        <label className="sa-label">I want to</label>
        <select
          className="sa-input sa-input--select"
          value={reg.role}
          onChange={e => setReg(r => ({ ...r, role: e.target.value }))}
        >
          <option value="customer">🛒 Order food — I'm a customer</option>
          <option value="delivery_partner">🛵 Deliver food — I'm a partner</option>
        </select>
      </div>
      <button type="submit" className="sa-primary-btn" disabled={isRegistering}>
        {isRegistering ? <><Spinner />Creating account…</> : 'Create Account'}
      </button>
    </form>
    <p className="sa-register-prompt">
      Already have an account?{' '}
      <button type="button" className="sa-text-btn" onClick={() => goTo('email')}>Sign in</button>
    </p>
    <div className="sa-tnc">
      By creating an account, you agree to our <button onClick={handleTermsClick} className="sa-text-btn">Terms</button> and <button onClick={handlePrivacyClick} className="sa-text-btn">Privacy Policy</button>.
    </div>
  </div>
);

/* ─── ROOT ────────────────────────────────────────────────────────── */

export default function Auth() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthInner />
    </GoogleOAuthProvider>
  );
}

function AuthInner() {
  const navigate = useNavigate();

  const [screen, setScreen]               = useState('landing');
  const [globalError, setGlobalError]     = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin || user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'delivery_partner') {
          navigate('/delivery-app', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
      } catch (error) {
        // Invalid user data, clear storage and continue
        localStorage.removeItem('token');
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  // Navigation handlers
  const handleTermsClick = useCallback(() => {
    window.open('/terms', '_blank');
  }, []);

  const handlePrivacyClick = useCallback(() => {
    window.open('/privacy-policy', '_blank');
  }, []);

  const handleHelpClick = useCallback((e) => {
    e.preventDefault();
    window.open('/help', '_blank');
  }, []);

  const handleLogoClick = useCallback((e) => {
    e.preventDefault();
    navigate('/', { replace: true });
  }, [navigate]);

  const [emailVal, setEmailVal]           = useState('');
  const [passVal, setPassVal]             = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [emailLoading, setEmailLoading]   = useState(false);

  const [phone, setPhone]                 = useState('');
  const [phoneError, setPhoneError]       = useState('');
  const [isSendingOTP, setIsSendingOTP]   = useState(false);
  const [otpDigits, setOtpDigits]         = useState(['','','','','','']);
  const [otpError, setOtpError]           = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpTimer, setOtpTimer]           = useState(0);
  const [resendTimer, setResendTimer]     = useState(0);
  const [confirmResult, setConfirmResult] = useState(null);
  const [otpExpiredState, setOtpExpiredState] = useState(false);

  const otpRefs            = useRef([]);
  const isVerifyingRef     = useRef(false);
  const otpExpiredRef      = useRef(false);
  const recaptchaRef       = useRef(null);
  const recaptchaRendered  = useRef(false);
  const handleVerifyOTPRef = useRef(null);

  const [reg, setReg] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'customer' });
  const [regErrors, setRegErrors]           = useState({});
  const [isRegistering, setIsRegistering]   = useState(false);
  const [showRegPass, setShowRegPass]       = useState(false);
  const [showRegConf, setShowRegConf]       = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('mode') === 'register') setScreen('register');
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    if (screen !== 'otp' || otpTimer <= 0) {
      if (otpTimer === 0) { otpExpiredRef.current = true; setOtpExpiredState(true); }
      return;
    }
    const t = setTimeout(() => setOtpTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer, screen]);

  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) { try { recaptchaRef.current.clear(); } catch(_) {} recaptchaRef.current = null; }
    const el = document.getElementById('recaptcha-root');
    if (el) el.innerHTML = '';
    recaptchaRendered.current = false;
  }, []);

  const initRecaptcha = useCallback(() => new Promise((res, rej) => {
    if (recaptchaRendered.current && recaptchaRef.current) return res(recaptchaRef.current);
    const el = document.getElementById('recaptcha-root');
    if (!el) return rej(new Error('reCAPTCHA container missing'));
    if (recaptchaRef.current) { try { recaptchaRef.current.clear(); } catch(_) {} recaptchaRef.current = null; }
    el.innerHTML = '';
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-root', {
        size:'invisible', callback:()=>{}, 'expired-callback':()=>clearRecaptcha(),
      });
      recaptchaRef.current.render()
        .then(() => { recaptchaRendered.current = true; res(recaptchaRef.current); })
        .catch(err => { clearRecaptcha(); rej(err); });
    } catch(err) { clearRecaptcha(); rej(err); }
  }), [clearRecaptcha]);

  useEffect(() => {
    if (screen !== 'phone') return;
    const t = setTimeout(() => initRecaptcha().catch(()=>{}), 500);
    return () => clearTimeout(t);
  }, [screen, initRecaptcha]);

  useEffect(() => () => {
    if (recaptchaRef.current) { try { recaptchaRef.current.clear(); } catch(_) {} recaptchaRef.current = null; }
    const el = document.getElementById('recaptcha-root');
    if (el) el.innerHTML = '';
    recaptchaRendered.current = false;
  }, []);

  const reset = useCallback(() => {
    setGlobalError(''); setGlobalSuccess('');
    setPhone(''); setPhoneError('');
    setOtpDigits(['','','','','','']); setOtpError('');
    otpExpiredRef.current = false; setOtpExpiredState(false);
    setOtpTimer(0); setResendTimer(0);
    setConfirmResult(null); clearRecaptcha();
  }, [clearRecaptcha]);

  const goTo = useCallback(s => { reset(); setScreen(s); }, [reset]);

  const redirect = useCallback((user) => {
    if (user.isAdmin || user.role === 'admin') navigate('/admin', { replace: true });
    else if (user.role === 'delivery_partner') navigate('/delivery-app', { replace: true });
    else navigate('/app', { replace: true });
  }, [navigate]);

  const handleGoogleSuccess = useCallback(async cr => {
    setGlobalError('');
    try {
      const payload = JSON.parse(atob(cr.credential.split('.')[1]));
      const r = await fetch(`${API_CONFIG.API_URL}/auth/google-login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email:payload.email, name:payload.name, googleId:payload.sub, photoURL:payload.picture }),
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess('Welcome! Redirecting…');
        setTimeout(() => redirect(data.user), 1000);
      } else setGlobalError(data.message || 'Google sign-in failed');
    } catch { setGlobalError('Network error. Please try again.'); }
  }, [redirect]);

  const handleEmailLogin = useCallback(async e => {
    e.preventDefault();
    setEmailLoading(true); setGlobalError('');
    try {
      const r = await fetch(`${API_CONFIG.API_URL}/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email:emailVal, password:passVal }),
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess('Welcome back!');
        setTimeout(() => redirect(data.user), 900);
      } else setGlobalError(data.message || 'Login failed');
    } catch { setGlobalError('Server error. Please try again.'); }
    finally { setEmailLoading(false); }
  }, [emailVal, passVal, redirect]);

  const handleSendOTP = useCallback(async () => {
    if (!/^\d{10}$/.test(phone)) { setPhoneError('Enter a valid 10-digit number.'); return; }
    setPhoneError(''); setIsSendingOTP(true);
    try {
      const verifier = await initRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      setConfirmResult(result);
      otpExpiredRef.current = false; setOtpExpiredState(false);
      setOtpDigits(['','','','','','']); setOtpError('');
      setOtpTimer(60); setResendTimer(45);
      setScreen('otp');
    } catch(err) {
      clearRecaptcha();
      if (err.code === 'auth/too-many-requests') setPhoneError('Too many attempts. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number') setPhoneError('Invalid phone number.');
      else setPhoneError('Failed to send OTP. Try again.');
    } finally { setIsSendingOTP(false); }
  }, [phone, initRecaptcha, clearRecaptcha]);

  const handleOtpChange = useCallback((i, val) => {
    if (!/^\d*$/.test(val)) return;
    setOtpDigits(prev => {
      const next = [...prev]; next[i] = val;
      if (val && i === 5 && next.every(d => d) && !otpExpiredRef.current)
        setTimeout(() => handleVerifyOTPRef.current?.(next.join('')), 0);
      return next;
    });
    setOtpError('');
    if (val && i < 5) otpRefs.current[i+1]?.focus();
  }, []);

  const handleOtpKeyDown = useCallback((i, e) => {
    if (e.key === 'Backspace' && !otpRefs.current[i]?.value && i > 0)
      otpRefs.current[i-1]?.focus();
  }, []);

  const handleVerifyOTP = useCallback(async override => {
    const val = override || otpDigits.join('');
    if (val.length < 6) { setOtpError('Enter all 6 digits.'); return; }
    if (isVerifyingRef.current) return;
    if (otpExpiredRef.current) { setOtpError('OTP expired. Resend a new one.'); return; }
    isVerifyingRef.current = true; setIsVerifyingOTP(true);
    try {
      const result = await confirmResult.confirm(val);
      const ph = result.user.phoneNumber;
      try {
        const r = await fetch(`${API_CONFIG.API_URL}/auth/firebase-login`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ uid:result.user.uid, phone:ph, name:null, email:null }),
        });
        const data = await r.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setGlobalSuccess('Phone verified! Redirecting…');
          setTimeout(() => redirect(data.user), 900);
        } else {
          localStorage.setItem('verifiedPhone', ph);
          setGlobalSuccess('Verified! Redirecting…');
          setTimeout(() => navigate('/app'), 900);
        }
      } catch {
        localStorage.setItem('verifiedPhone', ph);
        setGlobalSuccess('Verified! Redirecting…');
        setTimeout(() => navigate('/app'), 900);
      }
    } catch(err) {
      if (err.code === 'auth/code-expired') setOtpError('OTP expired. Resend a new one.');
      else if (err.code === 'auth/invalid-verification-code') setOtpError('Incorrect OTP. Try again.');
      else setOtpError('Verification failed. Try again.');
    } finally { setIsVerifyingOTP(false); isVerifyingRef.current = false; }
  }, [otpDigits, confirmResult, redirect, navigate]);

  useEffect(() => { handleVerifyOTPRef.current = handleVerifyOTP; }, [handleVerifyOTP]);

  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0) return;
    clearRecaptcha();
    setOtpDigits(['','','','','','']); setOtpError('');
    otpExpiredRef.current = false; setOtpExpiredState(false);
    setOtpTimer(60);
    await handleSendOTP();
  }, [resendTimer, clearRecaptcha, handleSendOTP]);

  const validateReg = useCallback(() => {
    const e = {};
    if (!reg.name.trim() || reg.name.trim().length < 2) e.name = 'At least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(reg.name)) e.name = 'Letters and spaces only';
    if (!reg.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) e.email = 'Invalid email address';
    if (!reg.phone) e.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(reg.phone)) e.phone = 'Valid 10-digit number';
    if (!reg.password) e.password = 'Password is required';
    else if (reg.password.length < 6) e.password = 'Min 6 characters';
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(reg.password)) e.password = 'Mix letters and numbers';
    if (!reg.confirmPassword) e.confirmPassword = 'Please confirm';
    else if (reg.password !== reg.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }, [reg]);

  const handleRegister = useCallback(async e => {
    e.preventDefault();
    const errors = validateReg();
    if (Object.keys(errors).length) { setRegErrors(errors); return; }
    setIsRegistering(true); setRegErrors({}); setGlobalError('');
    try {
      const r = await fetch(`${API_CONFIG.API_URL}/auth/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:reg.name.trim(), email:reg.email.toLowerCase(), phone:reg.phone, password:reg.password, role:reg.role }),
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess('Account created! Redirecting…');
        setTimeout(() => redirect(data.user), 1200);
      } else {
        if (data.message?.includes('email')) setRegErrors({ email: data.message });
        else if (data.message?.includes('phone')) setRegErrors({ phone: data.message });
        else setGlobalError(data.message || 'Registration failed');
      }
    } catch { setGlobalError('Network error. Please try again.'); }
    finally { setIsRegistering(false); }
  }, [reg, validateReg, redirect]);

  const SCREENS = { landing:LandingScreen, phone:PhoneScreen, otp:OtpScreen, email:EmailScreen, register:RegisterScreen };
  const ActiveScreen = SCREENS[screen] || LandingScreen;

  const screenProps = {
    landing:  { globalError, globalSuccess, goTo, onGoogleSuccess: handleGoogleSuccess, handleTermsClick, handlePrivacyClick },
    phone:    { phone, setPhone, phoneError, setPhoneError, isSendingOTP, handleSendOTP, goTo, handleTermsClick, handlePrivacyClick },
    otp:      { phone, otpDigits, otpError, otpTimer, resendTimer, isVerifyingOTP, otpExpired:otpExpiredState, handleOtpChange, handleOtpKeyDown, handleVerifyOTP, handleResendOTP, globalSuccess, goTo, otpRefs },
    email:    { globalError, globalSuccess, setGlobalError, emailVal, setEmailVal, passVal, setPassVal, showPass, setShowPass, emailLoading, handleEmailLogin, goTo },
    register: { globalError, globalSuccess, reg, setReg, regErrors, setRegErrors, isRegistering, showRegPass, setShowRegPass, showRegConf, setShowRegConf, handleRegister, goTo, handleTermsClick, handlePrivacyClick },
  };

  return (
    <div className="sa-page">
      <div id="recaptcha-root" style={{ display:'none' }} />

      {/* ── LEFT: full-height food image panel ── */}
      <div className="sa-left">
        <button onClick={handleLogoClick} className="sa-brand-link">
          <div className="sa-brand-logo">YK</div>
          <div>
            <div className="sa-brand-name">Yeswanth's Healthy Kitchen</div>
            <div className="sa-brand-tag">Fresh food. Fast delivery.</div>
          </div>
        </button>

        {/* Big food illustration area */}
        <div className="sa-food-display">
          <div className="sa-food-plate">🍛</div>
          <div className="sa-food-items">
            <span className="sa-food-item sa-food-item--a">🍗</span>
            <span className="sa-food-item sa-food-item--b">🥗</span>
            <span className="sa-food-item sa-food-item--c">🥘</span>
            <span className="sa-food-item sa-food-item--d">🍜</span>
          </div>
        </div>

        <div className="sa-left-copy">
          <h2>Tastes so good, even photos get hungry</h2>
          <p>Over 50 dishes made fresh daily, delivered to your door.</p>
        </div>

        <div className="sa-left-stats">
          <div className="sa-left-stat"><strong>4.8</strong><span>Rating</span></div>
          <div className="sa-left-stat"><strong>30 min</strong><span>Avg delivery</span></div>
          <div className="sa-left-stat"><strong>10k+</strong><span>Happy orders</span></div>
        </div>
      </div>

      {/* ── RIGHT: scrollable form panel ── */}
      <div className="sa-right">
        <div className="sa-form-container">
          <ActiveScreen {...screenProps[screen]} />
        </div>
        <div className="sa-right-footer">
          <button onClick={handleTermsClick} className="sa-text-btn">Terms</button>
          <span>·</span>
          <button onClick={handlePrivacyClick} className="sa-text-btn">Privacy</button>
        </div>
      </div>
    </div>
  );
}