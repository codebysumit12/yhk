import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../../config/api';
import './items-page.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [healthBenefitInput, setHealthBenefitInput] = useState('');
const [prepStepInput, setPrepStepInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    rating: 4.5,
    healthBenefits: [],
    preparationSteps: [],
    isAvailable: true,
  isFeatured: false,
  isPopular: false,
    type: 'veg',
    spiceLevel: 'none',
    servingSize: '',
    preparationTime: '',
    calories: '',
    ingredients: [],
    allergens: [],
    tags: [],
    displayOrder: 0,
    nutritionInfo: {
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      calories: '',
      sugar: '',
      sodium: ''
    }
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Ingredients modal state
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedItemForIngredients, setSelectedItemForIngredients] = useState(null);
  const [itemIngredients, setItemIngredients] = useState([]);
  
  // Use the same form structure as IngredientsPage
  const [ingredientFormData, setIngredientFormData] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    vitamins: [],
    minerals: [],
    allergens: [],
    storage: 'ambient',
    shelfLife: '',
    supplier: {
      name: '',
      contact: '',
      price: ''
    },
    origin: '',
    season: [],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isNutFree: false
    },
    nutritionPer100g: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: ''
    },
    tags: [],
    healthBenefits: []
  });
  
  const API_URL = API_CONFIG.API_URL;
  const token = localStorage.getItem('userToken');

  const addHealthBenefit = () => {
  if (healthBenefitInput.trim()) {
    setFormData(prev => ({ ...prev, healthBenefits: [...prev.healthBenefits, healthBenefitInput.trim()] }));
    setHealthBenefitInput('');
  }
};
const removeHealthBenefit = (index) => {
  setFormData(prev => ({ ...prev, healthBenefits: prev.healthBenefits.filter((_, i) => i !== index) }));
};

