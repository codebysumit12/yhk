import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import YHKLoader from './Yhkloader';
import { API_CONFIG } from '../../config/api';
import './Ingredients.css';

const API_URL = API_CONFIG.API_URL;

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const navigate = useNavigate();

  const categoryOptions = [
    { value: 'vegetable', label: '🥬 Vegetable', icon: '🥬' },
    { value: 'fruit', label: '🍎 Fruit', icon: '🍎' },
    { value: 'grain', label: '🌾 Grain', icon: '🌾' },
    { value: 'protein', label: '🥩 Protein', icon: '🥩' },
    { value: 'dairy', label: '🥛 Dairy', icon: '🥛' },
    { value: 'spice', label: '🌶️ Spice', icon: '🌶️' },
    { value: 'herb', label: '🌿 Herb', icon: '🌿' },
    { value: 'oil', label: '🫒 Oil', icon: '🫒' },
    { value: 'sweetener', label: '🍯 Sweetener', icon: '🍯' },
    { value: 'nuts', label: '🥜 Nuts', icon: '🥜' },
    { value: 'seeds', label: '🌰 Seeds', icon: '🌰' },
    { value: 'other', label: '📦 Other', icon: '📦' }
  ];

  useEffect(() => {
    fetchIngredients();
  }, [filterCategory, searchTerm]);

  const fetchIngredients = async () => {
    try {
      const params = new URLSearchParams({
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm }),
        isActive: true
      });
      
      const response = await fetch(`${API_URL}/ingredients?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setIngredients(data.data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat ? cat.icon : '📦';
  };

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ingredients-page">
        <Nav onOpenCart={() => {}} />
        <YHKLoader message="Loading fresh ingredients..." />
      </div>
    );
  }

  return (
    <div className="ingredients-page">
      <Nav onOpenCart={() => {}} />
      
      <div className="page-header">
        <div>
          <h1>🥬 Fresh Ingredients</h1>
          <p>Discover the quality ingredients we use in our kitchen</p>
        </div>
        <button 
          className="back-to-menu-btn"
          onClick={() => navigate('/menu')}
        >
          <i className="fas fa-arrow-left"></i> Back to Menu
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
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ingredients Grid — unchanged */}
      <div className="ingredients-grid">
        {filteredIngredients.map((ingredient, index) => (
          <div 
            key={`ingredient-${ingredient._id || ingredient.name || index}`}
            className="ingredient-card"
            onClick={() => setSelectedIngredient(ingredient)}
          >
            <div className="ingredient-image">
              {ingredient.image?.url ? (
                <img src={ingredient.image.url} alt={ingredient.name} />
              ) : (
                <div className="placeholder-image">{getCategoryIcon(ingredient.category)}</div>
              )}
              <div className="category-badge">
                {getCategoryIcon(ingredient.category)} {ingredient.category}
              </div>
            </div>
            
            <div className="ingredient-content">
              <h3>{ingredient.name}</h3>
              <p className="description">{ingredient.description}</p>
              
              {/* Dietary Badges */}
              <div className="dietary-badges">
                {ingredient.dietaryInfo?.isVegan && <span className="badge vegan">🌱 Vegan</span>}
                {ingredient.dietaryInfo?.isVegetarian && <span className="badge vegetarian">🥬 Vegetarian</span>}
                {ingredient.dietaryInfo?.isGlutenFree && <span className="badge gluten-free">🌾 Gluten-Free</span>}
                {ingredient.dietaryInfo?.isDairyFree && <span className="badge dairy-free">🥛 Dairy-Free</span>}
                {ingredient.dietaryInfo?.isNutFree && <span className="badge nut-free">🥜 Nut-Free</span>}
                {ingredient.isOrganic && <span className="badge organic">🌿 Organic</span>}
              </div>

              {/* Ingredients List Preview */}
              {ingredient.ingredients && ingredient.ingredients.length > 0 && (
                <div className="ingredient-list-preview">
                  <h4>🥘 Contains:</h4>
                  <div className="mini-tags">
                    {ingredient.ingredients.slice(0, 2).map((ing, index) => (
                      <span key={`ing-${index}-${ing}`} className="mini-tag">{ing}</span>
                    ))}
                    {ingredient.ingredients.length > 2 && (
                      <span className="mini-tag more">+{ingredient.ingredients.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-carrot fa-3x"></i>
          <p>No ingredients found</p>
          <button onClick={() => setSearchTerm('')} className="clear-search-btn">
            Clear Search
          </button>
        </div>
      )}

      {/* Ingredient Detail Modal */}
      {selectedIngredient && (
        <div className="modal-overlay" onClick={() => setSelectedIngredient(null)}>
          <div className="modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🥬 {selectedIngredient.name}</h2>
              <button className="close-btn" onClick={() => setSelectedIngredient(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ingredient-detail">
                {selectedIngredient.image?.url && (
                  <div className="detail-image">
                    <img src={selectedIngredient.image.url} alt={selectedIngredient.name} />
                  </div>
                )}

                <div className="detail-content">

                  {/* ── Health Benefits ── */}
                  {selectedIngredient.healthBenefits && selectedIngredient.healthBenefits.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-heart"></i> Health Benefits</h3>
                      <ul className="benefits-list">
                        {selectedIngredient.healthBenefits.map((benefit, index) => (
                          <li key={`benefit-${index}-${benefit}`}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Prep Info ── */}
                  {(selectedIngredient.prepTime || selectedIngredient.cookTime || selectedIngredient.servings) && (
                    <div className="prep-info">
                      {selectedIngredient.prepTime && (
                        <div className="prep-item">
                          <i className="fas fa-clock"></i>
                          <span className="prep-label">Prep Time</span>
                          <span className="prep-value">{selectedIngredient.prepTime}</span>
                        </div>
                      )}
                      {selectedIngredient.cookTime && (
                        <div className="prep-item">
                          <i className="fas fa-fire"></i>
                          <span className="prep-label">Cook Time</span>
                          <span className="prep-value">{selectedIngredient.cookTime}</span>
                        </div>
                      )}
                      {selectedIngredient.servings && (
                        <div className="prep-item">
                          <i className="fas fa-users"></i>
                          <span className="prep-label">Servings</span>
                          <span className="prep-value">{selectedIngredient.servings}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Ingredients – Part 1 ── */}
                  {selectedIngredient.ingredients && selectedIngredient.ingredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.part1Title || 'Ingredients'}</h3>
                      {selectedIngredient.part1Subtitle && (
                        <p className="recipe-subtitle">{selectedIngredient.part1Subtitle}</p>
                      )}
                      <ul className="ingredients-list">
                        {selectedIngredient.ingredients.map((ingredient, index) => (
                          <li key={`ingredient-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Chutney Ingredients ── */}
                  {selectedIngredient.chutneyIngredients && selectedIngredient.chutneyIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.part2Title || 'Coconut Chutney'}</h3>
                      {selectedIngredient.part2Subtitle && (
                        <p className="recipe-subtitle">{selectedIngredient.part2Subtitle}</p>
                      )}
                      <ul className="ingredients-list">
                        {selectedIngredient.chutneyIngredients.map((ingredient, index) => (
                          <li key={`chutney-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Tempering Ingredients ── */}
                  {selectedIngredient.temperingIngredients && selectedIngredient.temperingIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-fire"></i> {selectedIngredient.temperingTitle || 'For Tempering'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.temperingIngredients.map((ingredient, index) => (
                          <li key={`tempering-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Batter Ingredients ── */}
                  {selectedIngredient.batterIngredients && selectedIngredient.batterIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.batterTitle || 'Batter Ingredients'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.batterIngredients.map((ingredient, index) => (
                          <li key={`batter-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Mint Twist Ingredients ── */}
                  {selectedIngredient.mintTwistIngredients && selectedIngredient.mintTwistIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-leaf"></i> {selectedIngredient.mintTwistTitle || 'Mint Twist'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.mintTwistIngredients.map((ingredient, index) => (
                          <li key={`mint-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Millet Base Ingredients ── */}
                  {selectedIngredient.milletBaseIngredients && selectedIngredient.milletBaseIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-seedling"></i> {selectedIngredient.milletBaseTitle || 'Millet Base'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.milletBaseIngredients.map((ingredient, index) => (
                          <li key={`millet-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Base Ingredients ── */}
                  {selectedIngredient.baseIngredients && selectedIngredient.baseIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-bowl-food"></i> {selectedIngredient.baseTitle || 'Base'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.baseIngredients.map((ingredient, index) => (
                          <li key={`base-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Salad Ingredients ── */}
                  {selectedIngredient.saladIngredients && selectedIngredient.saladIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.saladTitle || 'Salad'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.saladIngredients.map((ingredient, index) => (
                          <li key={`salad-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Salad Base Ingredients ── */}
                  {selectedIngredient.saladBaseIngredients && selectedIngredient.saladBaseIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.saladBaseTitle || 'Salad Base'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.saladBaseIngredients.map((ingredient, index) => (
                          <li key={`salad-base-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Dough Ingredients ── */}
                  {selectedIngredient.doughIngredients && selectedIngredient.doughIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-bread-slice"></i> {selectedIngredient.doughTitle || 'Dough'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.doughIngredients.map((ingredient, index) => (
                          <li key={`dough-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Stuffing Ingredients ── */}
                  {selectedIngredient.stuffingIngredients && selectedIngredient.stuffingIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-carrot"></i> {selectedIngredient.stuffingTitle || 'Stuffing'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.stuffingIngredients.map((ingredient, index) => (
                          <li key={`stuffing-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Toast Ingredients ── */}
                  {selectedIngredient.toastIngredients && selectedIngredient.toastIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-bread-slice"></i> {selectedIngredient.toastTitle || 'Toast'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.toastIngredients.map((ingredient, index) => (
                          <li key={`toast-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Dressing Ingredients ── */}
                  {selectedIngredient.dressingIngredients && selectedIngredient.dressingIngredients.length > 0 && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-wine-bottle"></i> {selectedIngredient.dressingTitle || 'Dressing'}</h3>
                      <ul className="ingredients-list">
                        {selectedIngredient.dressingIngredients.map((ingredient, index) => (
                          <li key={`dressing-${index}-${ingredient}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Preparation Steps – Part 1 ── */}
                  {selectedIngredient.preparationSteps && selectedIngredient.preparationSteps.length > 0 && selectedIngredient.part1StepsTitle && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-list-ol"></i> {selectedIngredient.part1StepsTitle}</h3>
                      <ol className="steps-list">
                        {selectedIngredient.preparationSteps.map((step, index) => (
                          <li key={`prep-step-${index}-${step}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* ── Chutney Preparation Steps – Part 2 ── */}
                  {selectedIngredient.chutneySteps && selectedIngredient.chutneySteps.length > 0 && selectedIngredient.part2StepsTitle && (
                    <div className="recipe-section">
                      <h3><i className="fas fa-list-ol"></i> {selectedIngredient.part2StepsTitle}</h3>
                      <ol className="steps-list">
                        {selectedIngredient.chutneySteps.map((step, index) => (
                          <li key={`chutney-step-${index}-${step}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* ── Variations ── */}
                  {selectedIngredient.variations && selectedIngredient.variations.length > 0 && (
                    <div className="recipe-section optional-section">
                      <h3><i className="fas fa-lightbulb"></i> Variations</h3>
                      <ul className="optional-list">
                        {selectedIngredient.variations.map((item, index) => (
                          <li key={`variation-${index}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Optional Additions ── */}
                  {(selectedIngredient.optionalAdditions || selectedIngredient.optionalAddons) && (
                    <div className="recipe-section optional-section">
                      <h3><i className="fas fa-plus-circle"></i> Optional Additions</h3>
                      <ul className="optional-list">
                        {(selectedIngredient.optionalAdditions || selectedIngredient.optionalAddons || []).map((item, index) => (
                          <li key={`optional-${index}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Serving Suggestion ── */}
                  {selectedIngredient.servingSuggestion && (
                    <div className="recipe-section optional-section">
                      <h3><i className="fas fa-utensils"></i> Serving Suggestion</h3>
                      <p className="serving-text">{selectedIngredient.servingSuggestion}</p>
                    </div>
                  )}

                  {/* ── Nutritional Information ── */}
                  {selectedIngredient.nutritionPer100g?.calories && (
                    <div className="recipe-section nutritional-section">
                      <h3><i className="fas fa-chart-pie"></i> Nutritional Information</h3>
                      <div className="nutritional-grid">
                        {Object.entries(selectedIngredient.nutritionPer100g).map(([key, value]) =>
                          value ? (
                            <div key={`nutrient-${key}-${value}`} className="nutrient-item">
                              <span className="nutrient-name">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </span>
                              <span className="nutrient-value">{value}</span>
                            </div>
                          ) : null
                        )}
                      </div>
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

export default Ingredients;