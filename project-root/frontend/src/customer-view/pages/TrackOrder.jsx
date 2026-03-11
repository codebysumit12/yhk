import React, { useState, useEffect } from 'react';
import './TrackOrder.css';

const TrackOrder = () => {
  const [trackingMode, setTrackingMode] = useState('loading'); // 'loading', 'orders', 'tracking'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const API_URL = 'http://localhost:5001/api';

  // Check if user is authenticated and get their orders
  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      try {
        // Get user info from localStorage or context
        const userInfo = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userInfo || !token) {
          setError('Please login to track your orders');
          setTrackingMode('error');
          return;
        }

        const user = JSON.parse(userInfo);
        setUser(user);

        // Fetch user's orders
        const response = await fetch(`${API_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setOrders(data.data);
          setTrackingMode(orders.length > 0 ? 'orders' : 'empty');
        } else {
          setError(data.message || 'Failed to fetch orders');
          setTrackingMode('error');
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
        setError('Failed to fetch your orders. Please try again.');
        setTrackingMode('error');
      }
    };

    checkAuthAndFetchOrders();
  }, []);

  // Select an order to track
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setTrackingMode('tracking');
  };

  // Go back to orders list
  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setTrackingMode('orders');
  };

  // Status configuration
  const statusConfig = {
    'pending': {
      label: 'Order Placed',
      icon: '📝',
      color: '#f59e0b',
      message: 'Your order has been received'
    },
    'confirmed': {
      label: 'Confirmed',
      icon: '✅',
      color: '#22c55e',
      message: 'Restaurant confirmed your order'
    },
    'preparing': {
      label: 'Preparing',
      icon: '👨‍🍳',
      color: '#3b82f6',
      message: 'Your food is being prepared'
    },
    'ready': {
      label: 'Ready',
      icon: '🎉',
      color: '#8b5cf6',
      message: 'Order is ready for pickup/delivery'
    },
    'out-for-delivery': {
      label: 'Out for Delivery',
      icon: '🛵',
      color: '#06b6d4',
      message: 'Your order is on the way'
    },
    'delivered': {
      label: 'Delivered',
      icon: '✓',
      color: '#10b981',
      message: 'Order delivered successfully'
    },
    'cancelled': {
      label: 'Cancelled',
      icon: '✕',
      color: '#ef4444',
      message: 'Order has been cancelled'
    }
  };

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
  const currentStatusIndex = selectedOrder ? orderStatuses.indexOf(selectedOrder.status) : -1;

  return (
    <div className="track-order-page">
      {trackingMode === 'loading' ? (
        /* Loading State */
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">⏳</div>
              <h1>Loading Your Orders</h1>
              <p>Please wait while we fetch your order history...</p>
            </div>
          </div>
        </div>
      ) : trackingMode === 'error' ? (
        /* Error State */
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">⚠️</div>
              <h1>Authentication Required</h1>
              <p>{error}</p>
            </div>
            <div className="track-help">
              <a href="/login" className="track-btn">
                <span>🔐</span>
                Login to Continue
              </a>
            </div>
          </div>
        </div>
      ) : trackingMode === 'empty' ? (
        /* Empty State */
        <div className="track-search-container">
          <div className="track-search-card">
            <div className="track-header">
              <div className="track-icon">📦</div>
              <h1>No Orders Yet</h1>
              <p>You haven't placed any orders yet. Start ordering to see them here!</p>
            </div>
            <div className="track-help">
              <a href="/menu" className="track-btn">
                <span>🍽️</span>
                Browse Menu
              </a>
            </div>
          </div>
        </div>
      ) : trackingMode === 'orders' ? (
        /* Orders List */
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
                    {order.orderItems && order.orderItems.slice(0, 3).map((item, index) => (
                      <span key={index} className="item-preview">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                    {order.orderItems && order.orderItems.length > 3 && (
                      <span className="more-items">+{order.orderItems.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="order-meta">
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="order-total">
                      ₹{order.pricing?.total || order.totalAmount || 0}
                    </span>
                  </div>
                </div>
                
                <div className="order-card-footer">
                  <span className="track-order-btn">Track Order →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
      /* Tracking Results */
      <div className="track-results-container">
        {/* Header */}
        <div className="results-header">
          <button className="back-btn" onClick={handleBackToOrders}>
            ← Back to Orders
          </button>
          <div className="order-header-info">
            <h1>Order #{selectedOrder.orderNumber}</h1>
            <span className={`status-badge status-${selectedOrder.status}`}>
              {statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="results-grid">
          {/* Left Column - Timeline */}
          <div className="timeline-section">
            <div className="section-card">
              <h2>📍 Order Timeline</h2>
              
              <div className="status-timeline">
                {orderStatuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const config = statusConfig[status];

                  return (
                    <div
                      key={status}
                      className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="timeline-marker" style={{
                        background: isCompleted ? config.color : '#e5e7eb',
                        borderColor: isCompleted ? config.color : '#e5e7eb'
                      }}>
                        <span>{config.icon}</span>
                      </div>
                      <div className="timeline-content">
                        <h4>{config.label}</h4>
                        <p>{config.message}</p>
                        {selectedOrder.timeline && selectedOrder.timeline.find(t => t.status === status) && (
                          <span className="timeline-time">
                            {new Date(selectedOrder.timeline.find(t => t.status === status).timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Time */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && selectedOrder.delivery && selectedOrder.delivery.estimatedTime && (
                <div className="estimated-time">
                  <div className="time-icon">⏰</div>
                  <div>
                    <strong>Estimated Delivery</strong>
                    <p>{new Date(selectedOrder.delivery.estimatedTime).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Delivery Person Info */}
              {selectedOrder.delivery && selectedOrder.delivery.deliveryPerson && selectedOrder.status === 'out-for-delivery' && (
                <div className="delivery-person">
                  <h3>🛵 Delivery Partner</h3>
                  <div className="delivery-info">
                    <p><strong>Name:</strong> {selectedOrder.delivery.deliveryPerson.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.delivery.deliveryPerson.phone}</p>
                    <p><strong>Vehicle:</strong> {selectedOrder.delivery.deliveryPerson.vehicleNumber}</p>
                  </div>
                  <a href={`tel:${selectedOrder.delivery.deliveryPerson.phone}`} className="call-btn">
                    📞 Call Delivery Partner
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="details-section">
            {/* Order Items */}
            <div className="section-card">
              <h2>🍽️ Order Items</h2>
              <div className="order-items-list">
                {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="no-image">🍽️</div>
                      )}
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            {selectedOrder.pricing && (
              <div className="section-card">
                <h2>💰 Price Details</h2>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.pricing.subtotal}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrder.pricing.deliveryFee}</span>
                  </div>
                  <div className="price-row">
                    <span>Tax (5%)</span>
                    <span>₹{selectedOrder.pricing.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="price-row discount">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.pricing.discount}</span>
                    </div>
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
                  {selectedOrder.deliveryAddress.apartment && (
                    <p>{selectedOrder.deliveryAddress.apartment}</p>
                  )}
                  <p>
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}
                  </p>
                  {selectedOrder.deliveryAddress.landmark && (
                    <p className="landmark">Landmark: {selectedOrder.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="section-card">
              <h2>💳 Payment Information</h2>
              <div className="payment-info">
                <div className="info-row">
                  <span>Method:</span>
                  <strong className="payment-method">{(selectedOrder.paymentMethod || selectedOrder.payment?.method || 'ONLINE').toUpperCase()}</strong>
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
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default TrackOrder;