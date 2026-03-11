import React, { useState, useEffect } from 'react';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#22c55e',
    displayOrder: 0
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = 'http://localhost:5001/api';
  const token = localStorage.getItem('token');

  // Available icons
  const availableIcons = [
    '🍕', '🍔', '🍟', '🌮', '🌯', '🥗', '🍝', '🍜',
    '🍲', '🥘', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙',
    '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🥪',
    '🍰', '🎂', '🧁', '🍪', '🍩', '🥧', '🍦', '🥤',
    '☕', '🍵', '🧃', '🥛', '🍷', '🍺', '🥂', '🍾',
    '🥗', '🥑', '🥕', '🌽', '🥒', '🍅', '🥦', '🧄',
    '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥘', '🍲'
  ];

  // Available colors
  const availableColors = [
    '#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#fb923c', '#10b981', '#f43f5e'
  ];

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '📁',
      color: '#22c55e',
      displayOrder: 0
    });
    setSelectedImage(null);
    setPreviewUrl('');
    setEditingCategory(null);
    setShowModal(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Check for duplicate category name (only for new categories, not edits)
    if (!editingCategory) {
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === formData.name.toLowerCase().trim()
      );
      if (existingCategory) {
        alert('A category with this name already exists!');
        setUploading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('icon', formData.icon);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('displayOrder', formData.displayOrder);

      const url = editingCategory 
        ? `${API_URL}/categories/${editingCategory._id}`
        : `${API_URL}/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        fetchCategories();
        resetForm();
      } else {
        alert(data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      displayOrder: category.displayOrder
    });
    if (category.imageUrl) {
      setPreviewUrl(category.imageUrl);
    }
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'active' && category.isActive) ||
                          (filterStatus === 'inactive' && !category.isActive);
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    withItems: categories.filter(c => c.itemCount > 0).length
  };

  return (
    <div className="categories-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>📁 Category Management</h2>
          <p>Organize your menu items into categories</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add New Category
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p className="stat-value">{stats.active}</p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭕</div>
          <div>
            <p className="stat-value">{stats.inactive}</p>
            <p className="stat-label">Inactive</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div>
            <p className="stat-value">{stats.withItems}</p>
            <p className="stat-label">With Items</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search categories..."
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
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Categories Found</h3>
          <p>
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first category'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map(category => (
            <div key={category._id} className="category-card">
              {!category.isActive && <div className="status-badge inactive">Inactive</div>}
              {category.isActive && <div className="status-badge active">Active</div>}
              
              <div className="category-header" style={{ background: `linear-gradient(135deg, ${category.color}15, ${category.color}30)` }}>
                <div className="category-icon" style={{ background: category.color + '20', color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-title">
                  <h3>{category.name}</h3>
                  <p>{category.slug}</p>
                </div>
              </div>

              <div className="category-body">
                {category.imageUrl && (
                  <img src={category.imageUrl} alt={category.name} className="category-image" />
                )}
                <p className="category-description">
                  {category.description || 'No description provided'}
                </p>
              </div>

              <div className="category-meta">
                <div className="meta-item">
                  <span className="meta-icon">🍽️</span>
                  <span className="meta-value">{category.itemCount}</span>
                  <span> items</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📊</span>
                  <span className="meta-value">#{category.displayOrder}</span>
                </div>
              </div>

              <div className="category-actions">
                <button 
                  className={`action-btn toggle-btn ${category.isActive ? 'active' : ''}`}
                  onClick={() => handleToggleStatus(category._id)}
                >
                  {category.isActive ? '✓' : '○'}
                </button>
                <button className="action-btn edit-btn" onClick={() => handleEdit(category)}>
                  ✏️ Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(category._id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Category Name */}
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Pizzas, Burgers, Desserts"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this category"
                  rows="3"
                />
              </div>

              {/* Icon Selection */}
              <div className="form-group">
                <label>Select Icon</label>
                <div className="icon-picker">
                  {availableIcons.map(icon => (
                    <div
                      key={icon}
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="form-group">
                <label>Select Color</label>
                <div className="color-picker">
                  {availableColors.map(color => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Category Image (Optional)</label>
                <div className="file-upload-area">
                  {previewUrl ? (
                    <div className="preview">
                      <img src={previewUrl} alt="Preview" />
                      <button type="button" className="change-btn" onClick={() => { setPreviewUrl(''); setSelectedImage(null); }}>
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="upload-icon">📤</span>
                        <p>Click to upload image</p>
                        <span className="upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Display Order */}
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Submit Buttons */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;