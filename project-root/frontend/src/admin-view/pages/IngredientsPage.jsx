import React, { useState, useEffect } from 'react';
import './ingredients-page.css';

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = 'http://localhost:5001/api';

  // Form state
  const [formData, setFormData] = useState({
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

  // Fetch ingredients
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const params = new URLSearchParams({
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm }),
        page: currentPage
      });
      
      const response = await fetch(`${API_URL}/ingredients?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setIngredients(data.data);
      } else {
        setError('Failed to fetch ingredients');
      }
    } catch (err) {
      setError('Server error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('userToken');
      const url = editingIngredient 
        ? `${API_URL}/ingredients/${editingIngredient._id}`
        : `${API_URL}/ingredients`;
      
      const method = editingIngredient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchIngredients();
      } else {
        setError(data.message || 'Failed to save ingredient');
      }
    } catch (err) {
      setError('Server error');
      console.error('Error:', err);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name || '',
      description: ingredient.description || '',
      category: ingredient.category || 'vegetables',
      unit: ingredient.unit || 'g',
      calories: ingredient.calories || '',
      protein: ingredient.protein || '',
      carbs: ingredient.carbs || '',
      fat: ingredient.fat || '',
      fiber: ingredient.fiber || '',
      vitamins: ingredient.vitamins || [],
      minerals: ingredient.minerals || [],
      allergens: ingredient.allergens || [],
      storage: ingredient.storageInstructions || 'ambient',
      shelfLife: ingredient.shelfLife || '',
      supplier: ingredient.supplier || { name: '', contact: '', price: '' },
      origin: ingredient.origin || '',
      season: ingredient.season || [],
      dietaryInfo: ingredient.dietaryInfo || {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: true,
        isNutFree: false
      },
      nutritionPer100g: ingredient.nutritionPer100g || {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: ''
      },
      tags: ingredient.tags || [],
      healthBenefits: ingredient.healthBenefits || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchIngredients();
      } else {
        setError(data.message || 'Failed to delete ingredient');
      }
    } catch (err) {
      setError('Server error');
      console.error('Error:', err);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/ingredients/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchIngredients();
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Server error');
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingIngredient(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addArrayItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="ingredients-page">
      <div className="page-header">
        <h1>🥬 Ingredients Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          + Add New Ingredient
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="vegetables">🥬 Vegetables</option>
            <option value="fruits">🍎 Fruits</option>
            <option value="grains">🌾 Grains</option>
            <option value="dairy">🥛 Dairy</option>
            <option value="proteins">🥩 Proteins</option>
            <option value="spices">🌶 Spices</option>
            <option value="oils">🫒 Oils</option>
            <option value="others">📦 Others</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading ingredients...</div>
      ) : (
        <div className="ingredients-grid">
          {ingredients.map(ingredient => (
            <div key={ingredient._id} className="ingredient-card">
              <div className="ingredient-image">
                {ingredient.image?.url ? (
                  <img src={ingredient.image.url} alt={ingredient.name} />
                ) : (
                  <div className="placeholder-image">🥬</div>
                )}
                <div className="status-badge">
                  {ingredient.isActive ? '✅ Active' : '⏸️ Inactive'}
                </div>
              </div>
              
              <div className="ingredient-info">
                <h3>{ingredient.name}</h3>
                <p className="category">{ingredient.category}</p>
                <p className="description">{ingredient.description}</p>
                
                {ingredient.nutritionPer100g?.calories && (
                  <div className="nutrition-info">
                    <span className="nutrition-badge">🔥 {ingredient.nutritionPer100g.calories} cal</span>
                    {ingredient.nutritionPer100g.protein && <span className="nutrition-badge">💪 {ingredient.nutritionPer100g.protein}g protein</span>}
                    {ingredient.nutritionPer100g.carbs && <span className="nutrition-badge">🌾 {ingredient.nutritionPer100g.carbs}g carbs</span>}
                  </div>
                )}
                
                <div className="ingredient-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(ingredient)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(ingredient._id)}
                  >
                    🗑️ Delete
                  </button>
                  <button 
                    className={`toggle-btn ${!ingredient.isActive ? 'inactive' : ''}`}
                    onClick={() => toggleStatus(ingredient._id)}
                  >
                    {ingredient.isActive ? '⏸️ Deactivate' : '✅ Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Basic Info */}
              <div className="form-section">
                <h3>📝 Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Tomato"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="vegetables">🥬 Vegetables</option>
                      <option value="fruits">🍎 Fruits</option>
                      <option value="grains">🌾 Grains</option>
                      <option value="dairy">🥛 Dairy</option>
                      <option value="proteins">🥩 Proteins</option>
                      <option value="spices">🌶 Spices</option>
                      <option value="oils">🫒 Oils</option>
                      <option value="others">📦 Others</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the ingredient"
                    rows="3"
                  />
                </div>
              </div>

              {/* Nutrition */}
              <div className="form-section">
                <h3>📊 Nutrition (per 100g)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Calories</label>
                    <input type="number" name="calories" value={formData.nutritionPer100g.calories} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input type="number" name="protein" value={formData.nutritionPer100g.protein} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input type="number" name="carbs" value={formData.nutritionPer100g.carbs} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input type="number" name="fat" value={formData.nutritionPer100g.fat} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Dietary Info */}
              <div className="form-section">
                <h3>🌿 Dietary Information</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={formData.dietaryInfo.isVegan}
                      onChange={(e) => setFormData(prev => ({
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
                      checked={formData.dietaryInfo.isVegetarian}
                      onChange={(e) => setFormData(prev => ({
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
                      checked={formData.dietaryInfo.isGlutenFree}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dietaryInfo: { ...prev.dietaryInfo, isGlutenFree: e.target.checked }
                      }))}
                    />
                    Gluten-Free
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingIngredient ? 'Update Ingredient' : 'Create Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsPage;
