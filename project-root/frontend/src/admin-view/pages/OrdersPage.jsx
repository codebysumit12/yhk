import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../../config/api';
import './orders-page.css';

// ─── CustomerName ─────────────────────────────────────────────────────────────
// FIX Bug 5: cache lives in a useRef (no setState → no re-render cascade).
// getCustomerDisplayName is now a pure async helper that receives the cache ref
// and its updater so it never closes over stale state.
const getCustomerDisplayName = async (order, cacheRef, API_URL, token) => {
  if (order.customer?.name && order.customer.name !== 'Customer') {
    return order.customer.name;
  }
  if (order.user?.name) return order.user.name;
  if (order.createdBy?.name && order.createdBy.name !== 'Admin Manager') {
    return order.createdBy.name;
  }

  const userId =
    order.userId?._id || order.userId || order.user?._id || order.user;

  if (!userId) return 'Guest Customer';

  // Check ref-based cache first (no re-render on hit)
  if (cacheRef.current[userId]) return cacheRef.current[userId];
  
  // Cache failed attempts to prevent repeated 404s
  if (cacheRef.current[`failed_${userId}`]) return 'Guest Customer';

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Handle 404 and other HTTP errors gracefully
    if (!response.ok) {
      if (response.status === 404) {
        // User not found - cache as failed to prevent repeated requests
        cacheRef.current[`failed_${userId}`] = true;
        return 'Guest Customer';
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    if (userData.success && userData.data?.name) {
      cacheRef.current[userId] = userData.data.name; // mutate ref, no render
      return userData.data.name;
    }
  } catch (error) {
    // Only log unexpected errors, not 404s
    if (!error.message.includes('HTTP 404')) {
      console.error('Error fetching user data:', error);
    }
  }

  return 'Guest Customer';
};

const CustomerName = ({ order, cacheRef, API_URL, token }) => {
  const [displayName, setDisplayName] = useState('…');

  useEffect(() => {
    let cancelled = false;
    getCustomerDisplayName(order, cacheRef, API_URL, token).then(name => {
      if (!cancelled) setDisplayName(name);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]); // only re-run when the order itself changes

  return <strong>{displayName}</strong>;
};

// ─── OrdersPage ───────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Delivery assignment state
  const [deliveryBoys, setDeliveryBoys]     = useState([]);
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningId, setAssigningId]       = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
const [orderToCancel, setOrderToCancel] = useState(null);
const [cancelReason, setCancelReason] = useState('');
const [cancelLoading, setCancelLoading] = useState(false);

  // FIX Bug 5: use a ref for the customer-name cache so reads/writes never
  // trigger re-renders of the entire orders list.
  const customerNamesRef = useRef({});

  const API_URL = API_CONFIG.API_URL;
  const token   = localStorage.getItem('userToken') || localStorage.getItem('token');




  // ── Handle Cancel Order ───────────────────────────────────────────────────
const handleCancelOrder = (order) => {
  // Check if order can be cancelled
  if (order.status === 'out-for-delivery') {
    alert('⚠️ Cannot cancel order that is out for delivery. Please contact the delivery partner.');
    return;
  }

  if (order.status === 'delivered') {
    alert('⚠️ Cannot cancel an order that has already been delivered.');
    return;
  }

  if (order.status === 'cancelled') {
    alert('⚠️ This order is already cancelled.');
    return;
  }

  setOrderToCancel(order);
  setCancelReason('');
  setShowCancelModal(true);
};

// ── Submit Cancellation ───────────────────────────────────────────────────
const submitCancellation = async () => {
  if (!cancelReason.trim()) {
    alert('Please provide a reason for cancellation');
    return;
  }

  setCancelLoading(true);

  try {
    const response = await fetch(`${API_URL}/orders/${orderToCancel._id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: cancelReason,
        cancelledBy: 'restaurant'
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Order cancelled successfully');
      fetchOrders();
      setShowCancelModal(false);
      setOrderToCancel(null);
      setCancelReason('');
    } else {
      alert(data.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('Failed to cancel order. Please try again.');
  } finally {
    setCancelLoading(false);
  }
};


  // ── Fetch orders ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`${API_URL}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        console.error('Authentication failed — token invalid or expired');
        alert('Login failed. Please log in again.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        console.error('API Error:', data.message);
        alert(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, API_URL, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Fetch delivery boys ───────────────────────────────────────────────────
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        // FIX Bug 1: only ever surface genuine delivery_partner accounts.
        // The "fallback to all active users" has been removed — it was unsafe
        // and produced inconsistent behaviour vs deliveries-page.
        const deliveryUsers = (data.data || []).filter(
          user => user.role === 'delivery_partner' && user.isActive === true
        );
        setDeliveryBoys(deliveryUsers);
      } else {
        console.error('Delivery boys API error:', data);
      }
    } catch (err) {
      console.error('Error fetching delivery boys:', err);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchDeliveryBoys();
  }, [fetchDeliveryBoys]);

  // ── Assign delivery boy ───────────────────────────────────────────────────
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
        // FIX Bug 4: refresh both orders AND delivery boys so the dropdown
        // reflects any availability change on the backend.
        await Promise.all([fetchOrders(), fetchDeliveryBoys()]);

        // Clear only the selection for this order
        setAssignSelections(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      } else {
        alert(data.message || 'Failed to assign delivery boy');
      }
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
      alert('Failed to assign delivery boy');
    } finally {
      setAssigningId(null);
    }
  };

  // ── Update order status ───────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
        if (selectedOrder?._id === orderId) setSelectedOrder(data.data);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // ── View order details ─────────────────────────────────────────────────────
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // ── Filters / derived data ────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer?.phone?.includes(searchTerm));
    const matchesType = filterType === 'all' || order.orderType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total:          orders.length,
    pending:        orders.filter(o => o.status === 'pending').length,
    confirmed:      orders.filter(o => o.status === 'confirmed').length,
    preparing:      orders.filter(o => o.status === 'preparing').length,
    outForDelivery: orders.filter(o => o.status === 'out-for-delivery').length,
    delivered:      orders.filter(o => o.status === 'delivered').length,
    cancelled:      orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const statusConfig = {
    'pending':          { label: 'Pending',          color: '#f59e0b', icon: '⏳' },
    'confirmed':        { label: 'Confirmed',         color: '#22c55e', icon: '✅' },
    'preparing':        { label: 'Preparing',         color: '#3b82f6', icon: '👨‍🍳' },
    'ready':            { label: 'Ready',             color: '#8b5cf6', icon: '✓'  },
    'out-for-delivery': { label: 'Out for Delivery',  color: '#06b6d4', icon: '🛵' },
    'delivered':        { label: 'Delivered',         color: '#10b981', icon: '✓'  },
    'cancelled':        { label: 'Cancelled',         color: '#ef4444', icon: '✕'  },
  };

  const orderTypeConfig = {
    'dine_in':  { label: 'Dine In',   icon: '🍽️' },
    'takeaway': { label: 'Takeaway',  icon: '🛍️' },
    'delivery': { label: 'Delivery',  icon: '🚚' },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="orders-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>📦 Orders Management</h2>
          <p>Manage and track all customer orders</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div><p className="stat-value">{stats.total}</p><p className="stat-label">Total Orders</p></div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div><p className="stat-value">{stats.pending}</p><p className="stat-label">Pending</p></div>
        </div>
        <div className="stat-card preparing">
          <div className="stat-icon">👨‍🍳</div>
          <div><p className="stat-value">{stats.preparing}</p><p className="stat-label">Preparing</p></div>
        </div>
        <div className="stat-card delivery">
          <div className="stat-icon">🛵</div>
          <div><p className="stat-value">{stats.outForDelivery}</p><p className="stat-label">Out for Delivery</p></div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div><p className="stat-value">{stats.delivered}</p><p className="stat-label">Delivered</p></div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div><p className="stat-value">₹{totalRevenue.toFixed(2)}</p><p className="stat-label">Total Revenue</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by order number, customer name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="preparing">👨‍🍳 Preparing</option>
          <option value="ready">✓ Ready</option>
          <option value="out-for-delivery">🛵 Out for Delivery</option>
          <option value="delivered">✓ Delivered</option>
          <option value="cancelled">✕ Cancelled</option>
        </select>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="dine_in">🍽️ Dine In</option>
          <option value="takeaway">🛍️ Takeaway</option>
          <option value="delivery">🚚 Delivery</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>{searchTerm || filterStatus !== 'all' || filterType !== 'all'
            ? 'Try adjusting your search or filters'
            : 'No orders have been placed yet'}</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Order #</th>
                <th style={{ width: '16%' }}>Customer</th>
                <th style={{ width: '8%' }}>Type</th>
                <th style={{ width: '8%' }}>Items</th>
                <th style={{ width: '8%' }}>Total</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '14%' }}>Assigned Boy</th>
                <th style={{ width: '8%' }}>Payment</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  {/* Order Number */}
                  <td>
                    <span className="order-number">{order.orderNumber}</span>
                    <small className="order-date">{new Date(order.createdAt).toLocaleDateString()}</small>
                  </td>

                  {/* Customer — FIX Bug 5: pass ref + config, no setState in helper */}
                  <td>
                    <div className="customer-info">
                      <CustomerName
                        order={order}
                        cacheRef={customerNamesRef}
                        API_URL={API_URL}
                        token={token}
                      />
                      <small>{order.customer?.phone}</small>
                    </div>
                  </td>

                  {/* Order Type */}
                  <td>
                    <div className="type-display">
                      <div className="icon-label">
                        {orderTypeConfig[order.orderType]?.icon || '❓'}{' '}
                        {orderTypeConfig[order.orderType]?.label || 'Unknown'}
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td>
                    <div className="items-count">
                      {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </td>

                  {/* Total */}
                  <td>
                    <div className="order-total">₹{order.pricing?.total || 0}</div>
                  </td>

                  {/* Status */}
                  <td>
                    <div
                      className="status-display"
                      style={{
                        background: statusConfig[order.status]?.color + '20',
                        color:      statusConfig[order.status]?.color,
                      }}
                    >
                      <div className="icon-label">
                        {statusConfig[order.status]?.icon} {statusConfig[order.status]?.label}
                      </div>
                    </div>
                  </td>

                  {/* Assigned Boy — single dropdown, assigned name shown as placeholder */}
                  <td>
                    <div className="assign-cell">
                      <select
                        className="assign-select"
                        value={assignSelections[order._id] || ''}
                        onChange={e =>
                          setAssignSelections(prev => ({ ...prev, [order._id]: e.target.value }))
                        }
                        disabled={order.status === 'cancelled'}
                      >
                        <option value="">
                          {order.delivery?.deliveryPerson?.name
                            ? `✓ ${order.delivery.deliveryPerson.name}`
                            : '— select boy —'}
                        </option>
                        {deliveryBoys.map(boy => (
                          <option key={boy._id} value={boy._id}>
                            {boy.name} ({boy.phone})
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-assign"
                        disabled={!assignSelections[order._id] || assigningId === order._id || order.status === 'cancelled'}
                        onClick={() => assignDeliveryBoy(order._id)}
                      >
                        {assigningId === order._id ? '…' : 'Assign'}
                      </button>
                      {order.status === 'cancelled' && (
                        <div className="assign-disabled-note">
                          Order cancelled - cannot assign delivery
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Payment - FIXED: Removed payment method display */}
                  <td>
                    <div className="payment-info">
                      <span className={`payment-badge ${order.paymentStatus}`}>
                        {order.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
<td>
  <div className="table-actions">
    <button
      className="table-action-btn view"
      onClick={() => viewOrderDetails(order)}
      title="View Details"
    >👁️</button>

    {order.status === 'pending' && (
      <>
        <button 
          className="table-action-btn confirm" 
          onClick={() => updateOrderStatus(order._id, 'confirmed')} 
          title="Confirm Order"
        >✅</button>
        <button 
          className="table-action-btn cancel" 
          onClick={() => handleCancelOrder(order)} 
          title="Cancel Order"
        >❌</button>
      </>
    )}

    {order.status === 'confirmed' && (
      <>
        <button 
          className="table-action-btn prepare" 
          onClick={() => updateOrderStatus(order._id, 'preparing')} 
          title="Start Preparing"
        >👨‍🍳</button>
        <button 
          className="table-action-btn cancel" 
          onClick={() => handleCancelOrder(order)} 
          title="Cancel Order"
        >❌</button>
      </>
    )}

    {order.status === 'preparing' && (
      <>
        <button 
          className="table-action-btn ready" 
          onClick={() => updateOrderStatus(order._id, 'ready')} 
          title="Mark Ready"
        >✓</button>
        <button 
          className="table-action-btn cancel" 
          onClick={() => handleCancelOrder(order)} 
          title="Cancel Order"
        >❌</button>
      </>
    )}

    {order.status === 'ready' && order.orderType === 'delivery' && (
      <>
        <button 
          className="table-action-btn dispatch" 
          onClick={() => updateOrderStatus(order._id, 'out-for-delivery')} 
          title="Dispatch for Delivery"
        >🛵</button>
        <button 
          className="table-action-btn cancel" 
          onClick={() => handleCancelOrder(order)} 
          title="Cancel Order"
        >❌</button>
      </>
    )}

    {/* ✅ Takeaway/Dine-in can be marked delivered by admin */}
    {order.status === 'ready' && order.orderType !== 'delivery' && (
      <button 
        className="table-action-btn deliver" 
        onClick={() => updateOrderStatus(order._id, 'delivered')} 
        title="Mark Delivered"
      >✓</button>
    )}

    {/* ❌ REMOVED: Delivery orders can ONLY be confirmed by delivery partner */}
    {/* No delivery confirmation button for 'out-for-delivery' status */}

    {order.status === 'cancelled' && (
      <span className="cancelled-badge">❌ Cancelled</span>
    )}

    {order.status === 'delivered' && (
      <span className="delivered-badge">✅ Delivered</span>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.orderNumber}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body order-details-modal">
              <div className="order-info-grid">
                {/* Order Items */}
                <div className="info-card full-width">
                  <h4>🍽️ Order Items</h4>
                  <div className="order-items-list">
                    {(selectedOrder.orderItems || []).map((item, index) => (
                      <div key={index} className="order-item-row">
                        <div className="item-image">
                          {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-image">🍽️</div>}
                        </div>
                        <div className="item-details">
                          <strong>{item.name}</strong>
                          <small>Quantity: {item.quantity}</small>
                        </div>
                        <div className="item-price">
                          ₹{item.price} × {item.quantity} = ₹{item.subtotal}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel Order Modal */}
{showCancelModal && orderToCancel && (
  <div className="modal-overlay" onClick={() => !cancelLoading && setShowCancelModal(false)}>
    <div className="modal cancel-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>❌ Cancel Order - {orderToCancel.orderNumber}</h3>
        <button 
          className="close-btn" 
          onClick={() => setShowCancelModal(false)}
          disabled={cancelLoading}
        >✕</button>
      </div>

      <div className="modal-body">
        <div className="cancel-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Are you sure you want to cancel this order?</strong>
            <p>This action cannot be undone. The customer will be notified.</p>
          </div>
        </div>

        <div className="cancel-order-info">
          <div className="info-row">
            <span>Order #:</span>
            <strong>{orderToCancel.orderNumber}</strong>
          </div>
          <div className="info-row">
            <span>Customer:</span>
            <strong>{orderToCancel.customer?.name || 'Unknown Customer'}</strong>
          </div>
          <div className="info-row">
            <span>Total Amount:</span>
            <strong>₹{orderToCancel.pricing?.total || 0}</strong>
          </div>
          <div className="info-row">
            <span>Status:</span>
            <span 
              className="status-badge"
              style={{ 
                background: statusConfig[orderToCancel.status]?.color + '20',
                color: statusConfig[orderToCancel.status]?.color 
              }}
            >
              {statusConfig[orderToCancel.status]?.icon} {statusConfig[orderToCancel.status]?.label}
            </span>
          </div>
        </div>

        <div className="cancel-reason-section">
          <label htmlFor="cancel-reason">
            <strong>Reason for Cancellation *</strong>
          </label>
          <textarea
            id="cancel-reason"
            className="cancel-reason-input"
            placeholder="Please provide a reason for cancelling this order..."
            rows="4"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            disabled={cancelLoading}
          />
          <small className="input-hint">This will be visible to the customer</small>
        </div>

        <div className="cancel-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelLoading}
          >
            Keep Order
          </button>
          <button 
            className="btn-danger"
            onClick={submitCancellation}
            disabled={cancelLoading || !cancelReason.trim()}
          >
            {cancelLoading ? '⏳ Cancelling...' : '❌ Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

                {/* Customer Info */}
                <div className="info-card">
                  <h4>👤 Customer Information</h4>
                  <div className="info-content">
                    <p><strong>Name:</strong> <CustomerName order={selectedOrder} cacheRef={customerNamesRef} API_URL={API_URL} token={token} /></p>
                    <p><strong>Email:</strong> {selectedOrder.customer?.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="info-card">
                  <h4>📦 Order Information</h4>
                  <div className="info-content">
                    <p><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
                    <p><strong>Type:</strong> {orderTypeConfig[selectedOrder.orderType]?.icon} {orderTypeConfig[selectedOrder.orderType]?.label}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="status-badge" style={{ background: statusConfig[selectedOrder.status]?.color + '20', color: statusConfig[selectedOrder.status]?.color }}>
                        {statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                  <div className="info-card">
                    <h4>📍 Delivery Address</h4>
                    <div className="info-content">
                      <p>{selectedOrder.deliveryAddress.street || 'N/A'}</p>
                      {selectedOrder.deliveryAddress.apartment && <p>{selectedOrder.deliveryAddress.apartment}</p>}
                      <p>{selectedOrder.deliveryAddress.city || 'N/A'}, {selectedOrder.deliveryAddress.state || 'N/A'} - {selectedOrder.deliveryAddress.zipCode || 'N/A'}</p>
                      {selectedOrder.deliveryAddress.landmark && <p><strong>Landmark:</strong> {selectedOrder.deliveryAddress.landmark}</p>}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="info-card">
                  <h4>💳 Payment Information</h4>
                  <div className="info-content">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod?.toUpperCase() || 'N/A'}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`payment-badge ${selectedOrder.paymentStatus}`}>
                        {selectedOrder.paymentStatus?.toUpperCase()}
                      </span>
                    </p>
                    {selectedOrder.transactionId && <p><strong>Transaction ID:</strong> {selectedOrder.transactionId}</p>}
                  </div>
                </div>

                {/* Customer Rating */}
                {selectedOrder.status === 'delivered' && (
                  <div className="info-card">
                    <h4>⭐ Customer Rating</h4>
                    <div className="info-content">
                      {selectedOrder.rating?.stars ? (
                        <>
                          <p>
                            <strong>Stars:</strong>{' '}
                            <span style={{ color: '#f59e0b', fontSize: 18, letterSpacing: 2 }}>
                              {'★'.repeat(selectedOrder.rating.stars)}
                              {'☆'.repeat(5 - selectedOrder.rating.stars)}
                            </span>{' '}
                            ({selectedOrder.rating.stars}/5)
                          </p>
                          {selectedOrder.rating.comment && (
                            <p><strong>Comment:</strong> {selectedOrder.rating.comment}</p>
                          )}
                          <p>
                            <strong>Rated at:</strong>{' '}
                            {new Date(selectedOrder.rating.ratedAt).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p style={{ color: '#9ca3af' }}>Customer has not rated this order yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="info-card full-width">
                <h4>💰 Pricing Breakdown</h4>
                <div className="pricing-table">
                  <div className="pricing-row"><span>Subtotal:</span><span>₹{selectedOrder.pricing?.subtotal || 0}</span></div>
                  <div className="pricing-row"><span>Delivery Fee:</span><span>₹{selectedOrder.pricing?.deliveryFee || 0}</span></div>
                  <div className="pricing-row"><span>Tax (5%):</span><span>₹{(selectedOrder.pricing?.tax || 0).toFixed(2)}</span></div>
                  {(selectedOrder.pricing?.discount || 0) > 0 && (
                    <div className="pricing-row discount"><span>Discount:</span><span>-₹{selectedOrder.pricing.discount}</span></div>
                  )}
                  <div className="pricing-row total">
                    <strong>Total:</strong><strong>₹{(selectedOrder.pricing?.total || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="info-card full-width">
                  <h4>📝 Special Instructions</h4>
                  <p>{selectedOrder.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
