import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../../config/api';
import './deliveries-page.css';

const DeliveriesPage = () => {
  const [deliveries, setDeliveries]             = useState([]);
  const [deliveryBoys, setDeliveryBoys]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [filterStatus, setFilterStatus]         = useState('all');
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDelivery, setOtpDelivery]   = useState(null);
  const [enteredOtp, setEnteredOtp]     = useState('');
  const [otpError, setOtpError]         = useState('');
  const [otpLoading, setOtpLoading]     = useState(false);

  // Per-row assign dropdown selections: { [orderId]: boyId }
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningId, setAssigningId]           = useState(null);

  const API_URL = API_CONFIG.API_URL;
  const token   = localStorage.getItem('userToken') || localStorage.getItem('token');

  /* ─── Fetch deliveries (ready + out-for-delivery + delivered) ─── */
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching deliveries with token:', token ? 'exists' : 'missing');
      const response = await fetch(
        `${API_URL}/orders?status=ready,out-for-delivery,delivered`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Deliveries response status:', response.status);
      const data = await response.json();
      console.log('Deliveries data:', data);
      if (data.success) setDeliveries(data.data || []);
      else console.error('Deliveries API error:', data);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  /* ─── Fetch available delivery boys ─────────────────────────── */
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      console.log('Fetching delivery boys with token:', token ? 'exists' : 'missing');
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delivery boys response status:', response.status);
      const data = await response.json();
      console.log('Delivery boys raw data:', data);
      if (data.success) {
        // Filter users with role 'delivery_partner' and isActive true
        const deliveryUsers = (data.data || []).filter(user => 
          user.role === 'delivery_partner' && user.isActive === true
        );
        console.log('Filtered delivery users:', deliveryUsers);
        setDeliveryBoys(deliveryUsers);
      } else {
        console.error('Delivery boys API error:', data);
      }
    } catch (err) {
      console.error('Error fetching delivery boys:', err);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchDeliveries();
    fetchDeliveryBoys();
  }, [fetchDeliveries, fetchDeliveryBoys]);

  /* ─── Assign delivery boy to order ──────────────────────────── */
  const assignDeliveryBoy = async (orderId) => {
    const boyId = assignSelections[orderId];
    if (!boyId) return;
    setAssigningId(orderId);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryBoyId: boyId }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchDeliveries();
        await fetchDeliveryBoys();
        setAssignSelections(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      } else {
        alert(data.message || 'Failed to assign delivery boy');
      }
    } catch (err) {
      alert('Failed to assign delivery boy');
    } finally {
      setAssigningId(null);
    }
  };

  /* ─── Update order status ────────────────────────────────────── */
  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchDeliveries();
        setShowDetailsModal(false);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update delivery status');
    }
  };

  /* ─── OTP verify ─────────────────────────────────────────────── */
  const openOtpModal = (delivery) => {
    setOtpDelivery(delivery);
    setEnteredOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  const verifyOtp = async () => {
    if (enteredOtp.length < 4) { setOtpError('Please enter a valid OTP'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await fetch(`${API_URL}/orders/${otpDelivery._id}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: enteredOtp }),
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        fetchDeliveries();
      } else {
        setOtpError(data.message || 'Incorrect OTP. Please try again.');
      }
    } catch (err) {
      setOtpError('Server error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ─── Filters ────────────────────────────────────────────────── */
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch =
      d.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer?.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:          deliveries.length,
    unassigned:     deliveries.filter(d => !d.delivery?.deliveryPerson).length,
    outForDelivery: deliveries.filter(d => d.status === 'out-for-delivery').length,
    delivered:      deliveries.filter(d => d.status === 'delivered').length,
  };

  /* ─── Sub-components ─────────────────────────────────────────── */
  const StatusBadge = ({ status }) => {
    const map = {
      'ready':            { label: 'Ready',            color: '#8b5cf6', icon: '✓' },
      'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🚚' },
      'delivered':        { label: 'Delivered',        color: '#10b981', icon: '✅' },
    };
    const cfg = map[status] || { label: status, color: '#6b7280', icon: '•' };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}40`,
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const AssignCell = ({ delivery }) => {
    const assigned = delivery.delivery?.deliveryPerson;
    if (assigned) {
      return (
        <div className="delivery-person">
          <div className="dp-avatar">{assigned.name?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <strong>{assigned.name}</strong>
            <small>{assigned.phone}</small>
            {assigned.vehicleNumber && <small>🛵 {assigned.vehicleNumber}</small>}
          </div>
        </div>
      );
    }
    return (
      <div className="assign-cell">
        <select
          className="assign-select"
          value={assignSelections[delivery._id] || ''}
          onChange={e =>
            setAssignSelections(prev => ({ ...prev, [delivery._id]: e.target.value }))
          }
        >
          <option value="">— select boy —</option>
          {deliveryBoys.map(boy => (
            <option key={boy._id} value={boy._id}>
              {boy.name} ({boy.phone})
            </option>
          ))}
        </select>
        <button
          className="btn-assign"
          disabled={!assignSelections[delivery._id] || assigningId === delivery._id}
          onClick={() => assignDeliveryBoy(delivery._id)}
        >
          {assigningId === delivery._id ? '…' : 'Assign'}
        </button>
      </div>
    );
  };

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="deliveries-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🛵 Deliveries Management</h2>
          <p>Assign delivery boys, dispatch orders & verify OTP on arrival</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">🛵</div>
          <div><p className="stat-value">{stats.total}</p><p className="stat-label">Total Deliveries</p></div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">👤</div>
          <div><p className="stat-value">{stats.unassigned}</p><p className="stat-label">Unassigned</p></div>
        </div>
        <div className="stat-card delivery">
          <div className="stat-icon">🚚</div>
          <div><p className="stat-value">{stats.outForDelivery}</p><p className="stat-label">Out for Delivery</p></div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div><p className="stat-value">{stats.delivered}</p><p className="stat-label">Delivered Today</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by order number, customer name or phone…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ready">✓ Ready to Dispatch</option>
          <option value="out-for-delivery">🚚 Out for Delivery</option>
          <option value="delivered">✅ Delivered</option>
        </select>
        <button className="btn-primary" onClick={fetchDeliveries}>🔄 Refresh</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading deliveries…</div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛵</div>
          <h3>No Deliveries Found</h3>
          <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No active deliveries right now'}</p>
        </div>
      ) : (
        <div className="deliveries-table-container">
          <table className="deliveries-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Order #</th>
                <th style={{ width: '17%' }}>Customer</th>
                <th style={{ width: '17%' }}>Address</th>
                <th style={{ width: '10%' }}>Amount</th>
                <th style={{ width: '13%' }}>Status</th>
                <th style={{ width: '23%' }}>Assigned Boy</th>
                <th style={{ width: 150, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery._id}>
                  <td>
                    <span className="order-number">{delivery.orderNumber}</span>
                    <small className="order-date">{new Date(delivery.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{delivery.customer.name}</strong>
                      <small>{delivery.customer.phone}</small>
                    </div>
                  </td>
                  <td>
                    <div className="address-info">
                      <span>{delivery.deliveryAddress?.street}</span>
                      {delivery.deliveryAddress?.city && <small>{delivery.deliveryAddress.city}</small>}
                    </div>
                  </td>
                  <td>
                    <span className="order-total">₹{delivery.pricing?.total || 0}</span>
                    <small className={`payment-badge ${delivery.paymentStatus}`}>
                      {delivery.paymentStatus?.toUpperCase()}
                    </small>
                  </td>
                  <td><StatusBadge status={delivery.status} /></td>
                  <td><AssignCell delivery={delivery} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn view"
                        title="View Details"
                        onClick={() => { setSelectedDelivery(delivery); setShowDetailsModal(true); }}
                      >👁️</button>

                      {/* Dispatch — only when assigned & ready */}
                      {delivery.status === 'ready' && delivery.delivery?.deliveryPerson && (
                        <button
                          className="table-action-btn dispatch"
                          title="Dispatch for Delivery"
                          onClick={() => updateDeliveryStatus(delivery._id, 'out-for-delivery')}
                        >🚚</button>
                      )}

                      {/* OTP verify — when out for delivery */}
                      {delivery.status === 'out-for-delivery' && (
                        <button
                          className="table-action-btn otp"
                          title="Verify OTP & Confirm Delivery"
                          onClick={() => openOtpModal(delivery)}
                        >🔐</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Details Modal ──────────────────────────────────────── */}
      {showDetailsModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delivery Details — {selectedDelivery.orderNumber}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body delivery-details-modal">
              <div className="info-card">
                <h4>👤 Customer</h4>
                <div className="info-content">
                  <p><strong>Name:</strong> {selectedDelivery.customer.name}</p>
                  <p><strong>Phone:</strong> {selectedDelivery.customer.phone}</p>
                  <p><strong>Email:</strong> {selectedDelivery.customer.email}</p>
                </div>
              </div>
              <div className="info-card">
                <h4>📍 Delivery Address</h4>
                <div className="info-content">
                  <p>{selectedDelivery.deliveryAddress?.street}</p>
                  {selectedDelivery.deliveryAddress?.apartment && <p>{selectedDelivery.deliveryAddress.apartment}</p>}
                  <p>{selectedDelivery.deliveryAddress?.city}, {selectedDelivery.deliveryAddress?.state} — {selectedDelivery.deliveryAddress?.zipCode}</p>
                  {selectedDelivery.deliveryAddress?.landmark && (
                    <p><strong>Landmark:</strong> {selectedDelivery.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>
              <div className="info-card">
                <h4>📦 Order Info</h4>
                <div className="info-content">
                  <p><strong>Order #:</strong> {selectedDelivery.orderNumber}</p>
                  <p><strong>Items:</strong> {selectedDelivery.orderItems?.length || 0}</p>
                  <p><strong>Total:</strong> ₹{selectedDelivery.pricing?.total || 0}</p>
                  <p><strong>Payment:</strong> {selectedDelivery.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>
              {selectedDelivery.delivery?.deliveryPerson && (
                <div className="info-card">
                  <h4>🛵 Delivery Boy</h4>
                  <div className="info-content">
                    <p><strong>Name:</strong> {selectedDelivery.delivery.deliveryPerson.name}</p>
                    <p><strong>Phone:</strong> {selectedDelivery.delivery.deliveryPerson.phone}</p>
                    {selectedDelivery.delivery.deliveryPerson.vehicleNumber && (
                      <p><strong>Vehicle:</strong> {selectedDelivery.delivery.deliveryPerson.vehicleNumber}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedDelivery.specialInstructions && (
                <div className="info-card full-width">
                  <h4>📝 Special Instructions</h4>
                  <p>{selectedDelivery.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── OTP Modal ─────────────────────────────────────────── */}
      {showOtpModal && otpDelivery && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal otp-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔐 Verify OTP — {otpDelivery.orderNumber}</h3>
              <button className="close-btn" onClick={() => setShowOtpModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="otp-info-box">
                <p>The customer has received a one-time password on their registered phone.</p>
                <p>Ask the customer for the OTP and enter it below to confirm successful delivery.</p>
              </div>

              <div className="otp-customer-row">
                <div className="otp-cust-avatar">{otpDelivery.customer.name?.[0]?.toUpperCase()}</div>
                <div>
                  <strong>{otpDelivery.customer.name}</strong>
                  <small>{otpDelivery.customer.phone}</small>
                </div>
                <div className="otp-amount">₹{otpDelivery.pricing?.total}</div>
              </div>

              <div className="otp-input-group">
                <label>Enter OTP received from customer</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  className={`otp-input ${otpError ? 'error' : ''}`}
                  value={enteredOtp}
                  autoFocus
                  onChange={e => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                />
                {otpError && <span className="otp-error-msg">⚠️ {otpError}</span>}
              </div>

              <div className="otp-actions">
                <button className="btn-secondary" onClick={() => setShowOtpModal(false)}>Cancel</button>
                <button
                  className="btn-verify"
                  disabled={otpLoading || enteredOtp.length < 4}
                  onClick={verifyOtp}
                >
                  {otpLoading ? 'Verifying…' : '✅ Confirm Delivery'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveriesPage;
