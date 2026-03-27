import React, { useState, useEffect } from 'react';
import './trackmyorder.css';
import { API_CONFIG } from '../../config/api';

const TrackOrder = () => {
  const [trackingMode, setTrackingMode] = useState('loading'); // 'loading', 'orders', 'tracking'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const API_URL = API_CONFIG.API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      setTrackingMode('loading');
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        const response = await fetch(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
          setTrackingMode(data.data.length > 0 ? 'orders' : 'empty');
        } else {
          setError(data.message || 'Failed to fetch orders');
          setTrackingMode('error');
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
        setError('Failed to fetch your orders. Please try again.');
        setTrackingMode('error');
      } finally {
        setTrackingMode('orders');
      }
    };
    fetchOrders();
  }, [API_URL]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setTrackingMode('tracking');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setTrackingMode('orders');
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User cancelled the prompt

    setCancelling(true);
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${selectedOrder._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Customer requested cancellation' })
      });

      const data = await response.json();
      if (data.success) {
        // Update the selected order with cancellation info
        setSelectedOrder({
          ...selectedOrder,
          status: 'cancelled',
          cancellation: {
            reason: reason || 'Customer requested cancellation',
            cancelledAt: new Date().toISOString()
          }
        });
        
        // Update the order in the orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, status: 'cancelled', cancellation: data.data.cancellation }
              : order
          )
        );
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
  const currentStatusIndex = selectedOrder ? orderStatuses.indexOf(selectedOrder.status) : -1;
  const isCancelled = selectedOrder?.status === 'cancelled';

  // Check if order can be cancelled (only pending and confirmed orders)
  const canCancelOrder = selectedOrder && 
    !isCancelled && 
    (selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed');

  const statusConfig = {
    'pending':          { label: 'Order Placed',      icon: '📝', color: '#f59e0b', message: 'Your order has been received' },
    'confirmed':        { label: 'Confirmed',          icon: '✅', color: '#22c55e', message: 'Restaurant confirmed your order' },
    'preparing':        { label: 'Preparing',          icon: '👨‍🍳', color: '#3b82f6', message: 'Your food is being prepared' },
    'ready':            { label: 'Ready',              icon: '🎉', color: '#8b5cf6', message: 'Order is ready for pickup/delivery' },
    'out-for-delivery': { label: 'Out for Delivery',   icon: '🛵', color: '#06b6d4', message: 'Your order is on the way' },
    'delivered':        { label: 'Delivered',          icon: '✓',  color: '#10b981', message: 'Order delivered successfully' },
    'cancelled':        { label: 'Cancelled',          icon: '✕',  color: '#ef4444', message: 'Order has been cancelled' },
  };

  return (
    <div className="track-order-page">

      {/* Loading */}
      {trackingMode === 'loading' && (
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">⏳</div>
              <h1>Loading Your Orders</h1>
              <p>Please wait while we fetch your order history...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {trackingMode === 'error' && (
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">⚠️</div>
              <h1>Error</h1>
              <p>{error}</p>
            </div>
            <div className="track-help">
              <a href="/menu" className="track-btn"><span>🍽️</span> Browse Menu</a>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {trackingMode === 'empty' && (
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">📦</div>
              <h1>No Orders Yet</h1>
              <p>You haven't placed any orders yet. Start ordering to see them here!</p>
            </div>
            <div className="track-help">
              <a href="/menu" className="track-btn"><span>🍽️</span> Browse Menu</a>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {trackingMode === 'orders' && (
        <div className="track-results-container">
          <div className="results-header">
            <div className="order-header-info">
              <h1>My Orders</h1>
              <span className="order-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card" onClick={() => handleSelectOrder(order)}>
                <div className="order-card-header">
                  <div className="order-number">#{order.orderNumber}</div>
                  <span className={`status-badge status-${order.status}`}>
                    {statusConfig[order.status]?.icon} {statusConfig[order.status]?.label}
                  </span>
                </div>
                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.orderItems?.slice(0, 3).map((item, index) => (
                      <span key={index} className="item-preview">{item.name} x{item.quantity}</span>
                    ))}
                    {order.orderItems?.length > 3 && (
                      <span className="more-items">+{order.orderItems.length - 3} more</span>
                    )}
                  </div>
                  {/* Show cancellation reason inline on list card */}
                  {order.status === 'cancelled' && order.cancellation?.reason && (
                    <div className="order-cancel-reason">
                      Reason: {order.cancellation.reason}
                    </div>
                  )}
                  <div className="order-meta">
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="order-total">₹{order.pricing?.total || order.totalAmount || 0}</span>
                  </div>
                </div>
                <div className="order-card-footer">
                  <span className="track-order-btn">
                    {order.status === 'cancelled' ? 'View Details →' : 'Track Order →'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Detail */}
      {trackingMode === 'tracking' && selectedOrder && (
        <div className="track-results-container">

          {/* Header */}
          <div className="results-header">
            <button className="back-btn" onClick={handleBackToOrders}>← Back to Orders</button>
            <div className="order-header-info">
              <h1>Order #{selectedOrder.orderNumber}</h1>
              <span className={`status-badge status-${selectedOrder.status}`}>
                {statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}
              </span>
            </div>
          </div>

          <div className="tracking-columns">

            {/* ── Left: Timeline ── */}
            <div className="timeline-section">
              <div className="section-card timeline-card">
                <div className="timeline-header">
                  <h2>📍 Order Journey</h2>
                  <div className="progress-indicator">
                    <div className="progress-text">
                      {selectedOrder.status === 'delivered' ? '✓ Completed'
                        : isCancelled ? '✕ Cancelled'
                        : `${currentStatusIndex + 1} of ${orderStatuses.length} steps`}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: isCancelled
                            ? '100%'
                            : `${((currentStatusIndex + 1) / orderStatuses.length) * 100}%`,
                          background: isCancelled
                            ? '#ef4444'
                            : 'linear-gradient(90deg, #22c55e, #16a34a)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cancelled banner — replaces timeline steps */}
                {isCancelled ? (
                  <div className="cancelled-timeline-banner">
                    <div className="cancelled-banner-icon">✕</div>
                    <div>
                      <strong>This order was cancelled</strong>
                      {selectedOrder.cancellation?.reason && (
                        <p>{selectedOrder.cancellation.reason}</p>
                      )}
                      {selectedOrder.cancellation?.cancelledAt && (
                        <small>
                          {new Date(selectedOrder.cancellation.cancelledAt).toLocaleString('en-IN', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="status-timeline">
                    {orderStatuses.map((status, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent   = index === currentStatusIndex;
                      const config      = statusConfig[status];
                      const timelineEntry = selectedOrder.timeline?.find(t => t.status === status);

                      return (
                        <div
                          key={status}
                          className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                          {index < orderStatuses.length - 1 && (
                            <div className={`timeline-connector ${isCompleted ? 'active' : ''}`} />
                          )}
                          <div className="timeline-marker-wrapper">
                            <div
                              className="timeline-marker"
                              style={{
                                background:   isCompleted ? config.color : '#f1f5f9',
                                borderColor:  isCompleted ? config.color : '#cbd5e1',
                                boxShadow:    isCurrent ? `0 0 0 8px ${config.color}20` : 'none',
                              }}
                            >
                              <span className="marker-icon">{config.icon}</span>
                              {isCurrent && <span className="pulse-ring" />}
                            </div>
                            {isCurrent && <div className="current-indicator">Current</div>}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title">
                              <h4 style={{ color: isCompleted ? config.color : '#64748b' }}>{config.label}</h4>
                              {isCompleted && !isCurrent && <span className="check-icon">✓</span>}
                            </div>
                            <p className="timeline-message">{config.message}</p>
                            {timelineEntry && (
                              <div className="timeline-timestamp">
                                <span className="clock-icon">🕐</span>
                                {new Date(timelineEntry.timestamp).toLocaleString('en-IN', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ETA */}
                {!isCancelled &&
                  selectedOrder.status !== 'delivered' &&
                  selectedOrder.delivery?.estimatedTime && (
                  <div className="estimated-time-card">
                    <div className="eta-icon-wrapper"><div className="eta-icon">⏰</div></div>
                    <div className="eta-content">
                      <div className="eta-label">Estimated Delivery Time</div>
                      <div className="eta-time">
                        {new Date(selectedOrder.delivery.estimatedTime).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                      <div className="eta-countdown">
                        {(() => {
                          const diffMinutes = Math.floor((new Date(selectedOrder.delivery.estimatedTime) - new Date()) / 60000);
                          if (diffMinutes > 0) {
                            const h = Math.floor(diffMinutes / 60), m = diffMinutes % 60;
                            return h > 0 ? `${h}h ${m}m remaining` : `${m} minutes remaining`;
                          }
                          return 'Arriving soon!';
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery person */}
                {!isCancelled &&
                  selectedOrder.delivery?.deliveryPerson &&
                  selectedOrder.status === 'out-for-delivery' && (
                  <div className="delivery-person-card">
                    <div className="delivery-header">
                      <h3>🛵 Delivery Partner</h3>
                      <span className="delivery-badge">On the way</span>
                    </div>
                    <div className="delivery-details">
                      <div className="delivery-avatar">
                        <div className="avatar-circle">
                          {selectedOrder.delivery.deliveryPerson.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>
                      <div className="delivery-info">
                        <div className="info-group">
                          <span className="info-icon">👤</span>
                          <div>
                            <div className="info-label">Name</div>
                            <div className="info-value">{selectedOrder.delivery.deliveryPerson.name || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="info-group">
                          <span className="info-icon">📱</span>
                          <div>
                            <div className="info-label">Phone</div>
                            <div className="info-value">{selectedOrder.delivery.deliveryPerson.phone || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="info-group">
                          <span className="info-icon">🏍️</span>
                          <div>
                            <div className="info-label">Vehicle</div>
                            <div className="info-value">{selectedOrder.delivery.deliveryPerson.vehicleNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <a href={`tel:${selectedOrder.delivery.deliveryPerson.phone || '#'}`} className="call-delivery-btn">
                      <span className="btn-icon">📞</span> Call Delivery Partner
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Order details ── */}
            <div className="details-section">

              {/* Order Items */}
              <div className="section-card">
                <h2>🍽️ Order Items</h2>
                <div className="order-items-list">
                  {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-image">🍽️</div>}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              {selectedOrder.pricing && (
                <div className="section-card">
                  <h2>💰 Price Details</h2>
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
              )}

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div className="section-card">
                  <h2>📍 Delivery Address</h2>
                  <div className="address-details">
                    <p>{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.phone}</p>
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
              <div className="section-card">
                <h2>💳 Payment Information</h2>
                <div className="payment-info">
                  <div className="info-row">
                    <span>Method:</span>
                    <strong className="payment-method">
                      {(selectedOrder.paymentMethod || selectedOrder.payment?.method || 'ONLINE').toUpperCase()}
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>Status:</span>
                    <span className={`payment-status ${selectedOrder.paymentStatus || selectedOrder.payment?.status || 'pending'}`}>
                      {(selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'paid') && '✓ '}
                      {(selectedOrder.paymentStatus || selectedOrder.payment?.status || 'pending').toUpperCase()}
                    </span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="info-row">
                      <span>Transaction ID:</span>
                      <span className="transaction-id">{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancel Order Button */}
              {canCancelOrder && (
                <div className="section-card">
                  <button 
                    className="cancel-order-btn"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : '❌ Cancel Order'}
                  </button>
                  <p className="cancel-note">
                    You can only cancel orders that are pending or confirmed. Once preparation starts, cancellation is not possible.
                  </p>
                </div>
              )}

              {/* Cancellation details card */}
              {isCancelled && selectedOrder.cancellation && (
                <div className="section-card cancellation-card">
                  <h2>❌ Cancellation Details</h2>
                  <div className="payment-info">
                    <div className="info-row">
                      <span>Reason:</span>
                      <span>{selectedOrder.cancellation.reason || '—'}</span>
                    </div>
                    <div className="info-row">
                      <span>Cancelled by:</span>
                      <span style={{ textTransform: 'capitalize' }}>{selectedOrder.cancellation.cancelledBy || '—'}</span>
                    </div>
                    {selectedOrder.cancellation.cancelledAt && (
                      <div className="info-row">
                        <span>Cancelled at:</span>
                        <span>
                          {new Date(selectedOrder.cancellation.cancelledAt).toLocaleString('en-IN', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;