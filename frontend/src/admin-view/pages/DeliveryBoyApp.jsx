import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../../config/api';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../firebase';
import './delivery-boy-app.css';

// ── Helper: Google Maps URL ───────────────────────────────────────────────────
const buildMapsUrl = (addr) => {
  if (!addr) return null;
  const lat = addr.coordinates?.lat ?? addr.lat;
  const lng = addr.coordinates?.lng ?? addr.lng ?? addr.lon;
  if (lat != null && lng != null)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const fullAddress = [addr.street, addr.apartment, addr.landmark, addr.city, addr.state, addr.zipCode]
    .filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
};

// ── Helper: address lines array ───────────────────────────────────────────────
const formatFullAddress = (addr) => {
  if (!addr) return ['—'];
  const lines = [];
  if (addr.street)    lines.push(addr.street);
  if (addr.apartment) lines.push(addr.apartment);
  if (addr.landmark)  lines.push(`📌 ${addr.landmark}`);
  const cityLine = [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  return lines.length ? lines : ['—'];
};

// ── Normalise phone to 10-digit Indian number ─────────────────────────────────
const normalisePhone = (raw = '') => {
  let p = raw.replace(/\D/g, '');
  if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  if (p.startsWith('0'))  p = p.slice(1);
  return p; // 10 digits expected
};

const DeliveryBoyApp = () => {
  const [myOrders,    setMyOrders]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [statusView,  setStatusView]  = useState('active'); // 'active' | 'completed'

  // ── OTP modal state ───────────────────────────────────────────────────────
  const [activeOrder,        setActiveOrder]        = useState(null);
  const [otpStep,            setOtpStep]            = useState('send');   // 'send' | 'enter' | 'success'
  const [otpDigits,          setOtpDigits]          = useState(['', '', '', '', '']);
  const [otpError,           setOtpError]           = useState('');
  const [sendingOtp,         setSendingOtp]         = useState(false);
  const [verifying,          setVerifying]          = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [otpExpiredRef, setOtpExpiredRef] = useState(false);
  const [otpExpiredDisplay, setOtpExpiredDisplay] = useState(false);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(60);
  const [resendTimer, setResendTimer] = useState(45);
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  const otpRefs = useRef([null, null, null, null, null, null, null]);
  const isVerifyingRef = useRef(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Refs
  const isVerifyingRef       = useRef(false);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaRenderedRef = useRef(false);

  const API_URL = API_CONFIG.API_URL;
  const token   = localStorage.getItem('token') || localStorage.getItem('userToken');

  // ── Resend timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── OTP expiry timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (otpExpiryTimer <= 0) return;
    const t = setTimeout(() => setOtpExpiryTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [otpExpiryTimer]);

  // ── reCAPTCHA ─────────────────────────────────────────────────────────────
  const clearRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    const el = document.getElementById('dba-recaptcha-container');
    if (el) el.innerHTML = '';
    recaptchaRenderedRef.current = false;
  }, []);

  const initRecaptcha = useCallback(() => new Promise((resolve, reject) => {
    if (recaptchaRenderedRef.current && recaptchaVerifierRef.current)
      return resolve(recaptchaVerifierRef.current);

    const container = document.getElementById('dba-recaptcha-container');
    if (!container) return reject(new Error('reCAPTCHA container missing'));

    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    container.innerHTML = '';

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth, 'dba-recaptcha-container',
        {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => clearRecaptcha(),
        }
      );
      recaptchaVerifierRef.current
        .render()
        .then(() => { recaptchaRenderedRef.current = true; resolve(recaptchaVerifierRef.current); })
        .catch(err => { clearRecaptcha(); reject(err); });
    } catch (err) { clearRecaptcha(); reject(err); }
  }), [clearRecaptcha]);

  useEffect(() => () => clearRecaptcha(), [clearRecaptcha]);

  // ── Fetch my orders ───────────────────────────────────────────────────────
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/orders/my-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching my deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // ── Mark picked up ────────────────────────────────────────────────────────
  const markPickedUp = async (orderId) => {
    try {
      const res  = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: 'out-for-delivery' }),
      });
      const data = await res.json();
      if (data.success) fetchMyOrders();
      else alert(data.message || 'Failed to update status');
    } catch { console.error('Error marking picked up'); }
  };

  // ── Open OTP modal ────────────────────────────────────────────────────────
  const openOtpModal = (order) => {
    setActiveOrder(order);
    setOtpStep('send');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setConfirmationResult(null);
    setResendTimer(0);
    clearRecaptcha();
    // Pre-warm reCAPTCHA
    setTimeout(() => initRecaptcha().catch(() => {}), 400);
  };

  const closeOtpModal = () => {
    if (verifying) return;
    setActiveOrder(null);
    setOtpStep('send');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setConfirmationResult(null);
    clearRecaptcha();
  };

  // ── Send OTP via Firebase SMS → customer phone ────────────────────────────
  const handleSendOtp = async () => {
    const phone = normalisePhone(activeOrder?.customer?.phone);
    if (phone.length !== 10) { setOtpError('Customer phone number is invalid.'); return; }

    setSendingOtp(true);
    setOtpError('');
    try {
      const verifier     = await initRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      setConfirmationResult(confirmation);
      setOtpStep('enter');
      setResendTimer(45);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      clearRecaptcha();
      if      (err.code === 'auth/too-many-requests')    setOtpError('Too many attempts. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number') setOtpError('Customer phone number is invalid.');
      else                                               setOtpError('Failed to send OTP. Try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── OTP input ─────────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) handleVerifyOtp(next.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  // ── Verify OTP via Firebase, then mark delivered in backend ──────────────
  const handleVerifyOtp = async (otpOverride) => {
    const val = otpOverride || otpDigits.join('');
    if (val.length < 6)          { setOtpError('Enter all 6 digits.'); return; }
    if (isVerifyingRef.current)  return;
    if (!confirmationResult)     { setOtpError('Please send OTP first.'); return; }
    isVerifyingRef.current = true;

    setVerifying(true);
    setOtpError('');
    try {
      // 1️⃣  Firebase verifies the code
      await confirmationResult.confirm(val);

      // 2️⃣  Mark order as delivered in your backend
      const res  = await fetch(`${API_URL}/orders/${activeOrder._id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: 'delivered' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to mark delivered');

      setOtpStep('success');
      fetchMyOrders();
      setTimeout(closeOtpModal, 3000);
    } catch (err) {
      if      (err.code === 'auth/code-expired')               setOtpError('OTP expired. Please resend.');
      else if (err.code === 'auth/invalid-verification-code')  setOtpError('Incorrect OTP. Ask the customer again.');
      else if (err.message)                                    setOtpError(err.message);
      else                                                     setOtpError('Verification failed. Try again.');
      setOtpDigits(['', '', '', '', '', '']);
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
    setOtpDigits(['', '', '', '', '', '']);
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
      {/* reCAPTCHA — always in DOM, hidden */}
      <div id="dba-recaptcha-container" style={{ display: 'none' }} />

      {/* Header */}
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

      {/* Stats */}
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

      {/* Tabs */}
      <div className="dba-tabs">
        <button className={`dba-tab ${statusView === 'active' ? 'active' : ''}`} onClick={() => setStatusView('active')}>
          🚚 Active ({activeOrders.length})
        </button>
        <button className={`dba-tab ${statusView === 'completed' ? 'active' : ''}`} onClick={() => setStatusView('completed')}>
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {/* Orders list */}
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

                {/* Card header */}
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

                {/* Customer + address */}
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

                {/* Items preview */}
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

                {/* Actions */}
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

            {/* ── SUCCESS screen ── */}
            {otpStep === 'success' && (
              <div className="dba-otp-success">
                <div className="dba-success-icon">🎉</div>
                <h3>Delivery Confirmed!</h3>
                <p>Order <strong>{activeOrder.orderNumber}</strong> has been successfully delivered.</p>
                <p className="dba-success-sub">Closing automatically…</p>
              </div>
            )}

            {/* ── SEND screen ── */}
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

            {/* ── ENTER OTP screen ── */}
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

                  {/* OTP boxes */}
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

                  {/* Resend */}
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

  function resetOtpDigits() {
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    otpRefs.current[0]?.focus();
  }
};

export default DeliveryBoyApp;