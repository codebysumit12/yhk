import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import './others-page.css';

const API_URL = API_CONFIG.API_URL;

const OthersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drinks');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    foodType: 'drinks',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 5,
    servingSize: '',
    calories: '',
    ingredients: '',
    allergens: '',
    image: null
  });

  const token = localStorage.getItem('token');

  // Fetch items based on active tab
  const fetchItems = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/items?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setItemForm({ ...itemForm, foodType: tab });
  };

  // Open modal for add/edit
  const openItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        discountPrice: item.discountPrice || '',
        foodType: item.type,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured || false,
        preparationTime: item.preparationTime || 5,
        servingSize: item.servingSize || '',
        calories: item.calories || '',
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
        allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
        image: null
      });
      setImagePreview(item.images?.[0]?.url || null);
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        foodType: activeTab,
        isAvailable: true,
        isFeatured: false,
        preparationTime: 5,
        servingSize: '',
        calories: '',
        ingredients: '',
        allergens: '',
        image: null
      });
      setImagePreview(null);
    }
    setShowItemModal(true);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm({ ...itemForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Save item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', itemForm.name);
    formData.append('description', itemForm.description);
    formData.append('price', itemForm.price);
    formData.append('type', itemForm.foodType);
    
    if (itemForm.discountPrice) {
      formData.append('discountPrice', itemForm.discountPrice);
    }
    
    formData.append('isAvailable', itemForm.isAvailable);
    formData.append('isFeatured', itemForm.isFeatured);
    formData.append('preparationTime', itemForm.preparationTime);
    formData.append('servingSize', itemForm.servingSize);
    formData.append('calories', itemForm.calories);
    
    // Convert comma-separated strings to JSON arrays
    if (itemForm.ingredients) {
      const ingredientsArray = itemForm.ingredients.split(',').map(i => i.trim()).filter(i => i);
      formData.append('ingredients', JSON.stringify(ingredientsArray));
    }
    
    if (itemForm.allergens) {
      const allergensArray = itemForm.allergens.split(',').map(a => a.trim()).filter(a => a);
      formData.append('allergens', JSON.stringify(allergensArray));
    }
    if (itemForm.image) {
      formData.append('images', itemForm.image);
    }

    try {
      const url = editingItem 
        ? `${API_URL}/items/${editingItem._id}`
        : `${API_URL}/items`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        setShowItemModal(false);
        fetchItems(activeTab);
      } else {
        alert(data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Item deleted successfully!');
        fetchItems(activeTab);
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  // Toggle availability
  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchItems(activeTab);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  // Tab configuration
  const tabConfig = {
    drinks: { label: 'Drinks', icon: '🥤', color: '#3b82f6' },
    smoothies: { label: 'Smoothies', icon: '🥤', color: '#06b6d4' },
    desserts: { label: 'Desserts', icon: '🍰', color: '#ec4899' }
  };

  return (
    <div className="others-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>🍹 Beverages & Desserts</h2>
          <p>Manage drinks, smoothies, and desserts</p>
        </div>
        <button className="btn-primary" onClick={() => openItemModal()}>
          ➕ Add New Item
        </button>
      </div>

      {/* Tabs */}
      <div className="others-tabs">
        {Object.entries(tabConfig).map(([key, config]) => (
          <button
            key={key}
            className={`others-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => handleTabChange(key)}
            style={{
              borderColor: activeTab === key ? config.color : 'transparent',
              color: activeTab === key ? config.color : 'var(--text-muted)'
            }}
          >
            <span className="tab-icon">{config.icon}</span>
            <span className="tab-label">{config.label}</span>
            <span className="tab-count">
              {items.filter(i => i.type === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Items Table */}
      {loading ? (
        <div className="loading">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tabConfig[activeTab].icon}</div>
          <h3>No {tabConfig[activeTab].label} Yet</h3>
          <p>Start adding items to this section</p>
          <button className="btn-primary" onClick={() => openItemModal()}>
            ➕ Add First Item
          </button>
        </div>
      ) : (
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th style={{ width: '35%' }}>Item Details</th>
                <th style={{ width: '15%' }}>Price</th>
                <th style={{ width: '15%' }}>Meta Info</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className={!item.isAvailable ? 'item-unavailable' : ''}>
                  {/* Image */}
                  <td>
                    <div className="table-item-image">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.name} />
                      ) : (
                        <div className="no-image-small">{tabConfig[activeTab].icon}</div>
                      )}
                    </div>
                  </td>

                  {/* Item Details */}
                  <td>
                    <div className="table-item-details">
                      <div className="item-name-row">
                        <strong>{item.name}</strong>
                        {item.isFeatured && <span className="mini-badge featured">⭐</span>}
                        {!item.isAvailable && <span className="mini-badge unavailable">Unavailable</span>}
                      </div>
                      <p className="item-desc-small">{item.description}</p>
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div className="table-price">
                      {item.discountPrice ? (
                        <>
                          <div className="price-row">
                            <span className="price-current">₹{item.discountPrice}</span>
                            <span className="price-original">₹{item.price}</span>
                          </div>
                          <span className="discount-badge-small">
                            {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="price-current">₹{item.price}</span>
                      )}
                    </div>
                  </td>

                  {/* Meta Info */}
                  <td>
                    <div className="meta-info-small">
                      {item.servingSize && (
                        <div className="meta-row">📏 {item.servingSize}</div>
                      )}
                      {item.calories && (
                        <div className="meta-row">🔥 {item.calories} cal</div>
                      )}
                      {item.preparationTime && (
                        <div className="meta-row">⏱️ {item.preparationTime} min</div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-action-btn edit"
                        onClick={() => openItemModal(item)}
                        title="Edit Item"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`table-action-btn toggle ${item.isAvailable ? 'active' : 'inactive'}`}
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        {item.isAvailable ? '✓' : '✕'}
                      </button>
                      <button 
                        className="table-action-btn delete"
                        onClick={() => handleDeleteItem(item._id)}
                        title="Delete Item"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="close-btn" onClick={() => setShowItemModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div className="form-grid">
                  {/* Image Upload */}
                  <div className="form-group full-width">
                    <label>Item Image</label>
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setImagePreview(null);
                              setItemForm({ ...itemForm, image: null });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="upload-placeholder">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            hidden
                          />
                          <span className="upload-icon">📷</span>
                          <span>Click to upload image</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="form-group full-width">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Mango Smoothie"
                      value={itemForm.name}
                      onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Describe your item..."
                      value={itemForm.description}
                      onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    />
                  </div>

                  {/* Pricing */}
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="99"
                      value={itemForm.price}
                      onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="79"
                      value={itemForm.discountPrice}
                      onChange={e => setItemForm({ ...itemForm, discountPrice: e.target.value })}
                    />
                  </div>

                  {/* Category (Food Type) */}
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-input"
                      value={itemForm.foodType}
                      onChange={e => setItemForm({ ...itemForm, foodType: e.target.value })}
                      required
                    >
                      <option value="drinks">🥤 Drinks</option>
                      <option value="smoothies">🥤 Smoothies</option>
                      <option value="desserts">🍰 Desserts</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preparation Time (min)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="5"
                      value={itemForm.preparationTime}
                      onChange={e => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="form-group">
                    <label>Serving Size</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 250ml, 1 scoop"
                      value={itemForm.servingSize}
                      onChange={e => setItemForm({ ...itemForm, servingSize: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g., 180"
                      value={itemForm.calories}
                      onChange={e => setItemForm({ ...itemForm, calories: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Ingredients</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="e.g., Mango, Yogurt, Honey, Ice"
                      value={itemForm.ingredients}
                      onChange={e => setItemForm({ ...itemForm, ingredients: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Allergens</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Contains dairy, nuts"
                      value={itemForm.allergens}
                      onChange={e => setItemForm({ ...itemForm, allergens: e.target.value })}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="form-group full-width">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={itemForm.isAvailable}
                          onChange={e => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                        />
                        <span>Available for orders</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={itemForm.isFeatured}
                          onChange={e => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                        />
                        <span>⭐ Featured item</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OthersPage;
