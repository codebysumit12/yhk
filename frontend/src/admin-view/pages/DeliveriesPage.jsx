import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../../config/api';
import './deliveries-page.css';

const DeliveriesPage = () => {
  const [deliveries,       setDeliveries]       = useState([]);
  const [deliveryBoys,     setDeliveryBoys]     = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningId,      setAssigningId]      = useState(null);

  const API_URL = API_CONFIG.API_URL;
  const token   = localStorage.getItem('userToken') || localStorage.getItem('token');

  // ── Fetch deliveries ──────────────────────────────────────────────────────
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `${API_URL}/orders?status=ready,out-for-delivery,delivered`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setDeliveries(data.data || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  // ── Fetch delivery boys ───────────────────────────────────────────────────
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryBoys(
          (data.data || []).filter(u => u.role === 'delivery_partner' && u.isActive)
        );
      }
    } catch (err) {
      console.error('Error fetching delivery boys:', err);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchDeliveries();
    fetchDeliveryBoys();
  }, [fetchDeliveries, fetchDeliveryBoys]);

  // ── Assign delivery boy ───────────────────────────────────────────────────
  const assignDeliveryBoy = async (orderId) => {
    const boyId = assignSelections[orderId];
    if (!boyId) return;
    setAssigningId(orderId);
    try {
      const res  = await fetch(`${API_URL}/orders/${orderId}/assign-delivery`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ deliveryBoyId: boyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDeliveries();
        await fetchDeliveryBoys();
        setAssignSelections(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      } else {
        alert(data.message || 'Failed to assign delivery boy');
      }
    } catch {
      alert('Failed to assign delivery boy');
    } finally {
      setAssigningId(null);
    }
  };

  // ── Dispatch order ────────────────────────────────────────────────────────
  const dispatchOrder = async (orderId) => {
    try {
      const res  = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: 'out-for-delivery' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveries();
        setShowDetailsModal(false);
      } else {
        alert(data.message || 'Failed to dispatch order');
      }
    } catch {
      alert('Failed to dispatch order');
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredDeliveries = deliveries.filter(d => {
    const matchSearch =
      d.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer?.phone?.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:          deliveries.length,
    unassigned:     deliveries.filter(d => !d.delivery?.deliveryPerson).length,
    outForDelivery: deliveries.filter(d => d.status === 'out-for-delivery').length,
    delivered:      deliveries.filter(d => d.status === 'delivered').length,
  };

  // ── Sub-components ────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      ready:              { label: 'Ready',            color: '#8b5cf6', icon: '✓'  },
      'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🚚' },
      delivered:          { label: 'Delivered',        color: '#10b981', icon: '✅' },
    };
    const c = map[status] || { label: status, color: '#6b7280', icon: '•' };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        background: c.color + '18', color: c.color, border: `1px solid ${c.color}40`,
      }}>
        {c.icon} {c.label}
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
            <strong>{assigned.name || 'N/A'}</strong>
            <small>{assigned.phone || 'N/A'}</small>
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
          onChange={e => setAssignSelections(p => ({ ...p, [delivery._id]: e.target.value }))}
        >
          <option value="">— select boy —</option>
          {deliveryBoys.map(boy => (
            <option key={boy._id} value={boy._id}>{boy.name} ({boy.phone})</option>
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="deliveries-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🛵 Deliveries Management</h2>
          <p>Assign delivery boys and dispatch orders — OTP confirmation is handled by the delivery partner</p>
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
                <th style={{ width: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery._id}>

                  {/* Order # */}
                  <td>
                    <span className="order-number">{delivery.orderNumber}</span>
                    <small className="order-date">{new Date(delivery.createdAt).toLocaleDateString()}</small>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="customer-info">
                      <strong>{delivery.customer?.name || 'Guest Customer'}</strong>
                      <small>{delivery.customer?.phone || 'N/A'}</small>
                    </div>
                  </td>

                  {/* Address */}
                  <td>
                    <div className="address-info">
                      <span>{delivery.deliveryAddress?.street || '—'}</span>
                      {delivery.deliveryAddress?.city && (
                        <small>{delivery.deliveryAddress.city}</small>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td>
                    <span className="order-total">₹{delivery.pricing?.total || 0}</span>
                    <small className={`payment-badge ${delivery.paymentStatus}`}>
                      {delivery.paymentStatus?.toUpperCase()}
                    </small>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={delivery.status} />
                  </td>

                  {/* Assigned Boy */}
                  <td>
                    <AssignCell delivery={delivery} />
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions">
                      <button
                        className="table-action-btn view"
                        title="View Details"
                        onClick={() => { setSelectedDelivery(delivery); setShowDetailsModal(true); }}
                      >
                        👁️
                      </button>
                      {delivery.status === 'ready' && delivery.delivery?.deliveryPerson && (
                        <button
                          className="table-action-btn dispatch"
                          title="Dispatch for Delivery"
                          onClick={() => dispatchOrder(delivery._id)}
                        >
                          🚚
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Details Modal ─────────────────────────────────────────────────── */}
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
                  <p><strong>Name:</strong>  {selectedDelivery.customer?.name || 'Unknown Customer'}</p>
                  <p><strong>Phone:</strong> {selectedDelivery.customer?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedDelivery.customer?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="info-card">
                <h4>📍 Delivery Address</h4>
                <div className="info-content">
                  <p>{selectedDelivery.deliveryAddress?.street}</p>
                  {selectedDelivery.deliveryAddress?.apartment && (
                    <p>{selectedDelivery.deliveryAddress.apartment}</p>
                  )}
                  <p>
                    {selectedDelivery.deliveryAddress?.city}, {selectedDelivery.deliveryAddress?.state} — {selectedDelivery.deliveryAddress?.zipCode}
                  </p>
                  {selectedDelivery.deliveryAddress?.landmark && (
                    <p><strong>Landmark:</strong> {selectedDelivery.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h4>📦 Order Info</h4>
                <div className="info-content">
                  <p><strong>Order #:</strong> {selectedDelivery.orderNumber}</p>
                  <p><strong>Items:</strong>   {selectedDelivery.orderItems?.length || 0}</p>
                  <p><strong>Total:</strong>   ₹{selectedDelivery.pricing?.total || 0}</p>
                  <p><strong>Payment:</strong> {selectedDelivery.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>

              {selectedDelivery.delivery?.deliveryPerson && (
                <div className="info-card">
                  <h4>🛵 Delivery Boy</h4>
                  <div className="info-content">
                    <p><strong>Name:</strong>  {selectedDelivery.delivery.deliveryPerson?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedDelivery.delivery.deliveryPerson?.phone || 'N/A'}</p>
                    {selectedDelivery.delivery.deliveryPerson?.vehicleNumber && (
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

              {selectedDelivery.status === 'ready' && selectedDelivery.delivery?.deliveryPerson && (
                <div className="info-card full-width">
                  <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => dispatchOrder(selectedDelivery._id)}
                  >
                    🚚 Dispatch for Delivery
                  </button>
                </div>
              )}

              {selectedDelivery.status === 'out-for-delivery' && (
                <div className="info-card full-width" style={{
                  background: '#f0fdf4', border: '1px solid #86efac',
                  fontSize: 13, color: '#16a34a', textAlign: 'center', padding: '12px',
                }}>
                  🔐 Delivery confirmation is handled by the delivery partner via OTP
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveriesPage;