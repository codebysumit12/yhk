import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import { API_CONFIG } from '../../config/api';
import './Menu.css';

const API_URL = API_CONFIG.API_URL;

const Menu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categoryId: urlCategoryId } = useParams(); // Get category from URL params
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch(`${API_URL}/categories?isActive=true`);
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          
          // Set active category from URL or use first category
          if (urlCategoryId) {
            setActiveCategory(urlCategoryId);
          } else if (categoriesData.data.length > 0 && !activeCategory) {
            setActiveCategory(categoriesData.data[0]._id);
          }
        }

        const itemsResponse = await fetch(`${API_URL}/items?isAvailable=true`);
        const itemsData = await itemsResponse.json();
        
        if (itemsData.success) {
          setItems(itemsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlCategoryId]);

  const handleAddToCart = (item) => {
    const newCart = [...cart, { ...item, cartId: Date.now(), quantity: 1 }];
    setCart(newCart);
    // Save to localStorage for CartSidebar
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Trigger storage event for cart count update
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }
    
    // Save cart data to localStorage for checkout page
    const checkoutData = {
      items: cart,
      total: getCartTotal(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const handleItemClick = (item) => {
    // Navigate to recipe details if recipe details exist
    if (item.recipeDetails) {
      setSelectedItem(item);
    }
  };

  const handleBackToMenu = () => {
    setSelectedItem(null);
    navigate('/');
  };

  const activeCategoryData = categories.find(cat => cat._id === activeCategory);
  const filteredItems = activeCategory ? items.filter(item => {
    const itemCategoryId = typeof item.category === 'object' ? item.category._id : item.category;
    return itemCategoryId === activeCategory;
  }) : items;

  // Render Recipe Detail View
  if (selectedItem) {
    const recipe = selectedItem.recipeDetails;
    // Get related items based on selected item
    const relatedCategory = categories.find(cat => cat._id === 1);
    let relatedItems = [];
    
    // If selected item is an idly (id 5, 12, 13, 14, 15) - show idly items
    const idlyItemIds = [5, 12, 13, 14, 15];
    // If selected item is a dosa (id 2) - show dosa items
    const dosaItemIds = [2, 16, 17, 18];
    
    if (idlyItemIds.includes(selectedItem.id)) {
      // Show idly items (ids 12, 13, 14, 15)
      relatedItems = relatedCategory ? relatedCategory.items.filter(item => [12, 13, 14, 15].includes(item.id) && item.id !== selectedItem.id) : [];
    } else if (dosaItemIds.includes(selectedItem.id)) {
      // Show dosa items (ids 16, 17, 18)
      relatedItems = relatedCategory ? relatedCategory.items.filter(item => [16, 17, 18].includes(item.id) && item.id !== selectedItem.id) : [];
    } else {
      // Default: show idly items
      relatedItems = relatedCategory ? relatedCategory.items.filter(item => [12, 13, 14, 15].includes(item.id)) : [];
    }
    
    return (
      <div className="menu-page">
        <section className="menu-hero" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${selectedItem.image}')` 
        }}>
          <div className="menu-hero-content">
            <button className="back-btn" onClick={handleBackToMenu}>
              <i className="fas fa-arrow-left"></i> Back to Home
            </button>
            <h1>{selectedItem.name}</h1>
            <p>{selectedItem.description}</p>
          </div>
        </section>

        <div className="recipe-detail-container">
          <div className="recipe-detail-layout">
            {/* Left Column - Recipe Details */}
            <div className="recipe-content">
              <div className="recipe-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>

              <div className="recipe-header">
                <div className="recipe-price">
                  <span className="price-original">₹{selectedItem.price}</span>
                  {selectedItem.discount && (
                    <span className="price-discount">{selectedItem.discount}% OFF</span>
                  )}
                </div>
                <button className="add-btn" onClick={() => handleAddToCart(selectedItem)}>
                  Add to Cart
                </button>
              </div>

              {recipe.benefits && (
                <div className="recipe-section">
                  <h3><i className="fas fa-heart"></i> Health Benefits</h3>
                  <ul className="benefits-list">
                    {recipe.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="prep-info">
                <div className="prep-item">
                  <i className="fas fa-clock"></i>
                  <span className="prep-label">Prep Time</span>
                  <span className="prep-value">{recipe.prepTime}</span>
                </div>
                <div className="prep-item">
                  <i className="fas fa-fire"></i>
                  <span className="prep-label">Cook Time</span>
                  <span className="prep-value">{recipe.cookTime}</span>
                </div>
                <div className="prep-item">
                  <i className="fas fa-users"></i>
                  <span className="prep-label">Servings</span>
                  <span className="prep-value">{recipe.servings}</span>
                </div>
              </div>

              {recipe.ingredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.part1Title || "Ingredients"}</h3>
                  {recipe.part1Subtitle && <p className="recipe-subtitle">{recipe.part1Subtitle}</p>}
                  <ul className="ingredients-list">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.preparationSteps && recipe.part1StepsTitle && (
                <div className="recipe-section">
                  <h3><i className="fas fa-list-ol"></i> {recipe.part1StepsTitle}</h3>
                  <ol className="steps-list">
                    {recipe.preparationSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.preparationSteps && !recipe.part1StepsTitle && !recipe.part2StepsTitle && (
                <div className="recipe-section">
                  <h3><i className="fas fa-list-ol"></i> Preparation Steps</h3>
                  <ol className="steps-list">
                    {recipe.preparationSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.chutneyIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.part2Title || "COCONUT CHUTNEY"}</h3>
                  {recipe.part2Subtitle && <p className="recipe-subtitle">{recipe.part2Subtitle}</p>}
                  <ul className="ingredients-list">
                    {recipe.chutneyIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.chutneySteps && recipe.part2StepsTitle && (
                <div className="recipe-section">
                  <h3><i className="fas fa-list-ol"></i> {recipe.part2StepsTitle}</h3>
                  <ol className="steps-list">
                    {recipe.chutneySteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.batterIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.batterTitle || 'Batter Ingredients'}</h3>
                  <ul className="ingredients-list">
                    {recipe.batterIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.mintTwistIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-leaf"></i> {recipe.mintTwistTitle || 'Mint Twist'}</h3>
                  <ul className="ingredients-list">
                    {recipe.mintTwistIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.milletBaseIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-seedling"></i> {recipe.milletBaseTitle || 'Millet Base'}</h3>
                  <ul className="ingredients-list">
                    {recipe.milletBaseIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.saladMixIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-leaf"></i> {recipe.saladMixTitle || 'Salad Mix'}</h3>
                  <ul className="ingredients-list">
                    {recipe.saladMixIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.baseIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-bowl-food"></i> {recipe.baseTitle || 'Base'}</h3>
                  <ul className="ingredients-list">
                    {recipe.baseIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.saladIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.saladTitle || 'Salad'}</h3>
                  <ul className="ingredients-list">
                    {recipe.saladIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.saladBaseIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.saladBaseTitle || 'Salad Base'}</h3>
                  <ul className="ingredients-list">
                    {recipe.saladBaseIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.doughIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-bread-slice"></i> {recipe.doughTitle || 'Dough'}</h3>
                  <ul className="ingredients-list">
                    {recipe.doughIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.stuffingIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-carrot"></i> {recipe.stuffingTitle || 'Stuffing'}</h3>
                  <ul className="ingredients-list">
                    {recipe.stuffingIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.toastIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-bread-slice"></i> {recipe.toastTitle || 'Toast'}</h3>
                  <ul className="ingredients-list">
                    {recipe.toastIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.dressingIngredients && (
                <div className="recipe-section">
                  <h3><i className="fas fa-wine-bottle"></i> {recipe.dressingTitle || 'Dressing'}</h3>
                  <ul className="ingredients-list">
                    {recipe.dressingIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.cookingSteps && (
                <div className="recipe-section">
                  <h3><i className="fas fa-fire"></i> Cooking Millet</h3>
                  <ol className="steps-list">
                    {recipe.cookingSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.assemblySteps && (
                <div className="recipe-section">
                  <h3><i className="fas fa-utensils"></i> Assembly</h3>
                  <ol className="steps-list">
                    {recipe.assemblySteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {recipe.variations && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-lightbulb"></i> Variations</h3>
                  <ul className="optional-list">
                    {recipe.variations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.optionalAdditions && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-plus-circle"></i> Optional Additions</h3>
                  <ul className="optional-list">
                    {recipe.optionalAdditions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.optionalAddons && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-plus-circle"></i> Optional Add-ons</h3>
                  <ul className="optional-list">
                    {recipe.optionalAddons.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.optional && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-info-circle"></i> Note</h3>
                  <p className="serving-text">{recipe.optional}</p>
                </div>
              )}

              {recipe.servingSuggestion && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-utensils"></i> Serving Suggestion</h3>
                  <p className="serving-text">{recipe.servingSuggestion}</p>
                </div>
              )}

              {recipe.storageTips && (
                <div className="recipe-section optional-section">
                  <h3><i className="fas fa-box"></i> Storage Tips</h3>
                  <p className="serving-text">{recipe.storageTips}</p>
                </div>
              )}

              {recipe.nutritionalInfo && (
                <div className="recipe-section nutritional-section">
                  <h3><i className="fas fa-chart-pie"></i> Nutritional Information</h3>
                  <div className="nutritional-grid">
                    {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="nutrient-item">
                        <span className="nutrient-name">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                        <span className="nutrient-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Related Items */}
            <div className="related-items-column">
              <h3 className="related-items-title">
                <i className="fas fa-utensils"></i> More Breakfast Options
              </h3>
              <div className="related-items-list">
                {relatedItems.map(item => (
                  <div 
                    key={item.id} 
                    className="related-item-card"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="related-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="related-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description.substring(0, 60)}...</p>
                      <div className="related-item-pricing">
                        <span className="related-item-price">₹{item.price}</span>
                        <button 
                          className="add-btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CartSidebar
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
        />
      </div>
    );
  }

  return (
    <div className="menu-page">
      <section className="menu-hero">
        <div className="menu-hero-content">
          <h1>Our Menu</h1>
          <p>Explore our delicious range of dishes</p>
        </div>
      </section>

      <div className="menu-container">
        <aside className="category-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category._id}
                className={`category-item ${activeCategory === category._id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category._id)}
              >
                <span className="category-icon">{category.icon || '🍽️'}</span>
                <span>{category.name}</span>
                <span className="category-count">({filteredItems.filter(item => {
                  const itemCategoryId = typeof item.category === 'object' ? item.category._id : item.category;
                  return itemCategoryId === category._id;
                }).length})</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="menu-content">
          <div className="category-header">
            <h2>
              <span className="category-icon">{activeCategoryData?.icon || '🍽️'}</span>
              {activeCategoryData?.name}
            </h2>
            <span className="item-total">{filteredItems.length} items</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="no-items">
              <i className="fas fa-utensils"></i>
              <p>No items available in this category</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className={`menu-item-card ${item.recipeDetails ? 'clickable' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="menu-item-image">
                    <img src={item.images && item.images[0] ? item.images[0].url : 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} />
                    <div className="discount-badge">{item.discountPrice || item.discount}% OFF</div>
                  </div>
                  <div className="menu-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="menu-item-action">
                    <span className="menu-item-price">₹{item.discountPrice || item.price}</span>
                    <button 
                      className="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button 
            className="floating-cart"
            onClick={() => setShowCart(true)}
          >
            <i className="fas fa-shopping-cart"></i>
            {cart.length > 0 && (
              <span className="cart-count-badge">{cart.reduce((total, item) => total + (item.quantity || 1), 0)}</span>
            )}
          </button>
        )}

        <CartSidebar
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
        />
      </div>
    </div>
  );
};

export default Menu;
