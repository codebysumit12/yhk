import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import YHKLoader from './Yhkloader';
import './MyProfile.css';
import { API_CONFIG } from '../../config/api';

const MyProfile = () => {
  console.log('🚀 MyProfile component mounted!');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferences: {
      dietary: [],
      allergies: [],
      spiceLevel: 'medium'
    }
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    isDefault: false
  });

  const navigate = useNavigate();
  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          preferences: data.data.preferences || { dietary: [], allergies: [], spiceLevel: 'medium' }
        });
        setAddresses(data.data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, []);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile updated successfully!');
        setUser(data.data);
        setEditing(false);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    const updatedAddresses = editingAddress !== null
      ? addresses.map((addr, index) => index === editingAddress ? addressForm : addr)
      : [...addresses, addressForm];

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(updatedAddresses);
        setShowAddressModal(false);
        setEditingAddress(null);
        setAddressForm({
          type: 'home',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          landmark: '',
          isDefault: false
        });
        alert(editingAddress !== null ? 'Address updated!' : 'Address added!');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  // Delete address
  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Delete this address?')) return;

    const updatedAddresses = addresses.filter((_, i) => i !== index);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: updatedAddresses })
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(updatedAddresses);
        alert('Address deleted!');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  return (
    <div className="my-profile-page">
      <div className="my-profile-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>👤 My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>

        {loading && !user ? (
          <YHKLoader message="Loading profile..." fullPage />
        ) : (
          <div className="profile-grid">
            {/* Personal Information */}
            <div className="profile-card">
              <div className="card-header">
                <h3>📝 Personal Information</h3>
                {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    ✏️ Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>

                {editing && (
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Saved Addresses */}
            <div className="profile-card">
              <div className="card-header">
                <h3>📍 Saved Addresses</h3>
                <button className="add-btn" onClick={() => setShowAddressModal(true)}>
                  + Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-section">
                  <p>No saved addresses</p>
                  <button className="btn-primary" onClick={() => setShowAddressModal(true)}>
                    + Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addresses-list">
                  {addresses.map((address, index) => (
                    <div key={`address-${index}-${address.type}`} className="address-card">
                      <div className="address-header">
                        <span className="address-type">{address.type.toUpperCase()}</span>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <div className="address-content">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} - {address.zipCode}</p>
                        {address.landmark && <p className="landmark">Landmark: {address.landmark}</p>}
                      </div>
                      <div className="address-actions">
                        <button 
                          className="icon-btn"
                          onClick={() => {
                            setEditingAddress(index);
                            setAddressForm(address);
                            setShowAddressModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button 
                          className="icon-btn delete"
                          onClick={() => handleDeleteAddress(index)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Food Preferences */}
            <div className="profile-card full-width">
              <div className="card-header">
                <h3>🍽️ Food Preferences</h3>
              </div>

              <div className="preferences-section">
                <div className="preference-item">
                  <label>Spice Level</label>
                  <select
                    value={formData.preferences.spiceLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, spiceLevel: e.target.value }
                    })}
                    disabled={!editing}
                  >
                    <option value="low">🌶️ Low</option>
                    <option value="medium">🌶️🌶️ Medium</option>
                    <option value="high">🌶️🌶️🌶️ High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingAddress !== null ? 'Edit Address' : 'Add New Address'}</h3>
                <button className="close-btn" onClick={() => setShowAddressModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSaveAddress} className="address-form">
                  <div className="form-group">
                    <label>Address Type</label>
                    <select
                      value={addressForm.type}
                      onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    >
                      <option value="home">🏠 Home</option>
                      <option value="work">💼 Work</option>
                      <option value="other">📍 Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Pune"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      placeholder="411001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Landmark (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      placeholder="Near Park"
                    />
                  </div>

                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      />
                      Set as default address
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowAddressModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingAddress !== null ? 'Update Address' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;