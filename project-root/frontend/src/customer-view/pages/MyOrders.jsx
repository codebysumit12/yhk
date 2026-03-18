import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import { API_CONFIG } from '../../config/api';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch user's orders
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    console.log('🔍 Fetching orders - Token exists:', !!token);
    console.log('🔍 Token length:', token?.length);
    console.log('🔍 API URL:', API_URL);
    
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 Response data:', data);
      
      if (data.success) {
        setOrders(data.data);
        console.log('✅ Orders loaded:', data.data.length);
      } else {
        console.error('❌ API returned error:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Track order
  const trackOrder = (orderNumber) => {
    navigate(`/track-order?order=${orderNumber}&phone=${user.phone}`);
  };

  // Reorder
  const handleReorder = (order) => {
    // Add items to cart
    const cart = order.orderItems.map(item => ({
      id: item.menuItem,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status);
    }
    if (filterStatus === 'completed') {
      return order.status === 'delivered';
    }
    if (filterStatus === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  const statusConfig = {
    'pending': { label: 'Pending', color: '#f59e0b', icon: '⏳' },
    'confirmed': { label: 'Confirmed', color: '#22c55e', icon: '✅' },
    'preparing': { label: 'Preparing', color: '#3b82f6', icon: '👨‍🍳' },
    'ready': { label: 'Ready', color: '#8b5cf6', icon: '✓' },
    'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🛵' },
    'delivered': { label: 'Delivered', color: '#10b981', icon: '✓' },
    'cancelled': { label: 'Cancelled', color: '#ef4444', icon: '✕' }
  };

  return (
    <div className="my-orders-page">
      <Nav onOpenCart={() => {}} />
      
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
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active ({orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(o.status)).length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({orders.filter(o => o.status === 'delivered').length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilterStatus('cancelled')}
          >
            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🍽️</div>
            <h3>No Orders Yet</h3>
            <p>
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start exploring our menu!"
                : `No ${filterStatus} orders found.`}
            </p>
            <button className="explore-btn" onClick={() => navigate('/')}>
              🍔 Explore Menu
            </button>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div className="order-number-section">
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: statusConfig[order.status]?.color + '20',
                      color: statusConfig[order.status]?.color,
                      border: `1px solid ${statusConfig[order.status]?.color}40`
                    }}
                  >
                    {statusConfig[order.status]?.icon} {statusConfig[order.status]?.label}
                  </span>
                </div>

                {/* Order Items */}
                <div className="order-items-preview">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item-preview">
                      <div className="item-preview-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="no-image">🍽️</div>
                        )}
                      </div>
                      <div className="item-preview-details">
                        <strong>{item.name}</strong>
                        <small>Qty: {item.quantity}</small>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="more-items">
                      +{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Order Info */}
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

                {/* Order Actions */}
                <div className="order-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => viewOrderDetails(order)}
                  >
                    📄 View Details
                  </button>
                  
                  {['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(order.status) && (
                    <button 
                      className="action-btn primary"
                      onClick={() => trackOrder(order.orderNumber)}
                    >
                      📍 Track Order
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button 
                      className="action-btn primary"
                      onClick={() => handleReorder(order)}
                    >
                      🔄 Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
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

              <div className="modal-body order-details">
                {/* Status & Date */}
                <div className="detail-section">
                  <div className="detail-row">
                    <span className="detail-label">Order Status:</span>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: statusConfig[selectedOrder.status]?.color + '20',
                        color: statusConfig[selectedOrder.status]?.color
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
                      {selectedOrder.orderType === 'delivery' ? '🚚 Delivery' : 
                       selectedOrder.orderType === 'takeaway' ? '🛍️ Takeaway' : '🍽️ Dine In'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <h4>📦 Order Items</h4>
                  <div className="modal-order-items">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="modal-order-item">
                        <div className="modal-item-image">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className="no-image">🍽️</div>
                          )}
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

                {/* Payment Info */}
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
                {['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(selectedOrder.status) && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      trackOrder(selectedOrder.orderNumber);
                    }}
                  >
                    📍 Track This Order
                  </button>
                )}
                {selectedOrder.status === 'delivered' && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleReorder(selectedOrder);
                    }}
                  >
                    🔄 Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;