const addPrepStep = () => {
  if (prepStepInput.trim()) {
    setFormData(prev => ({ ...prev, preparationSteps: [...prev.preparationSteps, prepStepInput.trim()] }));
    setPrepStepInput('');
  }
};
const removePrepStep = (index) => {
  setFormData(prev => ({ ...prev, preparationSteps: prev.preparationSteps.filter((_, i) => i !== index) }));
};

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  // Handle image selection
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(files);

    // Create previews
    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setPreviewUrls);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle nutrition info change
  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutritionInfo: {
        ...prev.nutritionInfo,
        [name]: value
      }
    }));
  };

  // Add ingredient
  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  // Remove ingredient
  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Add allergen
  const addAllergen = () => {
    if (allergenInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  // Remove allergen
  const removeAllergen = (index) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter((_, i) => i !== index)
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      discountPrice: '',
      rating: 4.5,
      healthBenefits: [],
      preparationSteps: [],
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      type: 'veg',
      spiceLevel: 'none',
      servingSize: '',
      preparationTime: '',
      calories: '',
      ingredients: [],
      allergens: [],
      tags: [],
      displayOrder: 0,
      nutritionInfo: {
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        calories: '',
        sugar: '',
        sodium: ''
      }
    });
    setSelectedImages([]);
    setPreviewUrls([]);
    setEditingItem(null);
    setShowModal(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();

      // Add images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.category);
      formDataToSend.append('price', formData.price);
      if (formData.discountPrice) formDataToSend.append('discountPrice', formData.discountPrice);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('spiceLevel', formData.spiceLevel);
      if (formData.servingSize) formDataToSend.append('servingSize', formData.servingSize);
      if (formData.preparationTime) formDataToSend.append('preparationTime', formData.preparationTime);
      if (formData.calories) formDataToSend.append('calories', formData.calories);
      formDataToSend.append('displayOrder', formData.displayOrder);
      
      // Add new fields
      formDataToSend.append('healthBenefits', JSON.stringify(formData.healthBenefits));
      formDataToSend.append('preparationSteps', JSON.stringify(formData.preparationSteps));
      formDataToSend.append('isAvailable', formData.isAvailable);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('isPopular', formData.isPopular);

      // Add arrays as JSON strings
      formDataToSend.append('ingredients', JSON.stringify(formData.ingredients));
      formDataToSend.append('allergens', JSON.stringify(formData.allergens));
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('nutritionInfo', JSON.stringify(formData.nutritionInfo));

      const url = editingItem 
        ? `${API_URL}/items/${editingItem._id}`
        : `${API_URL}/items`;
      
      const method = editingItem ? 'PUT' : 'POST';

      console.log('📤 Sending request to:', url);
      console.log('📤 Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}` 
          // Don't set Content-Type - let browser handle it for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!');
        fetchItems();
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('❌ Error saving item:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category?._id || '',
      price: item.price,
      discountPrice: item.discountPrice || '',
      rating: item.rating || 4.5,
      healthBenefits: item.healthBenefits || [],
      preparationSteps: item.preparationSteps || [],
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isFeatured: item.isFeatured || false,
      isPopular: item.isPopular || false,
      type: item.type || 'veg',
      spiceLevel: item.spiceLevel || 'none',
      servingSize: item.servingSize || '',
      preparationTime: item.preparationTime || '',
      calories: item.calories || '',
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
      tags: item.tags || [],
      displayOrder: item.displayOrder,
      nutritionInfo: item.nutritionInfo || { protein: '', carbs: '', fat: '', fiber: '', calories: '', sugar: '', sodium: '' }
    });
    
    // Set preview URLs from existing images
    if (item.images && item.images.length > 0) {
      setPreviewUrls(item.images.map(img => img.url));
    }
    
    setShowModal(true);
  };

  // Handle ingredients modal
  const openIngredientsModal = (item) => {
    setSelectedItemForIngredients(item);
    setItemIngredients(item.ingredients || []);
    
    // Auto-populate ingredient form with item data
    setIngredientFormData({
      name: item.name || '',                    // Auto-fill with item name
      description: item.description || '',
      category: item.category?._id || '',      // Use item's category ID
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      vitamins: [],
      minerals: [],
      allergens: [],
      storage: 'ambient',
      shelfLife: '',
      supplier: { name: '', contact: '', price: '' },
      origin: '',
      season: [],
      dietaryInfo: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: true,
        isNutFree: false
      },
      nutritionPer100g: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: ''
      },
      tags: [],
      healthBenefits: []
    });
    
    setShowIngredientsModal(true);
  };

  const closeIngredientsModal = () => {
    setShowIngredientsModal(false);
    setSelectedItemForIngredients(null);
    setItemIngredients([]);
    resetIngredientForm();
  };

  const resetIngredientForm = () => {
    setIngredientFormData({
      name: '',
      description: '',
      category: 'vegetables',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      vitamins: [],
      minerals: [],
      allergens: [],
      storage: 'ambient',
      shelfLife: '',
      supplier: { name: '', contact: '', price: '' },
      origin: '',
      season: [],
      dietaryInfo: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: true,
        isNutFree: false
      },
      nutritionPer100g: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: ''
      },
      tags: [],
      healthBenefits: []
    });
  };

  const handleIngredientInputChange = (e) => {
    const { name, value } = e.target;
  
    // Handle nested nutritionPer100g fields
    if (name.startsWith('nutritionPer100g.')) {
      const nutritionField = name.split('.')[1];
      setIngredientFormData(prev => ({
        ...prev,
        nutritionPer100g: {
          ...prev.nutritionPer100g,
          [nutritionField]: value
        }
      }));
    } else {
      // Handle regular fields
      setIngredientFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create ingredient in database first (backend will generate slug)
      const response = await fetch(`${API_URL}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ingredientFormData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add ingredient to item's ingredients list
        const updatedIngredients = [...itemIngredients, ingredientFormData.name];
        setItemIngredients(updatedIngredients);
        
        // Update item with new ingredient
        await updateItemIngredients(updatedIngredients);
        
        resetIngredientForm();
      } else {
        alert('Failed to create ingredient: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating ingredient: ' + error.message);
      console.error(error);
    }
  };

  const updateItemIngredients = async (ingredients) => {
    try {
      const response = await fetch(`${API_URL}/items/${selectedItemForIngredients._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredients: ingredients
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating item ingredients');
    }
  };

  const removeItemIngredient = async (ingredientToRemove) => {
    const updatedIngredients = itemIngredients.filter(ingredient => ingredient !== ingredientToRemove);
    setItemIngredients(updatedIngredients);
    await updateItemIngredients(updatedIngredients);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Item deleted successfully!');
        fetchItems();
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  // Toggle availability
  const toggleAvailability = async (id) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  // Toggle featured
  const toggleFeatured = async (id) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || (item.category && item.category._id === filterCategory);
    const matchesType = filterType === 'all' || (item.type || 'veg') === filterType;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'available' && item.isAvailable) ||
                          (filterStatus === 'unavailable' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: items.length,
    available: items.filter(i => i.isAvailable).length,
    featured: items.filter(i => i.isFeatured).length,
    veg: items.filter(i => i.type === 'veg').length
  };

  // Type emoji mapping
  const typeEmojis = {
    veg: '🟢',
    'non-veg': '🔴',
    vegan: '🟢',
    egg: '🟡'
  };

  // Spice level emoji mapping
  // const spiceLevelEmojis = { // Removed unused
  //   none: '',
  //   mild: '🌶️',
  //   medium: '🌶️🌶️',
  //   hot: '🌶️🌶️🌶️',
  //   'extra-hot': '🔥🔥🔥'
  // };

  return (
    <div className="items-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>🍽️ Menu Items Management</h2>
          <p>Manage your restaurant's menu items</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add New Item
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p className="stat-value">{stats.available}</p>
            <p className="stat-label">Available</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <p className="stat-value">{stats.featured}</p>
            <p className="stat-label">Featured</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div>
            <p className="stat-value">{stats.veg}</p>
            <p className="stat-label">Vegetarian</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="veg">🟢 Veg</option>
          <option value="non-veg">🔴 Non-Veg</option>
          <option value="vegan">🟢 Vegan</option>
          <option value="egg">🟡 Egg</option>
        </select>
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

   {/* Items List/Table View */}
{loading ? (
  <div className="loading">Loading items...</div>
) : filteredItems.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">🍽️</div>
    <h3>No Items Found</h3>
    <p>
      {searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all'
        ? 'Try adjusting your search or filters' 
        : 'Get started by creating your first menu item'}
    </p>
    {!searchTerm && filterCategory === 'all' && filterType === 'all' && filterStatus === 'all' && (
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Create First Item
      </button>
    )}
  </div>
) : (
  <div className="items-table-container">
    <table className="items-table">
   <thead>
  <tr>
    <th style={{ width: '80px' }}>Image</th>
    <th style={{ width: '35%' }}>Item Details</th>
    <th style={{ width: '18%' }}>Category</th>
    <th style={{ width: '18%' }}>Price</th>
    <th style={{ width: '15%' }}>Type</th>
    <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
  </tr>
</thead>
     <tbody>
  {filteredItems.map(item => (
    <tr key={item._id} className={!item.isAvailable ? 'item-unavailable' : ''}>
      {/* Image */}
      <td>
        <div className="table-item-image">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images.find(img => img.isPrimary)?.url || item.images[0].url} 
              alt={item.name} 
            />
          ) : (
            <div className="no-image-small">🍽️</div>
          )}
        </div>
      </td>

      {/* Item Details */}
      <td>
        <div className="table-item-details">
          <div className="item-name-row">
            <strong>{item.name}</strong>
            {item.isFeatured && <span className="mini-badge featured">⭐</span>}
            {item.isPopular && <span className="mini-badge popular">🔥</span>}
            {/* Show availability badge inline with name */}
            {!item.isAvailable && <span className="mini-badge unavailable">Unavailable</span>}
          </div>
          <p className="item-desc-small">{item.description}</p>
         
        </div>
      </td>

      {/* Category */}
      <td>
        {item.category && (
          <span className="category-tag-small" style={{ 
            background: (item.category.color || '#22c55e') + '20',
            color: item.category.color || '#22c55e' 
          }}>
            {item.category.icon || '🍽️'} {item.category.name || 'Unknown'}
          </span>
        )}
      </td>

      {/* Price */}
      <td>
        <div className="table-price">
          {item.discountPrice ? (
            <>
              <div className="price-row">
                <span className="price-current">₹{item.discountPrice}</span>
                
              </div>
              <span className="price-original"></span>
            </>
          ) : (
            <span className="price-current"></span>
          )}
        </div>
      </td>

      {/* Type */}
      <td>
        <span className="type-badge-small" style={{
          background: (item.type === 'veg' || item.type === 'vegan') ? '#dcfce7' : 
                      item.type === 'non-veg' ? '#fee2e2' : '#fef3c7',
          color: (item.type === 'veg' || item.type === 'vegan') ? '#15803d' : 
                 item.type === 'non-veg' ? '#b91c1c' : '#b45309'
        }}>
          {typeEmojis[item.type] || '🟢'} {(item.type || 'veg').toUpperCase()}
        </span>
      </td>

      {/* Actions */}
     {/* Actions */}
<td>
  <div className="table-actions">
    <button 
      className="table-action-btn edit"
      onClick={() => handleEdit(item)}
      title="Edit Item"
    >
      ✏️
    </button>
    <button 
      className={`table-action-btn toggle ${item.isAvailable ? 'active' : 'inactive'}`}
      onClick={() => toggleAvailability(item._id)}
      title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
    >
      {item.isAvailable ? '👁️' : '🚫'}
    </button>
    <button 
      className="table-action-btn delete"
      onClick={() => handleDelete(item._id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Basic Info Section */}
              <div className="form-section">
                <h4>📝 Basic Information</h4>
                
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Detailed description of the item"
                    rows="3"
                  />
                </div>

                {/* Health Benefits Section */}
<div className="form-section">
  <h4>💚 Health Benefits</h4>
  <div className="form-group">
    <div className="tag-input-container">
      <input
        type="text"
        value={healthBenefitInput}
        onChange={(e) => setHealthBenefitInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHealthBenefit())}
        placeholder="e.g., Rich in Vitamin C"
      />
      <button type="button" onClick={addHealthBenefit} className="add-tag-btn">
        + Add
      </button>
    </div>
    <div className="tags-list">
      {formData.healthBenefits.map((benefit, index) => (
        <span key={index} className="tag">
          {benefit}
          <button type="button" onClick={() => removeHealthBenefit(index)}>×</button>
        </span>
      ))}
    </div>
  </div>
</div>

{/* Preparation Steps Section */}
<div className="form-section">
  <h4>👨‍🍳 Preparation Steps</h4>
  <div className="form-group">
    <div className="tag-input-container">
      <textarea
        value={prepStepInput}
        onChange={(e) => setPrepStepInput(e.target.value)}
        placeholder="e.g., Preheat oven to 200°C"
        rows="2"
      />
      <button type="button" onClick={addPrepStep} className="add-tag-btn">
        + Add Step
      </button>
    </div>
    <div className="tags-list" style={{ flexDirection: 'column', gap: '6px' }}>
      {formData.preparationSteps.map((step, index) => (
        <span key={index} className="tag" style={{ justifyContent: 'space-between', width: '100%' }}>
          <span><strong>Step {index + 1}:</strong> {step}</span>
          <button type="button" onClick={() => removePrepStep(index)}>×</button>
        </span>
      ))}
    </div>
  </div>
</div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="veg">🟢 Vegetarian</option>
                      <option value="non-veg">🔴 Non-Vegetarian</option>
                      <option value="vegan">🟢 Vegan</option>
                      <option value="egg">🟡 Contains Egg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="form-section">
                <h4>💰 Pricing</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="299"
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Price (₹)</label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="249"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Flags Section */}
<div className="form-section">
  <h4>⚙️ Status & Visibility</h4>

  <div className="form-row">
    <div className="form-group">
      <label>Default Rating</label>
      <input
        type="number"
        name="rating"
        value={formData.rating}
        onChange={handleInputChange}
        min="0"
        max="5"
        step="0.1"
        placeholder="4.5"
      />
    </div>
  </div>

  <div className="checkbox-group">
    <label>
      <input
        type="checkbox"
        name="isAvailable"
        checked={formData.isAvailable}
        onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
      />
      Available
    </label>
    <label>
      <input
        type="checkbox"
        name="isFeatured"
        checked={formData.isFeatured}
        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
      />
      Featured
    </label>
    <label>
      <input
        type="checkbox"
        name="isPopular"
        checked={formData.isPopular}
        onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
      />
      Popular
    </label>
  </div>
</div>

              {/* Images Section */}
              <div className="form-section">
                <h4>� Images (Max 5)</h4>
                
                <div className="form-group">
                  <div className="file-upload-area">
                    {previewUrls.length > 0 ? (
                      <div className="image-previews">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="preview-item">
                            <img src={url} alt={`Preview ${index + 1}`} />
                            {index === 0 && <span className="primary-badge">Primary</span>}
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="change-btn" 
                          onClick={() => { setPreviewUrls([]); setSelectedImages([]); }}
                        >
                          Change Images
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImagesChange}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-placeholder">
                          <span className="upload-icon">📸</span>
                          <p>Click to upload images</p>
                          <span className="upload-hint">Up to 5 images (First will be primary)</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="form-section">
                <h4>ℹ️ Additional Details</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Spice Level</label>
                    <select
                      name="spiceLevel"
                      value={formData.spiceLevel}
                      onChange={handleInputChange}
                    >
                      <option value="none">None</option>
                      <option value="mild">🌶️ Mild</option>
                      <option value="medium">🌶️🌶️ Medium</option>
                      <option value="hot">🌶️🌶️🌶️ Hot</option>
                      <option value="extra-hot">🔥🔥🔥 Extra Hot</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Serving Size</label>
                    <input
                      type="text"
                      name="servingSize"
                      value={formData.servingSize}
                      onChange={handleInputChange}
                      placeholder="1 person / 2-3 people"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preparation Time (minutes)</label>
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="20"
                    />
                  </div>

                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="450"
                    />
                  </div>
                </div>

                <div className="form-row">
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
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="form-section">
                <h4>🥘 Ingredients</h4>
                
                <div className="form-group">
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                      placeholder="Type ingredient and press Enter"
                    />
                    <button type="button" onClick={addIngredient} className="add-tag-btn">
                      + Add
                    </button>
                  </div>
                  <div className="tags-list">
                    {formData.ingredients.map((ingredient, index) => (
                      <span key={index} className="tag">
                        {ingredient}
                        <button type="button" onClick={() => removeIngredient(index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Allergens Section */}
              <div className="form-section">
                <h4>⚠️ Allergens</h4>
                
                <div className="form-group">
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                      placeholder="Type allergen and press Enter"
                    />
                    <button type="button" onClick={addAllergen} className="add-tag-btn">
                      + Add
                    </button>
                  </div>
                  <div className="tags-list">
                    {formData.allergens.map((allergen, index) => (
                      <span key={index} className="tag allergen-tag">
                        {allergen}
                        <button type="button" onClick={() => removeAllergen(index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="form-section">
                <h4>🏷️ Tags</h4>
                
                <div className="form-group">
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="e.g., spicy, bestseller, new"
                    />
                    <button type="button" onClick={addTag} className="add-tag-btn">
                      + Add
                    </button>
                  </div>
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrition Info Section */}
              <div className="form-section">
                <h4>📊 Nutrition Information (per serving)</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.nutritionInfo.protein}
                      onChange={handleNutritionChange}
                      min="0"
                      step="0.1"
                      placeholder="15"
                    />
                  </div>

                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.nutritionInfo.carbs}
                      onChange={handleNutritionChange}
                      min="0"
                      step="0.1"
                      placeholder="45"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.nutritionInfo.fat}
                      onChange={handleNutritionChange}
                      min="0"
                      step="0.1"
                      placeholder="12"
                    />
                  </div>

                  <div className="form-row">
  <div className="form-group">
    <label>Calories (kcal)</label>
    <input
      type="number"
      name="calories"
      value={formData.nutritionInfo.calories}
      onChange={handleNutritionChange}
      min="0"
      step="0.1"
      placeholder="200"
    />
  </div>
  <div className="form-group">
    <label>Sugar (g)</label>
    <input
      type="number"
      name="sugar"
      value={formData.nutritionInfo.sugar}
      onChange={handleNutritionChange}
      min="0"
      step="0.1"
      placeholder="8"
    />
  </div>
</div>

<div className="form-row">
  <div className="form-group">
    <label>Sodium (mg)</label>
    <input
      type="number"
      name="sodium"
      value={formData.nutritionInfo.sodium}
      onChange={handleNutritionChange}
      min="0"
      step="0.1"
      placeholder="320"
    />
  </div>
</div>

                  <div className="form-group">
                    <label>Fiber (g)</label>
                    <input
                      type="number"
                      name="fiber"
                      value={formData.nutritionInfo.fiber}
                      onChange={handleNutritionChange}
                      min="0"
                      step="0.1"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingredients Modal */}
      {showIngredientsModal && (
        <div className="modal-overlay" onClick={closeIngredientsModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🥬 Manage Ingredients - {selectedItemForIngredients?.name}</h2>
              <button className="close-btn" onClick={closeIngredientsModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Current Ingredients List */}
              <div className="form-section">
                <h4>📋 Current Ingredients</h4>
                <div className="current-ingredients-list">
                  {itemIngredients.length === 0 ? (
                    <p className="no-ingredients">No ingredients added yet.</p>
                  ) : (
                    <div className="ingredients-grid-small">
                      {itemIngredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-item-small">
                          <span className="ingredient-name">{ingredient}</span>
                          <button 
                            type="button"
                            onClick={() => removeItemIngredient(ingredient)}
                            className="remove-ingredient-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Ingredient Form */}
              <div className="form-section">
                <h4>➕ Add New Ingredient</h4>
                <form onSubmit={handleIngredientSubmit}>
                  {/* Basic Info */}
                  <div className="form-subsection">
                    <h5>📝 Basic Information</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="ingredient-name">Name *</label>
                        <input
                          id="ingredient-name"
                          type="text"
                          name="name"
                          value={ingredientFormData.name}
                          onChange={handleIngredientInputChange}
                          required
                          placeholder="e.g., Tomato"
                          autoComplete="off"
                          readOnly
                          className="readonly-input"
                          title="Auto-filled from item name"
                        />
                        <small className="field-hint">Auto-filled from item name</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="ingredient-category">Category</label>
                        <select 
                          id="ingredient-category"
                          name="category" 
                          value={ingredientFormData.category} 
                          onChange={handleIngredientInputChange}
                          autoComplete="off"
                          disabled
                          className="readonly-select"
                          title="Auto-filled from item category"
                        >
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.icon || '�️'} {category.name}
                            </option>
                          ))}
                        </select>
                        <small className="field-hint">Auto-filled from item category</small>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="ingredient-description">Description</label>
                      <textarea
                        id="ingredient-description"
                        name="description"
                        value={ingredientFormData.description}
                        onChange={handleIngredientInputChange}
                        placeholder="Detailed description of the ingredient"
                        rows="2"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="form-subsection">
                    <h5>📊 Nutrition (per 100g)</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="ingredient-calories">Calories</label>
                        <input 
                          id="ingredient-calories"
                          type="number" 
                          name="nutritionPer100g.calories" 
                          value={ingredientFormData.nutritionPer100g.calories} 
                          onChange={handleIngredientInputChange}
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ingredient-protein">Protein (g)</label>
                        <input 
                          id="ingredient-protein"
                          type="number" 
                          name="nutritionPer100g.protein" 
                          value={ingredientFormData.nutritionPer100g.protein} 
                          onChange={handleIngredientInputChange}
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ingredient-carbs">Carbs (g)</label>
                        <input 
                          id="ingredient-carbs"
                          type="number" 
                          name="nutritionPer100g.carbs" 
                          value={ingredientFormData.nutritionPer100g.carbs} 
                          onChange={handleIngredientInputChange}
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ingredient-fat">Fat (g)</label>
                        <input 
                          id="ingredient-fat"
                          type="number" 
                          name="nutritionPer100g.fat" 
                          value={ingredientFormData.nutritionPer100g.fat} 
                          onChange={handleIngredientInputChange}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dietary Info */}
                  <div className="form-subsection">
                    <h5>🌿 Dietary Information</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="isVegan"
                          checked={ingredientFormData.dietaryInfo.isVegan}
                          onChange={(e) => setIngredientFormData(prev => ({
                            ...prev,
                            dietaryInfo: { ...prev.dietaryInfo, isVegan: e.target.checked }
                          }))}
                        />
                        Vegan
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="isVegetarian"
                          checked={ingredientFormData.dietaryInfo.isVegetarian}
                          onChange={(e) => setIngredientFormData(prev => ({
                            ...prev,
                            dietaryInfo: { ...prev.dietaryInfo, isVegetarian: e.target.checked }
                          }))}
                        />
                        Vegetarian
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="isGlutenFree"
                          checked={ingredientFormData.dietaryInfo.isGlutenFree}
                          onChange={(e) => setIngredientFormData(prev => ({
                            ...prev,
                            dietaryInfo: { ...prev.dietaryInfo, isGlutenFree: e.target.checked }
                          }))}
                        />
                        Gluten-Free
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={resetIngredientForm}>
                      Clear Form
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Ingredient to Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
