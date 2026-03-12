import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';
import './BannersPage.css';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 'hero',
    link: '',
    linkText: '',
    displayOrder: 0,
    overlayTitle: '',
    overlaySubtitle: '',
    overlayButtonText: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken');

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/banners`);
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      position: 'hero',
      link: '',
      linkText: '',
      displayOrder: 0,
      overlayTitle: '',
      overlaySubtitle: '',
      overlayButtonText: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingBanner(null);
    setShowModal(false);
  };

  // Handle create/update banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !editingBanner) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('linkText', formData.linkText);
      formDataToSend.append('displayOrder', formData.displayOrder);
      formDataToSend.append('overlayText', JSON.stringify({
        title: formData.overlayTitle,
        subtitle: formData.overlaySubtitle,
        buttonText: formData.overlayButtonText
      }));

      const url = editingBanner 
        ? `${API_URL}/banners/${editingBanner._id}`
        : `${API_URL}/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        alert(editingBanner ? 'Banner updated successfully!' : 'Banner uploaded successfully!');
        fetchBanners();
        resetForm();
      } else {
        alert(data.message || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner');
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      position: banner.position,
      link: banner.link || '',
      linkText: banner.linkText || '',
      displayOrder: banner.displayOrder,
      overlayTitle: banner.overlayText?.title || '',
      overlaySubtitle: banner.overlayText?.subtitle || '',
      overlayButtonText: banner.overlayText?.buttonText || ''
    });
    setPreviewUrl(banner.mediaUrl);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Banner deleted successfully!');
        fetchBanners();
      } else {
        alert(data.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
    }
  };

  // Handle toggle active status
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchBanners();
      } else {
        alert(data.message || 'Error toggling banner status');
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Error toggling banner status');
    }
  };

  return (
    <div className="banners-page">
      <div className="page-header">
        <h2>Banners Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Add New Banner
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div>
            <p className="stat-value">{banners.length}</p>
            <p className="stat-label">Total Banners</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p className="stat-value">{banners.filter(b => b.isActive).length}</p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div>
            <p className="stat-value">{banners.filter(b => b.mediaType === 'video').length}</p>
            <p className="stat-label">Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div>
            <p className="stat-value">{banners.filter(b => b.mediaType === 'image').length}</p>
            <p className="stat-label">Images</p>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="loading">Loading banners...</div>
      ) : (
        <div className="banners-grid">
          {banners.map(banner => (
            <div key={banner._id} className="banner-card">
              <div className="banner-preview">
                {banner.mediaType === 'video' ? (
                  <video src={banner.mediaUrl} controls />
                ) : (
                  <img src={banner.mediaUrl} alt={banner.title} />
                )}
                <div className="banner-overlay">
                  <button className="overlay-btn" onClick={() => handleEdit(banner)}>✏️</button>
                </div>
                {!banner.isActive && <div className="inactive-badge">Inactive</div>}
              </div>
              
              <div className="banner-info">
                <h3>{banner.title}</h3>
                <div className="banner-meta">
                  <span className={`position-badge ${banner.position}`}>
                    {banner.position}
                  </span>
                  <span className="media-type">
                    {banner.mediaType === 'video' ? '🎬' : '🖼️'} {banner.mediaType}
                  </span>
                </div>
                
                <div className="banner-actions">
                  <button 
                    className={`toggle-btn ${banner.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleStatus(banner._id)}
                  >
                    {banner.isActive ? '✓ Active' : '○ Inactive'}
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(banner)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(banner._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBanner ? 'Edit Banner' : 'Upload New Banner'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              {/* File Upload */}
              <div className="form-group">
                <label>Upload Image/Video</label>
                <div className="file-upload-area">
                  {previewUrl ? (
                    <div className="preview">
                      {selectedFile?.type.startsWith('video') || editingBanner?.mediaType === 'video' ? (
                        <video src={previewUrl} controls />
                      ) : (
                        <img src={previewUrl} alt="Preview" />
                      )}
                      <button type="button" className="change-btn" onClick={() => setPreviewUrl('')}>
                        Change File
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="upload-icon">📤</span>
                        <p>Click to upload or drag and drop</p>
                        <span className="upload-hint">Images or Videos (Max 50MB)</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Hero Banner - Summer Sale"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the banner"
                  rows="3"
                />
              </div>

              {/* Position */}
              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <select name="position" value={formData.position} onChange={handleInputChange}>
                    <option value="hero">Hero Section</option>
                    <option value="menu-hero">Menu Hero</option>
                    <option value="about">About Section</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              {/* Overlay Text */}
              <div className="form-section">
                <h4>Overlay Text (Optional)</h4>
                <div className="form-group">
                  <label>Overlay Title</label>
                  <input
                    type="text"
                    name="overlayTitle"
                    value={formData.overlayTitle}
                    onChange={handleInputChange}
                    placeholder="Discover the best food & drinks"
                  />
                </div>
                <div className="form-group">
                  <label>Overlay Subtitle</label>
                  <input
                    type="text"
                    name="overlaySubtitle"
                    value={formData.overlaySubtitle}
                    onChange={handleInputChange}
                    placeholder="Order food from the best restaurant"
                  />
                </div>
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    name="overlayButtonText"
                    value={formData.overlayButtonText}
                    onChange={handleInputChange}
                    placeholder="Order Now"
                  />
                </div>
              </div>

              {/* Link */}
              <div className="form-row">
                <div className="form-group">
                  <label>Link URL</label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="/menu"
                  />
                </div>
                <div className="form-group">
                  <label>Link Text</label>
                  <input
                    type="text"
                    name="linkText"
                    value={formData.linkText}
                    onChange={handleInputChange}
                    placeholder="View Menu"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingBanner ? 'Update Banner' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersPage;