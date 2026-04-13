import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../../config/api';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth } from '../../firebase';   // delivery boy's primary auth — never mutated here
import './delivery-boy-app.css';

// ─────────────────────────────────────────────────────────────────────────────
// Secondary Firebase app for customer OTP
//
// WHY: calling confirmationResult.confirm() on the PRIMARY auth signs Firebase
// in as the customer, replacing the delivery boy's currentUser. The backend
// then rejects the next request with 401 because the UID changed.
//
// FIX: run the entire OTP flow (RecaptchaVerifier + signInWithPhoneNumber +
// confirm) on a SECONDARY app instance. The primary app's currentUser — and
// therefore the delivery boy's session — is never touched.
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerAuth = (() => {
  let _auth = null;
  return () => {
    if (_auth) return _auth;
    // Re-use existing secondary app or clone config from the default app
    const existing = getApps().find(a => a.name === 'customerOtp');
    const defaultApp = getApps().find(a => a.name === '[DEFAULT]');
    const app = existing ?? initializeApp(defaultApp.options, 'customerOtp');
    _auth = getAuth(app);
    return _auth;
  };
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildMapsUrl = (addr) => {
  if (!addr) return null;
  const lat = addr.coordinates?.lat ?? addr.lat;
  const lng = addr.coordinates?.lng ?? addr.lng ?? addr.lon;
  if (lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const full = [addr.street, addr.apartment, addr.landmark, addr.city, addr.state, addr.zipCode]
    .filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`;
};

const formatFullAddress = (addr) => {
  if (!addr) return ['—'];
  const lines = [];
  if (addr.street)    lines.push(addr.street);
  if (addr.apartment) lines.push(addr.apartment);
  if (addr.landmark)  lines.push(`📌 ${addr.landmark}`);
  const city = [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
  if (city) lines.push(city);
  return lines.length ? lines : ['—'];
};

const normalisePhone = (raw = '') => {
  let p = String(raw).replace(/\D/g, '');
  if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return p;
};

const BLANK_OTP = ['', '', '', '', '', ''];

// ─────────────────────────────────────────────────────────────────────────────
const DeliveryBoyApp = () => {
  const [myOrders,   setMyOrders]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [statusView, setStatusView] = useState('active');

  // OTP modal
  const [activeOrder,        setActiveOrder]        = useState(null);
  const [otpStep,            setOtpStep]            = useState('send');
  const [otpDigits,          setOtpDigits]          = useState(BLANK_OTP);
  const [otpError,           setOtpError]           = useState('');
  const [sendingOtp,         setSendingOtp]         = useState(false);
  const [verifying,          setVerifying]          = useState(false);
  const [resendTimer,        setResendTimer]        = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const otpRefs        = useRef([]);
  const isVerifyingRef = useRef(false);
  const rcVerifierRef  = useRef(null);
  const rcRenderedRef  = useRef(false);

  const API_URL = API_CONFIG.API_URL;

  // ── Get a fresh delivery-boy token ────────────────────────────────────────
  // We call auth.currentUser.getIdToken() right before the backend request so
  // we always have a valid, non-expired token — regardless of what happened to
  // the Firebase auth state during the OTP flow.
  const getDeliveryBoyToken = useCallback(async () => {
    // Prefer a fresh Firebase ID token if the delivery boy is still signed in
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken(/* forceRefresh= */ false);
      } catch (_) { /* fall through to localStorage */ }
    }
    // Fallback: JWT stored at login time (email/password delivery-boy accounts)
    return localStorage.getItem('token') || localStorage.getItem('userToken') || '';
  }, []);

  // ── Resend countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── reCAPTCHA — always on the SECONDARY app (getCustomerAuth) ────────────
  const clearRecaptcha = useCallback(() => {
    if (rcVerifierRef.current) {
      try { rcVerifierRef.current.clear(); } catch (_) {}
      rcVerifierRef.current = null;
    }
    const el = document.getElementById('delivery-boy-recaptcha');
    if (el) el.innerHTML = '';
    rcRenderedRef.current = false;
  }, []);

  const initRecaptcha = useCallback(() => new Promise((resolve, reject) => {
    if (rcRenderedRef.current && rcVerifierRef.current) {
      resolve(rcVerifierRef.current); return;
    }
    const container = document.getElementById('delivery-boy-recaptcha');
    if (!container) { reject(new Error('reCAPTCHA container missing')); return; }

    if (rcVerifierRef.current) {
      try { rcVerifierRef.current.clear(); } catch (_) {}
      rcVerifierRef.current = null;
    }
    container.innerHTML = '';

    try {
      // ✅ CORRECT constructor: (auth, containerIdString, optionsObject)
      // Passing a single object OR swapping arg order causes the
      // "deprecated parameters" warning + Enterprise config failure.
      rcVerifierRef.current = new RecaptchaVerifier(
        getCustomerAuth(),          // secondary app auth — not the delivery boy's
        'delivery-boy-recaptcha',   // container ID as a STRING (2nd arg)
        {                           // options object (3rd arg)
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => clearRecaptcha(),
        }
      );
      rcVerifierRef.current.render()
        .then(() => { rcRenderedRef.current = true; resolve(rcVerifierRef.current); })
        .catch(err => { clearRecaptcha(); reject(err); });
    } catch (err) { clearRecaptcha(); reject(err); }
  }), [clearRecaptcha]);

  useEffect(() => () => clearRecaptcha(), [clearRecaptcha]);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getDeliveryBoyToken();
      const res   = await fetch(`${API_URL}/orders/my-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyOrders(data.data || []);
    } catch (err) { console.error('fetchMyOrders:', err); }
    finally { setLoading(false); }
  }, [API_URL, getDeliveryBoyToken]);

  useEffect(() => {
    fetchMyOrders();
    const id = setInterval(fetchMyOrders, 30000);
    return () => clearInterval(id);
  }, [fetchMyOrders]);

  // ── Mark picked up ────────────────────────────────────────────────────────
  const markPickedUp = async (orderId) => {
    try {
      const token = await getDeliveryBoyToken();
      const res   = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: 'out-for-delivery' }),
      });
      const data = await res.json();
      if (data.success) fetchMyOrders();
      else alert(data.message || 'Failed to update status');
    } catch { console.error('markPickedUp failed'); }
  };

  // ── OTP helpers ───────────────────────────────────────────────────────────
  const resetOtpDigits = useCallback(() => {
    setOtpDigits(BLANK_OTP);
    setOtpError('');
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }, []);

  const openOtpModal = (order) => {
    setActiveOrder(order);
    setOtpStep('send');
    setOtpDigits(BLANK_OTP);
    setOtpError('');
    setConfirmationResult(null);
    setResendTimer(0);
    clearRecaptcha();
    setTimeout(() => initRecaptcha().catch(() => {}), 800);
  };

  const closeOtpModal = () => {
    if (verifying) return;
    setActiveOrder(null);
    setOtpStep('send');
    setOtpDigits(BLANK_OTP);
    setOtpError('');
    setConfirmationResult(null);
    clearRecaptcha();
  };

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const phone = normalisePhone(activeOrder?.customer?.phone);
    if (phone.length !== 10) { setOtpError('Customer phone number is invalid.'); return; }

    setSendingOtp(true);
    setOtpError('');
    try {
      const verifier = await initRecaptcha();

      // signInWithPhoneNumber on the SECONDARY app — delivery boy's session untouched
      const confirmation = await Promise.race([
        signInWithPhoneNumber(getCustomerAuth(), `+91${phone}`, verifier),
        new Promise((_, rej) => setTimeout(() => rej(new Error('reCAPTCHA timeout')), 15000)),
      ]);

      setConfirmationResult(confirmation);
      setOtpStep('enter');
      setResendTimer(45);
      setOtpDigits(BLANK_OTP);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      clearRecaptcha();
      if (err.message === 'reCAPTCHA timeout' || err.code === 'auth/network-request-failed')
        setOtpError('reCAPTCHA timed out. Please try again.');
      else if (err.code === 'auth/too-many-requests')
        setOtpError('Too many attempts. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number')
        setOtpError('Customer phone number is invalid.');
      else
        setOtpError('Failed to send OTP. Try again.');
    } finally { setSendingOtp(false); }
  };

  // ── OTP input ─────────────────────────────────────────────────────────────
  const handleOtpChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[i] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) handleVerifyOtp(next.join(''));
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  // ── Verify OTP + mark delivered ───────────────────────────────────────────
  const handleVerifyOtp = async (otpOverride) => {
    const val = otpOverride || otpDigits.join('');
    if (val.length < 6)         { setOtpError('Enter all 6 digits.'); return; }
    if (isVerifyingRef.current)  return;
    if (!confirmationResult)    { setOtpError('Please send OTP first.'); return; }
    isVerifyingRef.current = true;

    setVerifying(true);
    setOtpError('');
    try {
      // confirm() runs on the secondary app — delivery boy's primary auth untouched
      await confirmationResult.confirm(val);

      // ✅ Get a FRESH delivery-boy token AFTER confirm() to be safe.
      // Even if the secondary app's confirm() somehow triggered an auth event,
      // auth.currentUser still refers to the delivery boy (primary app is separate),
      // so getIdToken() returns their valid token.
      const freshToken = await getDeliveryBoyToken();

      const res  = await fetch(`${API_URL}/orders/${activeOrder._id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
        body:    JSON.stringify({ status: 'delivered' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to mark delivered');

      setOtpStep('success');
      fetchMyOrders();
      setTimeout(closeOtpModal, 3000);
    } catch (err) {
      if      (err.code === 'auth/code-expired')              setOtpError('OTP expired. Please resend.');
      else if (err.code === 'auth/invalid-verification-code') setOtpError('Incorrect OTP. Ask the customer again.');
      else if (err.message)                                   setOtpError(err.message);
      else                                                    setOtpError('Verification failed. Try again.');
      setOtpDigits(BLANK_OTP);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
      isVerifyingRef.current = false;
    }
  };

  const handleManualSubmit = () => {
    const val = otpDigits.join('');
    if (val.length < 6) { setOtpError('Enter all 6 digits.'); return; }
    handleVerifyOtp(val);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    clearRecaptcha();
    setOtpStep('send');
    setOtpDigits(BLANK_OTP);
    setOtpError('');
    setConfirmationResult(null);
  };

  // ── Derived lists ─────────────────────────────────────────────────────────
  const activeOrders    = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const displayOrders   = statusView === 'active' ? activeOrders : completedOrders;

  const todayEarnings = completedOrders
    .filter(o => new Date(o.delivery?.deliveredAt || o.updatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (o.delivery?.deliveryFee || o.pricing?.deliveryFee || 0), 0);

  const statusLabel = {
    ready:              { text: 'Ready for Pickup', color: '#f59e0b', icon: '📋' },
    'out-for-delivery': { text: 'Out for Delivery', color: '#06b6d4', icon: '🚚' },
    delivered:          { text: 'Delivered',        color: '#10b981', icon: '✅' },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dba-page">
      {/* Hidden reCAPTCHA anchor — always in DOM */}
      <div id="delivery-boy-recaptcha" style={{ display: 'none' }} />

      <div className="dba-header">
        <div className="dba-header-left">
          <h2>🛵 My Deliveries</h2>
          <p>Manage your active orders and complete deliveries</p>
        </div>
        <div className="dba-header-right">
          <div className="dba-earnings-pill">
            💰 Today's Earnings: <strong>₹{todayEarnings.toFixed(2)}</strong>
          </div>
          <button className="btn-secondary" onClick={fetchMyOrders}>🔄 Refresh</button>
        </div>
      </div>

      <div className="dba-stats-grid">
        <div className="dba-stat-card active">
          <div className="dba-stat-icon">🚚</div>
          <div><p className="dba-stat-value">{activeOrders.length}</p><p className="dba-stat-label">Active Orders</p></div>
        </div>
        <div className="dba-stat-card done">
          <div className="dba-stat-icon">✅</div>
          <div><p className="dba-stat-value">{completedOrders.length}</p><p className="dba-stat-label">Delivered Today</p></div>
        </div>
        <div className="dba-stat-card earnings">
          <div className="dba-stat-icon">💰</div>
          <div><p className="dba-stat-value">₹{todayEarnings.toFixed(0)}</p><p className="dba-stat-label">Earnings</p></div>
        </div>
      </div>

      <div className="dba-tabs">
        <button className={`dba-tab ${statusView === 'active' ? 'active' : ''}`} onClick={() => setStatusView('active')}>
          🚚 Active ({activeOrders.length})
        </button>
        <button className={`dba-tab ${statusView === 'completed' ? 'active' : ''}`} onClick={() => setStatusView('completed')}>
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your deliveries...</div>
      ) : displayOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{statusView === 'active' ? '🛵' : '✅'}</div>
          <h3>{statusView === 'active' ? 'No Active Orders' : 'No Completed Orders'}</h3>
          <p>{statusView === 'active' ? 'You have no deliveries assigned right now.' : 'No deliveries completed today yet.'}</p>
        </div>
      ) : (
        <div className="dba-orders-list">
          {displayOrders.map(order => {
            const addrLines = formatFullAddress(order.deliveryAddress);
            const mapsUrl   = buildMapsUrl(order.deliveryAddress);
            const hasCoords = (order.deliveryAddress?.coordinates?.lat ?? order.deliveryAddress?.lat) != null;

            return (
              <div key={order._id} className={`dba-order-card ${order.status}`}>

                <div className="dba-order-card-header">
                  <div className="dba-order-meta">
                    <span className="dba-order-number">{order.orderNumber}</span>
                    <span className="dba-status-badge" style={{
                      background: (statusLabel[order.status]?.color + '20') || '#e5e7eb',
                      color:      statusLabel[order.status]?.color || '#374151',
                      border:     `1px solid ${statusLabel[order.status]?.color || '#d1d5db'}`,
                    }}>
                      {statusLabel[order.status]?.icon} {statusLabel[order.status]?.text}
                    </span>
                  </div>
                  <span className="dba-order-time">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="dba-order-info">
                  <div className="dba-info-row">
                    <span className="dba-info-icon">👤</span>
                    <div>
                      <strong>{order.customer.name}</strong>
                      <a href={`tel:${order.customer.phone}`} className="dba-phone-link">
                        📞 {order.customer.phone}
                      </a>
                    </div>
                  </div>
                  <div className="dba-info-row">
                    <span className="dba-info-icon">📍</span>
                    <div className="dba-address-block">
                      {addrLines.map((line, i) => (
                        <span key={i} className={i === 0 ? 'dba-address-primary' : 'dba-address-secondary'}>
                          {line}
                        </span>
                      ))}
                      {hasCoords && <span className="dba-coords-badge">🎯 GPS coordinates available</span>}
                    </div>
                  </div>
                  <div className="dba-info-row">
                    <span className="dba-info-icon">🍽️</span>
                    <div>
                      <span>{order.orderItems?.length} item{order.orderItems?.length > 1 ? 's' : ''}</span>
                      <span className="dba-total">₹{order.pricing?.total}</span>
                      {order.paymentMethod === 'cod' && <span className="dba-cod-badge">💵 Collect Cash</span>}
                    </div>
                  </div>
                </div>

                <div className="dba-items-preview">
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <span key={i} className="dba-item-chip">{item.name} ×{item.quantity}</span>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <span className="dba-item-chip more">+{order.orderItems.length - 3} more</span>
                  )}
                </div>

                {order.specialInstructions && (
                  <div className="dba-special-note">📝 {order.specialInstructions}</div>
                )}

                <div className="dba-card-actions">
                  {order.status === 'ready' && (
                    <button className="dba-btn dba-btn-pickup" onClick={() => markPickedUp(order._id)}>
                      🏪 Picked Up from Restaurant
                    </button>
                  )}
                  {order.status === 'out-for-delivery' && (
                    <button className="dba-btn dba-btn-otp" onClick={() => openOtpModal(order)}>
                      🔐 Confirm Delivery with OTP
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <div className="dba-delivered-badge">
                      ✅ Delivered
                      {order.delivery?.otpVerified && <span className="dba-otp-confirmed">🔐 OTP Confirmed</span>}
                    </div>
                  )}
                  {order.status !== 'delivered' && mapsUrl && (
                    <a className="dba-btn dba-btn-navigate" href={mapsUrl} target="_blank" rel="noreferrer">
                      🗺️ Navigate
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── OTP Modal ───────────────────────────────────────────────────────── */}
      {activeOrder && (
        <div className="modal-overlay" onClick={closeOtpModal}>
          <div className="dba-otp-modal" onClick={e => e.stopPropagation()}>

            {otpStep === 'success' && (
              <div className="dba-otp-success">
                <div className="dba-success-icon">🎉</div>
                <h3>Delivery Confirmed!</h3>
                <p>Order <strong>{activeOrder.orderNumber}</strong> has been successfully delivered.</p>
                <p className="dba-success-sub">Closing automatically…</p>
              </div>
            )}

            {otpStep === 'send' && (
              <>
                <div className="dba-otp-header">
                  <h3>🔐 Confirm Delivery</h3>
                  <button className="close-btn" onClick={closeOtpModal} disabled={sendingOtp}>✕</button>
                </div>
                <div className="dba-otp-body">
                  <div className="dba-otp-order-summary">
                    <p><strong>Order:</strong>    {activeOrder.orderNumber}</p>
                    <p><strong>Customer:</strong> {activeOrder.customer.name}</p>
                    <p><strong>Phone:</strong>    {activeOrder.customer.phone}</p>
                    <p><strong>Address:</strong>  {formatFullAddress(activeOrder.deliveryAddress).join(', ')}</p>
                    {activeOrder.paymentMethod === 'cod' && (
                      <p className="dba-cod-collect">
                        💵 Collect <strong>₹{activeOrder.pricing?.total}</strong> cash from customer
                      </p>
                    )}
                  </div>
                  <p className="dba-otp-instruction">
                    Send a one-time password to the customer's phone. They'll read it out to you.
                  </p>
                  {otpError && <p className="dba-otp-error">❌ {otpError}</p>}
                  <div className="dba-otp-actions">
                    <button className="dba-btn dba-btn-clear" onClick={closeOtpModal}>Cancel</button>
                    <button className="dba-btn dba-btn-verify" onClick={handleSendOtp} disabled={sendingOtp}>
                      {sendingOtp ? '📤 Sending…' : '📱 Send OTP to Customer'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {otpStep === 'enter' && (
              <>
                <div className="dba-otp-header">
                  <h3>🔐 Enter Customer OTP</h3>
                  <button className="close-btn" onClick={closeOtpModal} disabled={verifying}>✕</button>
                </div>
                <div className="dba-otp-body">
                  <div style={{
                    padding: '10px 14px', background: '#f0fdf4',
                    borderRadius: 10, border: '1px solid #86efac',
                    fontSize: 13, marginBottom: 16,
                  }}>
                    ✅ OTP sent to <strong>{activeOrder.customer.phone}</strong>. Ask the customer for the code.
                  </div>

                  <div className="dba-otp-order-summary">
                    <p><strong>Order:</strong>    {activeOrder.orderNumber}</p>
                    <p><strong>Customer:</strong> {activeOrder.customer.name}</p>
                    {activeOrder.paymentMethod === 'cod' && (
                      <p className="dba-cod-collect">
                        💵 Collect <strong>₹{activeOrder.pricing?.total}</strong> cash from customer
                      </p>
                    )}
                  </div>

                  <p className="dba-otp-instruction">Enter the 6-digit OTP the customer received.</p>

                  <div className="dba-otp-input-row">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => (otpRefs.current[i] = el)}
                        type="text" inputMode="numeric" maxLength={1}
                        value={digit}
                        className={`dba-otp-box ${otpError ? 'error' : ''}`}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onFocus={e => e.target.select()}
                        disabled={verifying}
                      />
                    ))}
                  </div>

                  {otpError && <p className="dba-otp-error">❌ {otpError}</p>}

                  <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', margin: '8px 0' }}>
                    Customer didn't get it?{' '}
                    <button
                      type="button" onClick={handleResend} disabled={resendTimer > 0}
                      style={{
                        background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600,
                        cursor: resendTimer > 0 ? 'default' : 'pointer',
                        color:  resendTimer > 0 ? '#9ca3af' : '#06b6d4',
                      }}
                    >
                      Resend OTP{resendTimer > 0 && ` (${resendTimer}s)`}
                    </button>
                  </p>

                  <div className="dba-otp-actions">
                    <button className="dba-btn dba-btn-clear" onClick={resetOtpDigits} disabled={verifying}>
                      🔄 Clear
                    </button>
                    <button
                      className="dba-btn dba-btn-verify"
                      onClick={handleManualSubmit}
                      disabled={verifying || otpDigits.join('').length < 6}
                    >
                      {verifying ? '⏳ Verifying…' : '✅ Confirm Delivery'}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryBoyApp;