import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RatingModal from './RatingModal';
import YHKLoader from './Yhkloader';
import { API_CONFIG } from '../../config/api';
import './MyOrders.css';
import './rating-feature.css';

const MyOrders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cancel state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel]     = useState(null);
  const [cancelReason, setCancelReason]       = useState('');
  const [cancelLoading, setCancelLoading]     = useState(false);

  // Rating state
  const [ratingOrder, setRatingOrder] = useState(null); // order being rated

  const navigate = useNavigate();
  const API_URL  = API_CONFIG.API_URL;
  const token    = localStorage.getItem('userToken') || localStorage.getItem('token');
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setOrders(data.data);
      else console.error('API returned error:', data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const viewOrderDetails = (order) => { setSelectedOrder(order); setShowDetailsModal(true); };
  const trackOrder       = (orderNumber) => navigate(`/track-order?order=${orderNumber}&phone=${user.phone}`);

  const handleReorder = (order) => {
    const cart = order.orderItems.map(item => ({
      id: item.menuItem, name: item.name, price: item.price,
      quantity: item.quantity, image: item.image,
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  // ── Customer-side cancel ──────────────────────────────────────────────────
  // Customers can only cancel while the order is still pending.
  const CUSTOMER_CANCELLABLE = ['pending'];

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelReason.trim()) { alert('Please provide a reason for cancellation'); return; }
    setCancelLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${orderToCancel._id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: cancelReason, cancelledBy: 'customer' }),
      });
      const data = await response.json();
      if (data.success) {
        fetchMyOrders();
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

  // ── Filter ────────────────────────────────────────────────────────────────
  const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'];

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all')       return true;
    if (filterStatus === 'active')    return ACTIVE_STATUSES.includes(order.status);
    if (filterStatus === 'completed') return order.status === 'delivered';
    if (filterStatus === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const statusConfig = {
    'pending':          { label: 'Pending',          color: '#f59e0b', icon: '⏳' },
    'confirmed':        { label: 'Confirmed',         color: '#22c55e', icon: '✅' },
    'preparing':        { label: 'Preparing',         color: '#3b82f6', icon: '👨‍🍳' },
    'ready':            { label: 'Ready',             color: '#8b5cf6', icon: '✓'  },
    'out-for-delivery': { label: 'Out for Delivery',  color: '#06b6d4', icon: '🛵' },
    'delivered':        { label: 'Delivered',         color: '#10b981', icon: '👍'  },
    'cancelled':        { label: 'Cancelled',         color: '#ef4444', icon: '✕'  },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📦 My Orders</h1>
            <p>View and track all your orders</p>
          </div>
          <button className="refresh-btn" onClick={fetchMyOrders} disabled={loading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {[
            { key: 'all',       label: `All Orders (${orders.length})` },
            { key: 'active',    label: `Active (${orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length})` },
            { key: 'completed', label: `Completed (${orders.filter(o => o.status === 'delivered').length})` },
            { key: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled').length})` },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filterStatus === tab.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <YHKLoader message="Loading your orders..." />
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🍽️</div>
            <h3>No Orders Yet</h3>
            <p>{filterStatus === 'all'
              ? "You haven't placed any orders yet. Start exploring our menu!"
              : `No ${filterStatus} orders found.`}
            </p>
            <button className="explore-btn" onClick={() => navigate('/')}>🍔 Explore Menu</button>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order, index) => (
              <div key={`order-${order._id || order.orderNumber || index}`} className={`order-card ${order.status === 'cancelled' ? 'order-card-cancelled' : ''}`}>

                {/* Header */}
                <div className="order-card-header">
                  <div className="order-number-section">
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: statusConfig[order.status]?.color + '20',
                      color:      statusConfig[order.status]?.color,
                      border:     `1px solid ${statusConfig[order.status]?.color}40`,
                    }}
                  >
                    {statusConfig[order.status]?.icon} {statusConfig[order.status]?.label}
                  </span>
                </div>

                {/* Items preview */}
                <div className="order-items-preview">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={`order-preview-${index}-${item._id || item.name}`} className="order-item-preview">
                      <div className="item-preview-image">
                        {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-image">🍽️</div>}
                      </div>
                      <div className="item-preview-details">
                        <strong>{item.name}</strong>
                        <small>Qty: {item.quantity}</small>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="more-items">+{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}</div>
                  )}
                </div>

                {/* Cancellation reason pill — shown on card when cancelled */}
                {order.status === 'cancelled' && order.cancellation?.reason && (
                  <div className="cancellation-reason-pill">
                    <span className="reason-label">Reason:</span> {order.cancellation.reason}
                  </div>
                )}

                {/* Order meta */}
                <div className="order-info-row">
                  <div className="info-item">
                    <span className="info-label">Total Amount</span>
                    <span className="info-value price">₹{order.pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Items</span>
                    <span className="info-value">{order.orderItems.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment</span>
                    <span className={`info-value ${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="order-actions">
                  <button className="action-btn secondary" onClick={() => viewOrderDetails(order)}>
                    📄 View Details
                  </button>

                  {ACTIVE_STATUSES.includes(order.status) && (
                    <button className="action-btn primary" onClick={() => trackOrder(order.orderNumber)}>
                      📍 Track Order
                    </button>
                  )}

                  {/* Customer can only cancel pending orders */}
                  {CUSTOMER_CANCELLABLE.includes(order.status) && (
                    <button className="action-btn danger" onClick={() => openCancelModal(order)}>
                      ✕ Cancel
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <>
                      {order.rating?.stars ? (
                        <button 
                          className="action-btn rated"
                          onClick={() => setRatingOrder(order)}
                        >
                          {'★'.repeat(order.rating.stars)}{'☆'.repeat(5 - order.rating.stars)}
                        </button>
                      ) : (
                        <button 
                          className="action-btn rating"
                          onClick={() => setRatingOrder(order)}
                        >
                          ⭐ Rate Order
                        </button>
                      )}
                      <button 
                        className="action-btn primary"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Reorder
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ── Order Details Modal ── */}
        {showDetailsModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details — {selectedOrder.orderNumber}</h3>
                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
              </div>

              <div className="modal-body order-details">
                {/* Status & Date */}
                <div className="detail-section">
                  <div className="detail-row">
                    <span className="detail-label">Order Status:</span>
                    <span
                      className="status-badge"
                      style={{
                        background: statusConfig[selectedOrder.status]?.color + '20',
                        color:      statusConfig[selectedOrder.status]?.color,
                      }}
                    >
                      {statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Order Date:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Order Type:</span>
                    <span className="order-type-badge">
                      {selectedOrder.orderType === 'delivery' ? '🚚 Delivery'
                        : selectedOrder.orderType === 'takeaway' ? '🛍️ Takeaway'
                        : '🍽️ Dine In'}
                    </span>
                  </div>
                </div>

                {/* Cancellation block — shown when cancelled */}
                {selectedOrder.status === 'cancelled' && selectedOrder.cancellation && (
                  <div className="detail-section cancellation-detail-block">
                    <h4>❌ Cancellation Details</h4>
                    <div className="detail-row">
                      <span className="detail-label">Reason:</span>
                      <span>{selectedOrder.cancellation.reason}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Cancelled by:</span>
                      <span style={{ textTransform: 'capitalize' }}>{selectedOrder.cancellation.cancelledBy}</span>
                    </div>
                    {selectedOrder.cancellation.cancelledAt && (
                      <div className="detail-row">
                        <span className="detail-label">Cancelled at:</span>
                        <span>{new Date(selectedOrder.cancellation.cancelledAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="detail-section">
                  <h4>📦 Order Items</h4>
                  <div className="modal-order-items">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={`modal-item-${index}-${item._id || item.name}`} className="modal-order-item">
                        <div className="modal-item-image">
                          {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-image">🍽️</div>}
                        </div>
                        <div className="modal-item-details">
                          <strong>{item.name}</strong>
                          <small>Quantity: {item.quantity}</small>
                        </div>
                        <div className="modal-item-price">
                          ₹{item.price} × {item.quantity}
                          <strong>₹{item.subtotal}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="detail-section">
                  <h4>💰 Price Breakdown</h4>
                  <div className="price-breakdown">
                    <div className="price-row"><span>Subtotal</span><span>₹{selectedOrder.pricing.subtotal}</span></div>
                    <div className="price-row"><span>Delivery Fee</span><span>₹{selectedOrder.pricing.deliveryFee}</span></div>
                    <div className="price-row"><span>Tax (5%)</span><span>₹{selectedOrder.pricing.tax.toFixed(2)}</span></div>
                    {selectedOrder.pricing.discount > 0 && (
                      <div className="price-row discount"><span>Discount</span><span>-₹{selectedOrder.pricing.discount}</span></div>
                    )}
                    <div className="price-row total">
                      <strong>Total Amount</strong>
                      <strong>₹{selectedOrder.pricing.total.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                  <div className="detail-section">
                    <h4>📍 Delivery Address</h4>
                    <div className="address-display">
                      <p>{selectedOrder.deliveryAddress.street}</p>
                      {selectedOrder.deliveryAddress.apartment && <p>{selectedOrder.deliveryAddress.apartment}</p>}
                      <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}</p>
                      {selectedOrder.deliveryAddress.landmark && (
                        <p className="landmark">Landmark: {selectedOrder.deliveryAddress.landmark}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="detail-section">
                  <h4>💳 Payment Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span>{selectedOrder.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`payment-status ${selectedOrder.paymentStatus}`}>
                      {selectedOrder.paymentStatus === 'paid' && '✓ '}
                      {selectedOrder.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {ACTIVE_STATUSES.includes(selectedOrder.status) && (
                  <button className="btn-primary" onClick={() => { setShowDetailsModal(false); trackOrder(selectedOrder.orderNumber); }}>
                    📍 Track This Order
                  </button>
                )}
                {selectedOrder.status === 'delivered' && (
                  <button className="btn-primary" onClick={() => { setShowDetailsModal(false); handleReorder(selectedOrder); }}>
                    🔄 Reorder
                  </button>
                )}
                {/* Rate from within details modal too */}
                {selectedOrder.status === 'delivered' && (
                  <button
                    className={`btn-rate-modal ${selectedOrder.rating?.stars ? 'already-rated' : ''}`}
                    onClick={() => { setShowDetailsModal(false); setRatingOrder(selectedOrder); }}
                  >
                    {selectedOrder.rating?.stars
                      ? `${'★'.repeat(selectedOrder.rating.stars)} View Rating`
                      : '⭐ Rate This Order'}
                  </button>
                )}
                {CUSTOMER_CANCELLABLE.includes(selectedOrder.status) && (
                  <button className="btn-danger" onClick={() => { setShowDetailsModal(false); openCancelModal(selectedOrder); }}>
                    ✕ Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Cancel Order Modal ── */}
        {showCancelModal && orderToCancel && (
          <div className="modal-overlay" onClick={() => !cancelLoading && setShowCancelModal(false)}>
            <div className="modal cancel-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cancel Order — {orderToCancel.orderNumber}</h3>
                <button className="close-btn" onClick={() => setShowCancelModal(false)} disabled={cancelLoading}>✕</button>
              </div>
              <div className="modal-body">
                <div className="cancel-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-text">
                    <strong>Are you sure you want to cancel?</strong>
                    <p>Orders can only be cancelled while still pending. This cannot be undone.</p>
                  </div>
                </div>

                <div className="cancel-order-info">
                  <div className="info-row"><span>Order #:</span><strong>{orderToCancel.orderNumber}</strong></div>
                  <div className="info-row"><span>Total:</span><strong>₹{orderToCancel.pricing?.total || 0}</strong></div>
                </div>

                <div className="cancel-reason-section">
                  <label htmlFor="cancel-reason-customer"><strong>Reason for Cancellation *</strong></label>
                  <textarea
                    id="cancel-reason-customer"
                    className="cancel-reason-input"
                    placeholder="Tell us why you're cancelling..."
                    rows="3"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    disabled={cancelLoading}
                  />
                </div>

                <div className="cancel-actions">
                  <button className="btn-secondary" onClick={() => setShowCancelModal(false)} disabled={cancelLoading}>Keep Order</button>
                  <button className="btn-danger" onClick={submitCancellation} disabled={cancelLoading || !cancelReason.trim()}>
                    {cancelLoading ? '⏳ Cancelling...' : '✕ Cancel Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Rating Modal ── */}
        {ratingOrder && (
          <RatingModal
            order={ratingOrder}
            token={token}
            onClose={() => setRatingOrder(null)}
            onSubmit={() => {
              setRatingOrder(null);
              fetchMyOrders(); // refresh so the star count updates on the card
            }}
          />
        )}

      </div>
    </div>
  );
};

export default MyOrders;