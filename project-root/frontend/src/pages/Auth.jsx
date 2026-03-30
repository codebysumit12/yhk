import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Auth.css';

/*
 * FLOW  (industry-standard, like Swiggy / Zomato / Linear)
 * ─────────────────────────────────────────────────────────
 *  screen: 'landing'   → hero: Continue with Google | Facebook | Phone | Email
 *  screen: 'email'     → email + password  (existing users)
 *  screen: 'phone'     → phone → OTP
 *  screen: 'register'  → full sign-up form (reached via "Create account" link)
 *  screen: 'otp'       → 6-digit OTP (phone or email-otp)
 */

const GOOGLE_CLIENT_ID = '579329797638-hd52etnj43u7camu9qrh8ev8i53imukp.apps.googleusercontent.com';

export default function Auth() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthInner />
    </GoogleOAuthProvider>
  );
}

function AuthInner() {
  const navigate = useNavigate();
  const googleInitializedRef = useRef(false);
  const googleLoginRef = useRef(null);

  // ── top-level screen ──────────────────────────────────────────────────────
  const [screen, setScreen] = useState('landing'); // landing | email | phone | register | otp

  // ── shared ────────────────────────────────────────────────────────────────
  const [globalError, setGlobalError]   = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  // ── email/password ────────────────────────────────────────────────────────
  const [emailVal, setEmailVal]     = useState('');
  const [passVal, setPassVal]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // ── phone OTP (Firebase) ──────────────────────────────────────────────────
  const [phone, setPhone]               = useState('');
  const [phoneError, setPhoneError]     = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpDigits, setOtpDigits]       = useState(['','','','','','']);
  const [otpError, setOtpError]         = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpTimer, setOtpTimer]         = useState(0);   // expiry
  const [resendTimer, setResendTimer]   = useState(0);
  const [confirmResult, setConfirmResult] = useState(null);
  const otpRefs        = useRef([]);
  const isVerifyingRef = useRef(false);
  const otpExpiredRef  = useRef(false);
  const recaptchaRef   = useRef(null);
  const recaptchaRendered = useRef(false);

  // ── registration ──────────────────────────────────────────────────────────
  const [reg, setReg] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer'
  });
  const [regErrors, setRegErrors]   = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegPass, setShowRegPass]   = useState(false);
  const [showRegConf, setShowRegConf]   = useState(false);

  // ── OTP timers ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    if (screen !== 'otp' || otpTimer <= 0) return;
    if (otpTimer === 0) { otpExpiredRef.current = true; return; }
    const t = setTimeout(() => setOtpTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer, screen]);

  // ── reCAPTCHA ─────────────────────────────────────────────────────────────
  const clearRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch (_) {}
      recaptchaRef.current = null;
    }
    const el = document.getElementById('recaptcha-root');
    if (el) el.innerHTML = '';
    recaptchaRendered.current = false;
  }, []);

  const initRecaptcha = useCallback(() => new Promise((res, rej) => {
    if (recaptchaRendered.current && recaptchaRef.current) return res(recaptchaRef.current);
    const el = document.getElementById('recaptcha-root');
    if (!el) return rej(new Error('reCAPTCHA container missing'));
    if (recaptchaRef.current) { try { recaptchaRef.current.clear(); } catch (_) {} recaptchaRef.current = null; }
    el.innerHTML = '';
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-root', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => clearRecaptcha(),
      });
      recaptchaRef.current.render()
        .then(() => { recaptchaRendered.current = true; res(recaptchaRef.current); })
        .catch(err => { clearRecaptcha(); rej(err); });
    } catch (err) { clearRecaptcha(); rej(err); }
  }), [clearRecaptcha]);

  useEffect(() => {
    if (screen === 'phone') {
      const t = setTimeout(() => initRecaptcha().catch(() => {}), 500);
      return () => clearTimeout(t);
    }
  }, [screen]); // Remove initRecaptcha to prevent infinite loop

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch (_) {}
        recaptchaRef.current = null;
      }
      const el = document.getElementById('recaptcha-root');
      if (el) el.innerHTML = '';
      recaptchaRendered.current = false;
    };
  }, []); // Cleanup on unmount only

  // ── helpers ───────────────────────────────────────────────────────────────
  const reset = () => {
    setGlobalError(''); setGlobalSuccess('');
    setPhone(''); setPhoneError('');
    setOtpDigits(['','','','','','']); setOtpError('');
    otpExpiredRef.current = false;
    setOtpTimer(0); setResendTimer(0);
    setConfirmResult(null);
    clearRecaptcha();
  };

  const goTo = (s) => { reset(); setScreen(s); };

  const redirect = (user) => {
    if (user.isAdmin || user.role === 'admin') navigate('/admin', { replace: true });
    else if (user.role === 'delivery_partner') navigate('/delivery-app', { replace: true });
    else navigate('/', { replace: true });
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!googleInitializedRef.current) return; // Prevent multiple calls
    setGlobalError('');
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const r = await fetch(`${API_CONFIG.API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email, name: payload.name, googleId: payload.sub, photoURL: payload.picture }),
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess('Welcome! Redirecting…');
        setTimeout(() => redirect(data.user), 1000);
      } else {
        setGlobalError(data.message || 'Google sign-in failed');
      }
    } catch { setGlobalError('Network error. Please try again.'); }
  };

  // ── Facebook (placeholder — wire up FB SDK as needed) ────────────────────
  const handleFacebook = () => {
    setGlobalError('Facebook login coming soon!');
  };

  // ── Email / password login ────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setEmailLoading(true); setGlobalError('');
    try {
      const r = await fetch(`${API_CONFIG.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: passVal }),
      });
      const data = await r.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess('Welcome back!');
        setTimeout(() => redirect(data.user), 900);
      } else { setGlobalError(data.message || 'Login failed'); }
    } catch { setGlobalError('Server error. Please try again.'); }
    finally { setEmailLoading(false); }
  };

  // ── Send phone OTP ────────────────────────────────────────────────────────
  const handleSendOTP = useCallback(async () => {
    if (!/^\d{10}$/.test(phone)) { setPhoneError('Enter a valid 10-digit number.'); return; }
    setPhoneError(''); setIsSendingOTP(true);
    try {
      const verifier = await initRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      setConfirmResult(result);
      otpExpiredRef.current = false;
      setOtpDigits(['','','','','','']);
      setOtpError('');
      setOtpTimer(60);
      setResendTimer(45);
      setScreen('otp');
    } catch (err) {
      clearRecaptcha();
      if (err.code === 'auth/too-many-requests') setPhoneError('Too many attempts. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number') setPhoneError('Invalid phone number.');
      else setPhoneError('Failed to send OTP. Try again.');
    } finally { setIsSendingOTP(false); }
  }, [phone, initRecaptcha, clearRecaptcha]);

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits]; next[i] = val;
    setOtpDigits(next); setOtpError('');
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d) && !otpExpiredRef.current) handleVerifyOTP(next.join(''));
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async (override) => {
    const val = override || otpDigits.join('');
    if (val.length < 6) { setOtpError('Enter all 6 digits.'); return; }
    if (isVerifyingRef.current) return;
    if (otpExpiredRef.current) { setOtpError('OTP expired. Resend a new one.'); return; }
    isVerifyingRef.current = true;
    setIsVerifyingOTP(true);
    try {
      const result = await confirmResult.confirm(val);
      const ph = result.user.phoneNumber;
      try {
        const r = await fetch(`${API_CONFIG.API_URL}/auth/firebase-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: result.user.uid, phone: ph, name: null, email: null }),
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
          setTimeout(() => navigate('/'), 900);
        }
      } catch {
        localStorage.setItem('verifiedPhone', ph);
        setGlobalSuccess('Verified! Redirecting…');
        setTimeout(() => navigate('/'), 900);
      }
    } catch (err) {
      if (err.code === 'auth/code-expired') setOtpError('OTP expired. Resend a new one.');
      else if (err.code === 'auth/invalid-verification-code') setOtpError('Incorrect OTP. Try again.');
      else setOtpError('Verification failed. Try again.');
    } finally { setIsVerifyingOTP(false); isVerifyingRef.current = false; }
  };

  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0) return;
    clearRecaptcha();
    setOtpDigits(['','','','','','']);
    setOtpError('');
    otpExpiredRef.current = false;
    setOtpTimer(60);
    await handleSendOTP();
  }, [resendTimer, clearRecaptcha, handleSendOTP]);

  // ── Registration ──────────────────────────────────────────────────────────
  const validateReg = () => {
    const e = {};
    if (!reg.name.trim() || reg.name.trim().length < 2) e.name = 'At least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(reg.name)) e.name = 'Letters and spaces only';
    if (!reg.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) e.email = 'Invalid email address';
    if (!reg.phone) e.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(reg.phone)) e.phone = 'Valid 10-digit number (starts 6–9)';
    if (!reg.password) e.password = 'Password is required';
    else if (reg.password.length < 6) e.password = 'Minimum 6 characters';
    else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(reg.password)) e.password = 'Mix of letters and numbers';
    if (!reg.confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (reg.password !== reg.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateReg();
    if (Object.keys(errors).length) { setRegErrors(errors); return; }
    setIsRegistering(true); setRegErrors({}); setGlobalError('');
    try {
      const r = await fetch(`${API_CONFIG.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reg.name.trim(), email: reg.email.toLowerCase(),
          phone: reg.phone, password: reg.password, role: reg.role,
        }),
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
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const Alert = ({ type, msg }) => msg ? (
    <div className={`auth-alert auth-alert--${type}`}>
      <span className="auth-alert__icon">{type === 'success' ? '✓' : '!'}</span>
      <span>{msg}</span>
    </div>
  ) : null;

  const Field = ({ label, icon, error, children }) => (
    <div className="auth-field">
      {label && <label className="auth-field__label"><span>{icon}</span>{label}</label>}
      {children}
      {error && <span className="auth-field__error">{error}</span>}
    </div>
  );

  const Spinner = () => <span className="auth-spinner" />;

  const SocialDivider = () => (
    <div className="auth-divider"><span>or continue with</span></div>
  );

  const SocialRow = () => (
    <div className="auth-social-row">
      {/* Facebook */}
      <button type="button" className="auth-social-btn auth-social-btn--fb" onClick={handleFacebook}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
        <span>Facebook</span>
      </button>
    </div>
  );

  const BackBtn = ({ to }) => (
    <button type="button" className="auth-back-btn" onClick={() => goTo(to)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Back
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────────────────────────

  // ── 1. LANDING ────────────────────────────────────────────────────────────
  const LandingScreen = () => (
    <div className="auth-screen">
      <div className="auth-screen__header">
        <h2 className="auth-screen__title">Welcome</h2>
        <p className="auth-screen__sub">Sign in or create your account</p>
      </div>

      <Alert type="error" msg={globalError} />
      <Alert type="success" msg={globalSuccess} />

      {/* Social */}
      <div className="auth-social-stack">
        <SocialRow />
      </div>

      <div className="auth-divider"><span>or</span></div>

      {/* Other options */}
      <div className="auth-option-stack">
        <button type="button" className="auth-option-btn" onClick={() => goTo('phone')}>
          <span className="auth-option-btn__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
            </svg>
          </span>
          <span>Continue with Phone</span>
          <svg className="auth-option-btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button type="button" className="auth-option-btn" onClick={() => goTo('email')}>
          <span className="auth-option-btn__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
            </svg>
          </span>
          <span>Continue with Email</span>
          <svg className="auth-option-btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <p className="auth-screen__footer-note">
        New here?{' '}
        <button type="button" className="auth-text-link" onClick={() => goTo('register')}>
          Create an account
        </button>
      </p>
    </div>
  );

  // ── 2. PHONE ──────────────────────────────────────────────────────────────
  const PhoneScreen = () => (
    <div className="auth-screen">
      <BackBtn to="landing" />
      <div className="auth-screen__header">
        <h2 className="auth-screen__title">Your phone</h2>
        <p className="auth-screen__sub">We'll send a 6-digit code to verify</p>
      </div>

      <Alert type="error" msg={phoneError} />

      <Field label="Mobile number" icon="📱">
        <div className="auth-phone-row">
          <div className="auth-phone-prefix">🇮🇳 +91</div>
          <input
            type="tel" maxLength="10"
            className="auth-input auth-input--flex"
            placeholder="98765 43210"
            value={phone}
            onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
            autoFocus
          />
        </div>
      </Field>

      <button
        type="button" className="auth-primary-btn"
        onClick={handleSendOTP} disabled={isSendingOTP || phone.length !== 10}
      >
        {isSendingOTP ? <><Spinner /> Sending…</> : <>Send OTP <span className="auth-btn-arrow">→</span></>}
      </button>

      <SocialDivider />
      <SocialRow />
    </div>
  );

  // ── 3. OTP ────────────────────────────────────────────────────────────────
  const OtpScreen = () => (
    <div className="auth-screen">
      <BackBtn to="phone" />
      <div className="auth-screen__header">
        <div className="auth-otp-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h2 className="auth-screen__title">Enter OTP</h2>
        <p className="auth-screen__sub">
          Sent to <strong>+91 {phone.slice(0,5)} {phone.slice(5)}</strong>{' '}
          <button type="button" className="auth-text-link" onClick={() => goTo('phone')}>Change</button>
        </p>
      </div>

      <Alert type="success" msg={globalSuccess} />
      <Alert type="error" msg={otpError} />

      {/* OTP boxes */}
      <div className="auth-otp-row">
        {otpDigits.map((d, i) => (
          <input
            key={`otp-${i}`}
            ref={el => (otpRefs.current[i] = el)}
            type="text" inputMode="numeric" maxLength="1"
            value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
            disabled={otpExpiredRef.current}
            className={`auth-otp-cell ${d ? 'auth-otp-cell--filled' : ''} ${otpError ? 'auth-otp-cell--error' : ''}`}
          />
        ))}
      </div>

      {/* Timer */}
      <div className={`auth-otp-timer ${otpTimer === 0 ? 'auth-otp-timer--expired' : ''}`}>
        {otpTimer > 0 ? `⏱ Code valid for ${otpTimer}s` : '⏰ Code expired'}
      </div>

      <button
        type="button" className="auth-primary-btn"
        onClick={() => handleVerifyOTP()}
        disabled={isVerifyingOTP || otpExpiredRef.current || otpDigits.join('').length < 6}
      >
        {isVerifyingOTP ? <><Spinner /> Verifying…</> : <>Verify & Continue <span className="auth-btn-arrow">→</span></>}
      </button>

      <p className="auth-resend-row">
        Didn't receive it?{' '}
        <button
          type="button" className="auth-text-link"
          onClick={handleResendOTP} disabled={resendTimer > 0}
          style={{ opacity: resendTimer > 0 ? 0.45 : 1 }}
        >
          Resend{resendTimer > 0 ? ` (${resendTimer}s)` : ''}
        </button>
      </p>
    </div>
  );

  // ── 4. EMAIL ──────────────────────────────────────────────────────────────
  const EmailScreen = () => (
    <div className="auth-screen">
      <BackBtn to="landing" />
      <div className="auth-screen__header">
        <h2 className="auth-screen__title">Sign in</h2>
        <p className="auth-screen__sub">Enter your email and password</p>
      </div>

      <Alert type="error" msg={globalError} />
      <Alert type="success" msg={globalSuccess} />

      <form onSubmit={handleEmailLogin} className="auth-form">
        <Field label="Email address" icon="📧">
          <input
            type="email" required
            className="auth-input" placeholder="you@example.com"
            value={emailVal}
            onChange={e => { setEmailVal(e.target.value); setGlobalError(''); }}
            autoFocus
          />
        </Field>
        <Field label="Password" icon="🔒">
          <div className="auth-pass-wrap">
            <input
              type={showPass ? 'text' : 'password'} required minLength="6"
              className="auth-input" placeholder="Your password"
              value={passVal}
              onChange={e => { setPassVal(e.target.value); setGlobalError(''); }}
            />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(p => !p)}>
              {showPass ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </Field>

        <div className="auth-forgot-row">
          <button type="button" className="auth-text-link auth-text-link--sm">Forgot password?</button>
        </div>

        <button type="submit" className="auth-primary-btn" disabled={emailLoading}>
          {emailLoading ? <><Spinner /> Signing in…</> : <>Sign In <span className="auth-btn-arrow">→</span></>}
        </button>
      </form>

      <SocialDivider />
      <SocialRow />

      <p className="auth-screen__footer-note">
        No account?{' '}
        <button type="button" className="auth-text-link" onClick={() => goTo('register')}>Create one</button>
      </p>
    </div>
  );

  // ── 5. REGISTER ───────────────────────────────────────────────────────────
  const RegisterScreen = () => (
    <div className="auth-screen">
      <BackBtn to="landing" />
      <div className="auth-screen__header">
        <h2 className="auth-screen__title">Create account</h2>
        <p className="auth-screen__sub">Join Yeswanth's Healthy Kitchen</p>
      </div>

      <Alert type="error" msg={globalError} />
      <Alert type="success" msg={globalSuccess} />

      <form onSubmit={handleRegister} className="auth-form">
        <Field label="Full name" icon="👤" error={regErrors.name}>
          <input
            type="text" className={`auth-input ${regErrors.name ? 'auth-input--error' : ''}`}
            placeholder="Your full name" value={reg.name}
            onChange={e => { setReg({ ...reg, name: e.target.value }); setRegErrors({ ...regErrors, name: '' }); }}
          />
        </Field>

        <Field label="Email address" icon="📧" error={regErrors.email}>
          <input
            type="email" className={`auth-input ${regErrors.email ? 'auth-input--error' : ''}`}
            placeholder="you@example.com" value={reg.email}
            onChange={e => { setReg({ ...reg, email: e.target.value }); setRegErrors({ ...regErrors, email: '' }); }}
          />
        </Field>

        <Field label="Phone number" icon="📱" error={regErrors.phone}>
          <div className="auth-phone-row">
            <div className="auth-phone-prefix">🇮🇳 +91</div>
            <input
              type="tel" maxLength="10"
              className={`auth-input auth-input--flex ${regErrors.phone ? 'auth-input--error' : ''}`}
              placeholder="98765 43210" value={reg.phone}
              onChange={e => { setReg({ ...reg, phone: e.target.value.replace(/\D/g, '') }); setRegErrors({ ...regErrors, phone: '' }); }}
            />
          </div>
        </Field>

        <Field label="Password" icon="🔒" error={regErrors.password}>
          <div className="auth-pass-wrap">
            <input
              type={showRegPass ? 'text' : 'password'}
              className={`auth-input ${regErrors.password ? 'auth-input--error' : ''}`}
              placeholder="Min. 6 chars, letters + numbers" value={reg.password}
              onChange={e => { setReg({ ...reg, password: e.target.value }); setRegErrors({ ...regErrors, password: '' }); }}
            />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowRegPass(p => !p)}>
              {showRegPass ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </Field>

        <Field label="Confirm password" icon="🔒" error={regErrors.confirmPassword}>
          <div className="auth-pass-wrap">
            <input
              type={showRegConf ? 'text' : 'password'}
              className={`auth-input ${regErrors.confirmPassword ? 'auth-input--error' : ''}`}
              placeholder="Repeat your password" value={reg.confirmPassword}
              onChange={e => { setReg({ ...reg, confirmPassword: e.target.value }); setRegErrors({ ...regErrors, confirmPassword: '' }); }}
            />
            <button type="button" className="auth-pass-toggle" onClick={() => setShowRegConf(p => !p)}>
              {showRegConf ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </Field>

        <Field label="I am a" icon="🎭">
          <select
            className="auth-input auth-input--select" value={reg.role}
            onChange={e => setReg({ ...reg, role: e.target.value })}
          >
            <option value="customer">🛒 Customer — order delicious meals</option>
            <option value="delivery_partner">🛵 Delivery Partner — join our team</option>
          </select>
        </Field>

        <button type="submit" className="auth-primary-btn" disabled={isRegistering}>
          {isRegistering ? <><Spinner /> Creating account…</> : <>Create Account <span className="auth-btn-arrow">→</span></>}
        </button>
      </form>

      <p className="auth-screen__footer-note">
        Already have an account?{' '}
        <button type="button" className="auth-text-link" onClick={() => goTo('email')}>Sign in</button>
      </p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ROOT RENDER
  // ─────────────────────────────────────────────────────────────────────────
  const SCREENS = { landing: LandingScreen, phone: PhoneScreen, otp: OtpScreen, email: EmailScreen, register: RegisterScreen };
  const ActiveScreen = SCREENS[screen] || LandingScreen;

  return (
    <div className="auth-page">
      {/* Hidden reCAPTCHA */}
      <div id="recaptcha-root" style={{ display: 'none' }} />

      {/* Ambient background */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
        {['🥗','🥑','🍇','🥕','🥦','🍓'].map((e, i) => (
          <span key={`emoji-${i}`} className="auth-float" style={{ '--delay': `${i * 2.2}s`, '--x': `${10 + i * 14}%`, '--y': `${8 + (i % 3) * 28}%` }}>{e}</span>
        ))}
      </div>

      {/* Card */}
      <div className="auth-card">
        {/* Left brand panel */}
        <aside className="auth-brand">
          <div className="auth-brand__inner">
            <div className="auth-brand__logo">
              <div className="auth-brand__logo-ring">
                <span>🍽️</span>
              </div>
            </div>
            <h1 className="auth-brand__name">
              Yeswanth's<br />
              <em>Healthy Kitchen</em>
            </h1>
            <p className="auth-brand__tagline">Experience the joy of healthy eating</p>
            <ul className="auth-brand__features">
              {['100% Fresh Ingredients', 'Farm to Table', 'Zero Preservatives', 'Chef-crafted Daily'].map((f, i) => (
                <li key={`feature-${i}`}>
                  <span className="auth-brand__check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="auth-brand__plate">
              <span>🥗🥑🍇</span>
            </div>
          </div>
        </aside>

        {/* Right form panel */}
        <main className="auth-panel">
          <div className="auth-panel__inner">
            {/* Single GoogleLogin instance - always rendered but conditionally visible */}
            <div style={{ display: (screen === 'landing' || screen === 'phone' || screen === 'email' || screen === 'register') ? 'block' : 'none' }}>
              <div className="auth-social-btn-wrapper--full">
                <GoogleLogin
                  ref={googleLoginRef}
                  onSuccess={(credentialResponse) => {
                    if (!googleInitializedRef.current) {
                      googleInitializedRef.current = true;
                      handleGoogleSuccess(credentialResponse);
                    }
                  }}
                  onError={() => setGlobalError('Google sign-in failed')}
                  useOneTap={false}
                  shape="rectangular"
                  size="large"
                  width="400"
                  text="continue_with"
                />
              </div>
            </div>
            <ActiveScreen />
            <footer className="auth-footer">
              <a href="/privacy-policy" className="auth-footer__link">Privacy</a>
              <span className="auth-footer__dot">·</span>
              <a href="/terms" className="auth-footer__link">Terms</a>
              <span className="auth-footer__dot">·</span>
              <a href="/help" className="auth-footer__link">Help</a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}