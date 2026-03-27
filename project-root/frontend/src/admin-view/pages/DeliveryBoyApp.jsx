import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../../config/api';
import './delivery-boy-app.css';

/**
 * DeliveryBoyApp
 * ─────────────
 * This page is for logged-in delivery boy.
 * It shows:
 *   1. Their assigned & active deliveries
 *   2. An OTP entry screen to verify delivery on arrival
 *   3. Status timeline per order
 *
 * The delivery boy logs in with their own credentials (role: 'delivery_partner').
 * Their _id is stored as 'deliveryBoyId' in localStorage.
 */

// ── Helper: build a Google Maps navigation URL ────────────────────────────────
// Prefers lat/lng coordinates (most accurate, works even with ambiguous streets).
// Falls back to a full formatted address string if coordinates are absent.
// Supports common coordinate key shapes:
//   addr.coordinates.lat/lng  (GeoJSON-style embedded object)
//   addr.lat / addr.lng       (flat keys)
//   addr.lat / addr.lon       (alternative lon spelling)
const buildMapsUrl = (addr) => {
  if (!addr) return null;

  const lat = addr.coordinates?.lat ?? addr.lat;
  const lng = addr.coordinates?.lng ?? addr.lng ?? addr.lon;

  if (lat != null && lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  // Fallback: join every non-empty address part
  const fullAddress = [
    addr.street,
    addr.apartment,
    addr.landmark,
    addr.city,
    addr.state,
    addr.zipCode,
  ]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
};

// ── Helper: return address lines as an array for rendering ───────────────────
// Line 0  = street (primary, full weight)
// Line 1  = apartment (if present)
// Line 2  = landmark with pin emoji
// Line 3  = city, state – zipCode
const formatFullAddress = (addr) => {
  if (!addr) return ['—'];
  const lines = [];
  if (addr.street)    lines.push(addr.street);
  if (addr.apartment) lines.push(addr.apartment);
  if (addr.landmark)  lines.push(`📌 ${addr.landmark}`);
  const cityLine = [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
  if (cityLine)       lines.push(cityLine);
  return lines.length ? lines : ['—'];
};

const STATUS_STEPS = ['ready', 'picked_up', 'out-for-delivery', 'delivered'];

const DeliveryBoyApp = () => {
  const [myOrders, setMyOrders]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [otpDigits, setOtpDigits]     = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]       = useState('');
  const [otpSuccess, setOtpSuccess]   = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [statusView, setStatusView]   = useState('active'); // 'active' | 'completed'
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const API_URL = API_CONFIG.API_URL;
  const token   = localStorage.getItem('token') || localStorage.getItem('userToken');
  const boyId   = localStorage.getItem('deliveryBoyId');

  // ── Fetch orders assigned to this delivery boy ────────────────────────────
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/orders/my-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyOrders(data.data || []);
      else console.error('My deliveries API error:', data);
    } catch (err) {
      console.error('Error fetching my deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, boyId]);

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // ── Send OTP to customer ──────────────────────────────────────────────────
  const sendOtpToCustomer = async (order) => {
    try {
      const res  = await fetch(`${API_URL}/orders/${order._id}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        let message = 'OTP sent to customer successfully!';
        if (process.env.NODE_ENV === 'development' && data.data?.otp) {
          message = `OTP sent! For testing: ${data.data.otp}`;
        }
        setActiveOrder(order);
        resetOtp();
        alert(message);
      } else {
        alert('Failed to send OTP: ' + data.message);
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // ── Mark picked up ────────────────────────────────────────────────────────
  const markPickedUp = async (orderId) => {
    try {
      const res  = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'out-for-delivery' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMyOrders();
        setActiveOrder(data.data);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error marking picked up:', err);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && index < 5) otpRefs[index + 1].current?.focus();
    if (value && index === 5 && next.join('').length === 6) submitOtp(next.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const resetOtp = () => {
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setOtpSuccess(false);
    otpRefs[0].current?.focus();
  };

  // ── Submit OTP ────────────────────────────────────────────────────────────
  const submitOtp = async (otp) => {
    if (!activeOrder) return;
    setVerifying(true);
    setOtpError('');
    try {
      const res  = await fetch(`${API_URL}/orders/${activeOrder._id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccess(true);
        fetchMyOrders();
        setTimeout(() => {
          setActiveOrder(null);
          setOtpSuccess(false);
          resetOtp();
        }, 3000);
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setOtpError('Network error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = () => {
    const otp = otpDigits.join('');
    if (otp.length < 6) return setOtpError('Please enter all 6 digits.');
    submitOtp(otp);
  };

  // ── Derived lists ─────────────────────────────────────────────────────────
  const activeOrders    = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const displayOrders   = statusView === 'active' ? activeOrders : completedOrders;

  const todayEarnings = completedOrders
    .filter(o => new Date(o.delivery?.deliveredAt || o.updatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (o.delivery?.deliveryFee || o.pricing?.deliveryFee || 0), 0);

  const statusLabel = {
    'ready':            { text: 'Ready for Pickup', color: '#f59e0b', icon: '📋' },
    'out-for-delivery': { text: 'Out for Delivery', color: '#06b6d4', icon: '🚚' },
    'delivered':        { text: 'Delivered',        color: '#10b981', icon: '✅' },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dba-page">

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
          <div>
            <p className="dba-stat-value">{activeOrders.length}</p>
            <p className="dba-stat-label">Active Orders</p>
          </div>
        </div>
        <div className="dba-stat-card done">
          <div className="dba-stat-icon">✅</div>
          <div>
            <p className="dba-stat-value">{completedOrders.length}</p>
            <p className="dba-stat-label">Delivered Today</p>
          </div>
        </div>
        <div className="dba-stat-card earnings">
          <div className="dba-stat-icon">💰</div>
          <div>
            <p className="dba-stat-value">₹{todayEarnings.toFixed(0)}</p>
            <p className="dba-stat-label">Earnings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dba-tabs">
        <button
          className={`dba-tab ${statusView === 'active' ? 'active' : ''}`}
          onClick={() => setStatusView('active')}
        >
          🚚 Active ({activeOrders.length})
        </button>
        <button
          className={`dba-tab ${statusView === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusView('completed')}
        >
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
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

                {/* Card Header */}
                <div className="dba-order-card-header">
                  <div className="dba-order-meta">
                    <span className="dba-order-number">{order.orderNumber}</span>
                    <span
                      className="dba-status-badge"
                      style={{
                        background: (statusLabel[order.status]?.color + '20') || '#e5e7eb',
                        color:      statusLabel[order.status]?.color || '#374151',
                        border:     `1px solid ${statusLabel[order.status]?.color || '#d1d5db'}`,
                      }}
                    >
                      {statusLabel[order.status]?.icon} {statusLabel[order.status]?.text}
                    </span>
                  </div>
                  <span className="dba-order-time">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Customer + Address */}
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

                  {/* Full address — every part on its own line */}
                  <div className="dba-info-row">
                    <span className="dba-info-icon">📍</span>
                    <div className="dba-address-block">
                      {addrLines.map((line, i) => (
                        <span
                          key={i}
                          className={i === 0 ? 'dba-address-primary' : 'dba-address-secondary'}
                        >
                          {line}
                        </span>
                      ))}
                      {/* Subtle indicator when GPS coordinates are available */}
                      {hasCoords && (
                        <span className="dba-coords-badge">🎯 GPS coordinates available</span>
                      )}
                    </div>
                  </div>

                  <div className="dba-info-row">
                    <span className="dba-info-icon">🍽️</span>
                    <div>
                      <span>{order.orderItems?.length} item{order.orderItems?.length > 1 ? 's' : ''}</span>
                      <span className="dba-total">₹{order.pricing?.total}</span>
                      {order.paymentMethod === 'cod' && (
                        <span className="dba-cod-badge">💵 Collect Cash</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="dba-items-preview">
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <span key={i} className="dba-item-chip">{item.name} ×{item.quantity}</span>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <span className="dba-item-chip more">+{order.orderItems.length - 3} more</span>
                  )}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="dba-special-note">📝 {order.specialInstructions}</div>
                )}

                {/* CTA Buttons */}
                <div className="dba-card-actions">
                  {order.status === 'ready' && (
                    <button className="dba-btn dba-btn-pickup" onClick={() => markPickedUp(order._id)}>
                      🏪 Picked Up from Restaurant
                    </button>
                  )}

                  {order.status === 'out-for-delivery' && (
                    <>
                      <button className="dba-btn dba-btn-otp" onClick={() => sendOtpToCustomer(order)}>
                        📱 Send OTP to Customer
                      </button>
                      <button
                        className="dba-btn dba-btn-otp"
                        onClick={() => { setActiveOrder(order); resetOtp(); }}
                      >
                        🔐 Enter Delivery OTP
                      </button>
                    </>
                  )}

                  {order.status === 'delivered' && (
                    <div className="dba-delivered-badge">
                      ✅ Delivered
                      {order.delivery?.otpVerified && (
                        <span className="dba-otp-confirmed">🔐 OTP Confirmed</span>
                      )}
                    </div>
                  )}

                  {/* Navigate — opens GPS coordinates if present, full address otherwise */}
                  {order.status !== 'delivered' && mapsUrl && (
                    <a
                      className="dba-btn dba-btn-navigate"
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🗺️ Navigate
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* OTP Modal */}
      {activeOrder && (
        <div
          className="modal-overlay"
          onClick={() => { if (!verifying) { setActiveOrder(null); resetOtp(); } }}
        >
          <div className="dba-otp-modal" onClick={e => e.stopPropagation()}>
            <div id="recaptcha-container" style={{ display: 'none' }} />

            {otpSuccess ? (
              <div className="dba-otp-success">
                <div className="dba-success-icon">🎉</div>
                <h3>Delivery Confirmed!</h3>
                <p>Order <strong>{activeOrder.orderNumber}</strong> has been successfully delivered.</p>
                <p className="dba-success-sub">Closing automatically…</p>
              </div>
            ) : (
              <>
                <div className="dba-otp-header">
                  <h3>🔐 Enter Delivery OTP</h3>
                  <button
                    className="close-btn"
                    onClick={() => { setActiveOrder(null); resetOtp(); }}
                    disabled={verifying}
                  >✕</button>
                </div>

                <div className="dba-otp-body">
                  <div className="dba-otp-order-summary">
                    <p><strong>Order:</strong> {activeOrder.orderNumber}</p>
                    <p><strong>Customer:</strong> {activeOrder.customer.name}</p>
                    <p><strong>Phone:</strong> {activeOrder.customer.phone}</p>
                    {/* Full address in modal */}
                    <p>
                      <strong>Address:</strong>{' '}
                      {formatFullAddress(activeOrder.deliveryAddress).join(', ')}
                    </p>
                    {activeOrder.paymentMethod === 'cod' && (
                      <p className="dba-cod-collect">
                        💵 Collect <strong>₹{activeOrder.pricing?.total}</strong> cash from customer
                      </p>
                    )}
                  </div>

                  <p className="dba-otp-instruction">
                    Ask the customer for the 6-digit OTP sent to their phone/app.
                  </p>

                  {activeOrder.delivery?.otpGeneratedAt && (
                    <div className="dba-otp-status">
                      <span className="dba-otp-sent">✅ OTP sent to customer</span>
                      <span className="dba-otp-time">
                        Sent at {new Date(activeOrder.delivery.otpGeneratedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  <div className="dba-otp-input-row">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
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

                  <div className="dba-otp-actions">
                    <button
                      className="dba-btn dba-btn-verify"
                      onClick={handleManualSubmit}
                      disabled={verifying || otpDigits.join('').length < 6}
                    >
                      {verifying ? '⏳ Verifying…' : '✅ Confirm Delivery'}
                    </button>
                    <button
                      className="dba-btn dba-btn-clear"
                      onClick={resetOtp}
                      disabled={verifying}
                    >
                      🔄 Clear
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