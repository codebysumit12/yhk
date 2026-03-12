import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import './deliveries-page.css';

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken');

  // Fetch deliveries (orders that are out for delivery)
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders?status=out-for-delivery`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchDeliveries();
        setShowDetailsModal(false);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Failed to update delivery status');
    }
  };

  // View delivery details
  const viewDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      (delivery.orderNumber && delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.customer && delivery.customer.name && delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.customer && delivery.customer.phone && delivery.customer.phone.includes(searchTerm));
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: deliveries.length,
    outForDelivery: deliveries.filter(d => d.status === 'out-for-delivery').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => d.status === 'pending').length
  };

  return (
    <div className="deliveries-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>🛵 Deliveries Management</h2>
          <p>Track and manage all active deliveries</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">🛵</div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Active Deliveries</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div>
            <p className="stat-value">{stats.pending}</p>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card delivery">
          <div className="stat-icon">🚚</div>
          <div>
            <p className="stat-value">{stats.outForDelivery}</p>
            <p className="stat-label">Out for Delivery</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div>
            <p className="stat-value">{stats.delivered}</p>
            <p className="stat-label">Delivered Today</p>
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
          <option value="out-for-delivery">🚚 Out for Delivery</option>
          <option value="delivered">✅ Delivered</option>
        </select>

        <button className="btn-primary">
          📥 Export Deliveries
        </button>
      </div>

      {/* Deliveries Table */}
      {loading ? (
        <div className="loading">Loading deliveries...</div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛵</div>
          <h3>No Deliveries Found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No active deliveries at the moment'}
          </p>
        </div>
      ) : (
        <div className="deliveries-table-container">
          <table className="deliveries-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Order #</th>
                <th style={{ width: '20%' }}>Customer</th>
                <th style={{ width: '15%' }}>Delivery Address</th>
                <th style={{ width: '12%' }}>Est. Time</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '12%' }}>Delivery Person</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery._id}>
                  {/* Order Number */}
                  <td>
                    <span className="order-number">{delivery.orderNumber}</span>
                    <small className="order-date">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </small>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="customer-info">
                      <strong>{delivery.customer.name}</strong>
                      <small>{delivery.customer.phone}</small>
                    </div>
                  </td>

                  {/* Delivery Address */}
                  <td>
                    <div className="address-info">
                      <span>{delivery.deliveryAddress?.street}</span>
                      {delivery.deliveryAddress?.city && (
                        <small>{delivery.deliveryAddress.city}</small>
                      )}
                    </div>
                  </td>

                  {/* Estimated Time */}
                  <td>
                    <span className="delivery-time">
                      {delivery.delivery?.estimatedTime 
                        ? new Date(delivery.delivery.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'
                      }
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span 
                      className={`status-badge ${delivery.status}`}
                    >
                      {delivery.status === 'out-for-delivery' && '🚚 Out for Delivery'}
                      {delivery.status === 'delivered' && '✅ Delivered'}
                      {delivery.status === 'pending' && '⏳ Pending'}
                    </span>
                  </td>

                  {/* Delivery Person */}
                  <td>
                    {delivery.delivery?.deliveryPerson ? (
                      <div className="delivery-person">
                        <strong>{delivery.delivery.deliveryPerson.name}</strong>
                        <small>{delivery.delivery.deliveryPerson.phone}</small>
                        {delivery.delivery.deliveryPerson.vehicleNumber && (
                          <small>{delivery.delivery.deliveryPerson.vehicleNumber}</small>
                        )}
                      </div>
                    ) : (
                      <span className="no-delivery-person">Not Assigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn view"
                        onClick={() => viewDeliveryDetails(delivery)}
                        title="View Details"
                      >
                        👁️
                      </button>

                      {delivery.status === 'pending' && (
                        <button
                          className="table-action-btn dispatch"
                          onClick={() => updateDeliveryStatus(delivery._id, 'out-for-delivery')}
                          title="Dispatch for Delivery"
                        >
                          🚚
                        </button>
                      )}

                      {delivery.status === 'out-for-delivery' && (
                        <button
                          className="table-action-btn deliver"
                          onClick={() => updateDeliveryStatus(delivery._id, 'delivered')}
                          title="Mark as Delivered"
                        >
                          ✅
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

      {/* Delivery Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delivery Details - {selectedDelivery.orderNumber}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body delivery-details-modal">
              {/* Customer Info */}
              <div className="info-card">
                <h4>👤 Customer Information</h4>
                <div className="info-content">
                  <p><strong>Name:</strong> {selectedDelivery.customer.name}</p>
                  <p><strong>Phone:</strong> {selectedDelivery.customer.phone}</p>
                  <p><strong>Email:</strong> {selectedDelivery.customer.email}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="info-card">
                <h4>📍 Delivery Address</h4>
                <div className="info-content">
                  <p>{selectedDelivery.deliveryAddress?.street}</p>
                  {selectedDelivery.deliveryAddress?.apartment && <p>{selectedDelivery.deliveryAddress.apartment}</p>}
                  <p>
                    {selectedDelivery.deliveryAddress?.city}, {selectedDelivery.deliveryAddress?.state} - {selectedDelivery.deliveryAddress?.zipCode}
                  </p>
                  {selectedDelivery.deliveryAddress?.landmark && (
                    <p><strong>Landmark:</strong> {selectedDelivery.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="info-card">
                <h4>📦 Order Information</h4>
                <div className="info-content">
                  <p><strong>Order #:</strong> {selectedDelivery.orderNumber}</p>
                  <p><strong>Items:</strong> {selectedDelivery.orderItems?.length || 0} items</p>
                  <p><strong>Total:</strong> ₹{selectedDelivery.pricing?.total || 0}</p>
                  <p><strong>Payment:</strong> {selectedDelivery.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>

              {/* Delivery Person Info */}
              {selectedDelivery.delivery?.deliveryPerson && (
                <div className="info-card">
                  <h4>🛵 Delivery Person</h4>
                  <div className="info-content">
                    <p><strong>Name:</strong> {selectedDelivery.delivery.deliveryPerson.name}</p>
                    <p><strong>Phone:</strong> {selectedDelivery.delivery.deliveryPerson.phone}</p>
                    {selectedDelivery.delivery.deliveryPerson.vehicleNumber && (
                      <p><strong>Vehicle:</strong> {selectedDelivery.delivery.deliveryPerson.vehicleNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
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
    </div>
  );
};

export default DeliveriesPage;
