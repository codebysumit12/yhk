import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../../config/api';
import './orders-page.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken');

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${API_URL}/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, API_URL, token]);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(data.data);
        }
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer && order.customer.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer && order.customer.phone && order.customer.phone.includes(searchTerm));
    
    const matchesType = filterType === 'all' || order.orderType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    outForDelivery: orders.filter(o => o.status === 'out-for-delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.pricing.total, 0);

  // Status configuration
  const statusConfig = {
    'pending': { label: 'Pending', color: '#f59e0b', icon: '⏳' },
    'confirmed': { label: 'Confirmed', color: '#22c55e', icon: '✅' },
    'preparing': { label: 'Preparing', color: '#3b82f6', icon: '👨‍🍳' },
    'ready': { label: 'Ready', color: '#8b5cf6', icon: '✓' },
    'out-for-delivery': { label: 'Out for Delivery', color: '#06b6d4', icon: '🛵' },
    'delivered': { label: 'Delivered', color: '#10b981', icon: '✓' },
    'cancelled': { label: 'Cancelled', color: '#ef4444', icon: '✕' }
  };

  const orderTypeConfig = {
    'dine_in': { label: 'Dine In', icon: '🍽️' },
    'takeaway': { label: 'Takeaway', icon: '🛍️' },
    'delivery': { label: 'Delivery', icon: '🚚' }
  };

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
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total Orders</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div>
            <p className="stat-value">{stats.pending}</p>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card preparing">
          <div className="stat-icon">👨‍🍳</div>
          <div>
            <p className="stat-value">{stats.preparing}</p>
            <p className="stat-label">Preparing</p>
          </div>
        </div>
        <div className="stat-card delivery">
          <div className="stat-icon">🛵</div>
          <div>
            <p className="stat-value">{stats.outForDelivery}</p>
            <p className="stat-label">Out for Delivery</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div>
            <p className="stat-value">{stats.delivered}</p>
            <p className="stat-label">Delivered</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div>
            <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
            <p className="stat-label">Total Revenue</p>
          </div>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="preparing">👨‍🍳 Preparing</option>
          <option value="ready">✓ Ready</option>
          <option value="out-for-delivery">🛵 Out for Delivery</option>
          <option value="delivered">✓ Delivered</option>
          <option value="cancelled">✕ Cancelled</option>
        </select>

        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
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
          <p>
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No orders have been placed yet'}
          </p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Order #</th>
                <th style={{ width: '20%' }}>Customer</th>
                <th style={{ width: '12%' }}>Type</th>
                <th style={{ width: '15%' }}>Items</th>
                <th style={{ width: '12%' }}>Total</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '12%' }}>Payment</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  {/* Order Number */}
                  <td>
                    <span className="order-number">{order.orderNumber}</span>
                    <small className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </small>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="customer-info">
                      <strong>{order.customer.name}</strong>
                      <small>{order.customer.phone}</small>
                    </div>
                  </td>

                  {/* Order Type */}
                  <td>
                    <span className="type-badge">
                      {orderTypeConfig[order.orderType]?.icon} {orderTypeConfig[order.orderType]?.label}
                    </span>
                  </td>

                  {/* Items */}
                  <td>
                    <div className="items-count">
                      {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                    </div>
                  </td>

                  {/* Total */}
                  <td>
                    <span className="order-total">₹{order.pricing.total}</span>
                  </td>

                  {/* Status */}
                  <td>
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
                  </td>

                  {/* Payment */}
                  <td>
                    <span className={`payment-badge ${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' && '✓ '}
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn view"
                        onClick={() => viewOrderDetails(order)}
                        title="View Details"
                      >
                        👁️
                      </button>

                      {order.status === 'pending' && (
                        <button
                          className="table-action-btn confirm"
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          title="Confirm Order"
                        >
                          ✅
                        </button>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          className="table-action-btn prepare"
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          title="Start Preparing"
                        >
                          👨‍🍳
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          className="table-action-btn ready"
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          title="Mark Ready"
                        >
                          ✓
                        </button>
                      )}

                      {(order.status === 'ready' && order.orderType === 'delivery') && (
                        <button
                          className="table-action-btn dispatch"
                          onClick={() => updateOrderStatus(order._id, 'out-for-delivery')}
                          title="Dispatch for Delivery"
                        >
                          🛵
                        </button>
                      )}

                      {(order.status === 'out-for-delivery' || (order.status === 'ready' && order.orderType !== 'delivery')) && (
                        <button
                          className="table-action-btn deliver"
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          title="Mark Delivered"
                        >
                          ✓
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.orderNumber}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body order-details-modal">
              {/* Order Info Grid */}
              <div className="order-info-grid">
                {/* Customer Info */}
                <div className="info-card">
                  <h4>👤 Customer Information</h4>
                  <div className="info-content">
                    <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
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
                      <span 
                        className="status-badge"
                        style={{ 
                          background: statusConfig[selectedOrder.status]?.color + '20',
                          color: statusConfig[selectedOrder.status]?.color
                        }}
                      >
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
                      <p>{selectedOrder.deliveryAddress.street}</p>
                      {selectedOrder.deliveryAddress.apartment && <p>{selectedOrder.deliveryAddress.apartment}</p>}
                      <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}</p>
                      {selectedOrder.deliveryAddress.landmark && <p><strong>Landmark:</strong> {selectedOrder.deliveryAddress.landmark}</p>}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="info-card">
                  <h4>💳 Payment Information</h4>
                  <div className="info-content">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod.toUpperCase()}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`payment-badge ${selectedOrder.paymentStatus}`}>
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </span>
                    </p>
                    {selectedOrder.transactionId && (
                      <p><strong>Transaction ID:</strong> {selectedOrder.transactionId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="info-card full-width">
                <h4>🍽️ Order Items</h4>
                <div className="order-items-list">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="no-image">🍽️</div>
                        )}
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

              {/* Pricing Breakdown */}
              <div className="info-card full-width">
                <h4>💰 Pricing Breakdown</h4>
                <div className="pricing-table">
                  <div className="pricing-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.pricing.subtotal}</span>
                  </div>
                  <div className="pricing-row">
                    <span>Delivery Fee:</span>
                    <span>₹{selectedOrder.pricing.deliveryFee}</span>
                  </div>
                  <div className="pricing-row">
                    <span>Tax (5%):</span>
                    <span>₹{selectedOrder.pricing.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="pricing-row discount">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.pricing.discount}</span>
                    </div>
                  )}
                  <div className="pricing-row total">
                    <strong>Total:</strong>
                    <strong>₹{selectedOrder.pricing.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
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