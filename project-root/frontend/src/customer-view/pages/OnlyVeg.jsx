import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import { API_CONFIG, fetchWithCacheBust } from '../../config/api';
import './Menu.css';
import './ItemsCard.css';

const API_URL = API_CONFIG.API_URL;

const VegOnly = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get food type from URL params (default to 'veg')
  const foodType = searchParams.get('type') || 'veg';
  
  // Configuration for different food types
  const foodTypeConfig = {
    veg: {
      title: '🟢 Vegetarian Items',
      description: 'Explore our delicious vegetarian dishes',
      searchPlaceholder: 'Search vegetarian items...',
      emptyMessage: 'No vegetarian items available',
      loadingMessage: 'Loading vegetarian dishes...',
      backText: 'Back to Vegetarian Items',
      itemDescription: 'Delicious vegetarian item',
      heroGradient: 'rgba(34,197,94,0.9), rgba(16,185,129,0.8)'
    },
    vegan: {
      title: '🟢 Vegan Items',
      description: 'Explore our delicious vegan dishes',
      searchPlaceholder: 'Search vegan items...',
      emptyMessage: 'No vegan items available',
      loadingMessage: 'Loading vegan dishes...',
      backText: 'Back to Vegan Items',
      itemDescription: 'Delicious vegan item',
      heroGradient: 'rgba(34,197,94,0.9), rgba(16,185,129,0.8)'
    },
    'non-veg': {
      title: '🔴 Non-Vegetarian Items',
      description: 'Explore our delicious non-vegetarian dishes',
      searchPlaceholder: 'Search non-vegetarian items...',
      emptyMessage: 'No non-vegetarian items available',
      loadingMessage: 'Loading non-vegetarian dishes...',
      backText: 'Back to Non-Vegetarian Items',
      itemDescription: 'Delicious non-vegetarian item',
      heroGradient: 'rgba(239,68,68,0.9), rgba(220,38,38,0.8)'
    },
    drinks: {
      title: '🥤 Drinks',
      description: 'Explore our refreshing drinks and beverages',
      searchPlaceholder: 'Search drinks...',
      emptyMessage: 'No drinks available',
      loadingMessage: 'Loading drinks...',
      backText: 'Back to Drinks',
      itemDescription: 'Refreshing drink',
      heroGradient: 'rgba(59,130,246,0.9), rgba(37,99,235,0.8)'
    },
    smoothies: {
      title: '🥤 Smoothies',
      description: 'Explore our healthy and delicious smoothies',
      searchPlaceholder: 'Search smoothies...',
      emptyMessage: 'No smoothies available',
      loadingMessage: 'Loading smoothies...',
      backText: 'Back to Smoothies',
      itemDescription: 'Healthy smoothie',
      heroGradient: 'rgba(52,211,153,0.9), rgba(16,185,129,0.8)'
    },
    desserts: {
      title: '🍰 Desserts',
      description: 'Explore our delicious desserts and sweet treats',
      searchPlaceholder: 'Search desserts...',
      emptyMessage: 'No desserts available',
      loadingMessage: 'Loading desserts...',
      backText: 'Back to Desserts',
      itemDescription: 'Sweet dessert',
      heroGradient: 'rgba(236,72,153,0.9), rgba(219,39,119,0.8)'
    },
    'birthday-party': {
      title: '🎉 Birthday Party Packages',
      description: 'Explore our amazing birthday party packages and deals',
      searchPlaceholder: 'Search party packages...',
      emptyMessage: 'No party packages available',
      loadingMessage: 'Loading party packages...',
      backText: 'Back to Party Packages',
      itemDescription: 'Birthday party package',
      heroGradient: 'rgba(168,85,247,0.9), rgba(147,51,234,0.8)'
    }
  };
  
  const currentConfig = foodTypeConfig[foodType] || foodTypeConfig.veg;
  
  // Get background gradient for page
  const getPageBackground = () => {
    const backgrounds = {
      'veg': 'linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)',
      'vegan': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      'non-veg': 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      'drinks': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      'smoothies': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      'desserts': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      'birthday-party': 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    };
    return backgrounds[foodType] || backgrounds['veg'];
  };
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  // Fetch items and banners
  useEffect(() => {
    // Debug: log food type to console
    console.log('Current foodType:', foodType);
    console.log('Current config:', currentConfig);
    console.log('Page background:', getPageBackground());
    
    // Apply background to body as fallback
    document.body.style.background = getPageBackground();
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannersResponse = await fetch(`${API_URL}/banners?position=hero&isActive=true`);
        const bannersData = await bannersResponse.json();
        if (bannersData.success) {
          setBanners(bannersData.data);
        }

        // Fetch items based on food type
        const itemsResponse = await fetchWithCacheBust(`${API_URL}/items?type=${foodType}&isAvailable=true`);
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
  }, [foodType]);

  useEffect(() => {
    const itemId = searchParams.get('id');
    if (itemId && items.length > 0) {
      const item = items.find(i => i._id === itemId);
      if (item) {
        setSelectedItem(item);
      }
    } else if (!itemId) {
      setSelectedItem(null);
    }
  }, [searchParams, items]);

  const getFilteredItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'discount') {
      filtered.sort((a, b) => {
        const aDiscount = a.discountPrice ? (1 - a.discountPrice / a.price) * 100 : 0;
        const bDiscount = b.discountPrice ? (1 - b.discountPrice / b.price) * 100 : 0;
        return bDiscount - aDiscount;
      });
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return filtered;
  };

  const handleAddToCart = (item) => {
    if (!item || !item._id) {
      console.error('❌ Invalid item:', item);
      return;
    }
    const price = item.discountPrice || item.price;
    const newCart = [...cart, { ...item, cartId: Date.now(), finalPrice: price, quantity: 1 }];
    setCart(newCart);
    setAddedItemName(item.name);
    setShowNotification(true);
  };

  const handleViewCart = () => {
    setShowNotification(false);
    setShowCart(true);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackToMenu = () => {
    setSelectedItem(null);
  };

  const heroBanner = banners.find(banner => banner.position === 'hero');
  const bannerImage = heroBanner?.mediaUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80';

  if (loading) {
    return (
      <div className="menu-page">
        <YHKLoader message={currentConfig.loadingMessage} />
      </div>
    );
  }

  // ========================================
  // ITEM DETAIL VIEW
  // ========================================
  if (selectedItem) {
    const relatedItems = items.filter(item => item._id !== selectedItem._id);
    const primaryImage =
      selectedItem.images?.[0]?.url ||
      selectedItem.image ||
      'https://via.placeholder.com/1200x400.png?text=No+Image';

    return (
      <>
        <CartNotification
          show={showNotification}
          itemName={addedItemName}
          onViewCart={handleViewCart}
          onClose={() => setShowNotification(false)}
        />

        <div className="menu-page">
          <section
            className={`menu-hero ${foodType}-hero`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${currentConfig.heroGradient}), url('${primaryImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="menu-hero-content">
              <button className="back-btn" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left"></i> {currentConfig.backText}
              </button>
              <h1>{selectedItem.name}</h1>
              <p>{selectedItem.description}</p>
            </div>
          </section>

          <div className="recipe-detail-container">
            <div className="recipe-detail-layout">

              {/* ── LEFT / MAIN COLUMN ── */}
              <div className="recipe-content">
                <div className="recipe-image">
                  <img src={primaryImage} alt={selectedItem.name} />
                </div>

                <div className="recipe-header">
                  <div className="recipe-price">
                    {selectedItem.discountPrice ? (
                      <>
                        <span className="price-original">₹{selectedItem.discountPrice}</span>
                        <span className="price-strikethrough">₹{selectedItem.price}</span>
                        <span className="price-discount">
                          {Math.round((1 - selectedItem.discountPrice / selectedItem.price) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="price-original">₹{selectedItem.price}</span>
                    )}
                  </div>
                  <button
                    className="add-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(selectedItem);
                    }}
                  >
                    Add +
                  </button>
                </div>

                <div className="recipe-description">
                  <h3>Description</h3>
                  <p>{selectedItem.description || currentConfig.itemDescription}</p>
                </div>

                {/* Ingredients */}
                <div className="recipe-section" style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
                  <h3><i className="fas fa-carrot"></i> Ingredients</h3>
                  {selectedItem.ingredients && selectedItem.ingredients.length > 0 ? (
                    <ul className="ingredients-list">
                      {selectedItem.ingredients.map((ingredient, index) => (
                        <li key={`ingredient-${index}-${ingredient}`}>{ingredient}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data">
                      ⚠️ No ingredients added yet. Please add ingredients in the admin panel.
                    </p>
                  )}
                </div>

                {/* Preparation Steps */}
                {selectedItem.preparationSteps && selectedItem.preparationSteps.length > 0 && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-list-ol"></i> Preparation Steps</h3>
                    <ol className="prep-steps-list">
                      {selectedItem.preparationSteps.map((step, index) => (
                        <li key={`prep-step-${index}-${step}`} className="prep-step-item">
                          <span className="step-number">{index + 1}</span>
                          <span className="step-text">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Nutrition */}
                {selectedItem.nutritionInfo &&
                  Object.values(selectedItem.nutritionInfo).some(val => val) && (
                    <div className="recipe-section nutritional-section">
                      <h3><i className="fas fa-chart-pie"></i> Nutritional Information</h3>
                      <div className="nutritional-grid">
                        {Object.entries(selectedItem.nutritionInfo).map(([key, value]) =>
                          value ? (
                            <div key={`nutrient-${key}-${value}`} className="nutrient-item">
                              <span className="nutrient-name">
                                {key.charAt(0).toUpperCase() +
                                  key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="nutrient-value">
                                {value}
                                {key.toLowerCase().includes('calorie')
                                  ? ' cal'
                                  : key.toLowerCase().includes('sodium')
                                  ? 'mg'
                                  : 'g'}
                              </span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                {/* Type */}
                {selectedItem?.type && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-leaf"></i> Type</h3>
                    <div className="type-badge-container">
                      {selectedItem.type === 'veg' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                          color: '#155724',
                          border: '2px solid #28a745',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          🟢 Vegetarian
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Spice Level */}
                {selectedItem.spiceLevel && selectedItem.spiceLevel !== 'none' && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-pepper-hot"></i> Spice Level</h3>
                    <div className="spice-indicator">
                      {selectedItem.spiceLevel === 'mild' && <span>🌶️ Mild</span>}
                      {selectedItem.spiceLevel === 'medium' && <span>🌶️🌶️ Medium</span>}
                      {selectedItem.spiceLevel === 'hot' && <span>🌶️🌶️🌶️ Hot</span>}
                      {selectedItem.spiceLevel === 'extra-hot' && <span>🔥🔥🔥 Extra Hot</span>}
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-exclamation-triangle"></i> Allergens</h3>
                    <div className="allergen-tags">
                      {selectedItem.allergens.map((allergen, index) => (
                        <span key={`allergen-${index}-${allergen}`} className="allergen-tag">⚠️ {allergen}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-tags"></i> Tags</h3>
                    <div className="tags-container">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={`tag-${index}-${tag}`} className="tag-badge">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="recipe-section">
                  <h3><i className="fas fa-award"></i> Special</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedItem.isFeatured && <span className="badge-featured">⭐ Featured</span>}
                    {selectedItem.isPopular && <span className="badge-popular">🔥 Popular</span>}
                    {!selectedItem.isFeatured && !selectedItem.isPopular && (
                      <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No special badges</span>
                    )}
                  </div>
                </div>

                {/* Health Benefits */}
                {selectedItem.healthBenefits && selectedItem.healthBenefits.length > 0 && (
                  <div className="recipe-section" style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
                    <h3><i className="fas fa-heart"></i> Health Benefits</h3>
                    <ul className="benefits-list">
                      {selectedItem.healthBenefits.map((benefit, index) => (
                        <li key={`benefit-${index}-${benefit}`}>💚 {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* ── END LEFT COLUMN ── */}

              {/* ── RIGHT COLUMN: Related Items ── */}
              {relatedItems.length > 0 && (
                <div className="related-items-column">
                  <h3 className="related-items-title">
                    <i className="fas fa-utensils"></i> More Items
                  </h3>
                  <div className="related-items-list">
                    {relatedItems.map((item, index) => {
                      const relatedImage =
                        item.images?.[0]?.url ||
                        item.image ||
                        'https://via.placeholder.com/200x150.png?text=No+Image';
                      const relatedKey = item._id
                        ? `related-${item._id}`
                        : `related-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;
                      return (
                        <div
                          key={relatedKey}
                          className="related-item-card"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="related-item-image">
                            <img src={relatedImage} alt={item.name} />
                          </div>
                          <div className="related-item-info">
                            <h4>{item.name}</h4>
                            <p>{item.description?.substring(0, 60)}...</p>
                            <div className="related-item-pricing">
                              <span className="related-item-price">
                                ₹{item.discountPrice || item.price}
                              </span>
                              <button
                                className="add-btn-small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(item);
                                }}
                              >
                                Add +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* ── END RIGHT COLUMN ── */}

            </div>
            {/* ── END recipe-detail-layout ── */}
          </div>
          {/* ── END recipe-detail-container ── */}

          <CartSidebar
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            cart={cart}
          />
        </div>
        {/* ── END menu-page ── */}
      </>
    );
  }

  // ========================================
  // MAIN MENU VIEW
  // ========================================
  return (
    <>
      <CartNotification
        show={showNotification}
        itemName={addedItemName}
        onViewCart={handleViewCart}
        onClose={() => setShowNotification(false)}
      />

      <div className={`related-page ${foodType}-page`} style={{ background: getPageBackground(), minHeight: '100vh' }}>
        {heroBanner?.mediaType === 'video' ? (
          <section className={`related-hero related-hero-video ${foodType}-hero`}>
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: '-1',
              }}
            >
              <source src={heroBanner.mediaUrl} type="video/mp4" />
            </video>
            <div className="related-hero-overlay"></div>
            <div className="related-hero-content">
              <h1>{currentConfig.title}</h1>
              <p>{currentConfig.description}</p>
            </div>
          </section>
        ) : (
          <section
            className={`related-hero ${foodType}-hero`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${currentConfig.heroGradient}), url('${bannerImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="related-hero-content">
              <h1>{currentConfig.title}</h1>
              <p>{currentConfig.description}</p>
            </div>
          </section>
        )}

        <div className="filters-container">
          <div className="related-filters">
            <div className="filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Discount %</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder={currentConfig.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="item-count">
              Showing {getFilteredItems().length} items
            </div>
          </div>
        </div>

        <main className="menu-content">
          {loading ? (
            <YHKLoader message={currentConfig.loadingMessage} />
          ) : getFilteredItems().length === 0 ? (
            <div className="no-items">
              <i className="fas fa-utensils"></i>
              <p>{currentConfig.emptyMessage}</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {getFilteredItems().map((item, index) => {
                const itemImage =
                  item.images?.[0]?.url ||
                  item.image ||
                  `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
                const menuItemKey = item._id
                  ? `veg-item-${item._id}`
                  : `veg-item-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

                return (
                  <div
                    key={menuItemKey}
                    className="menu-item-card clickable"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="menu-item-image">
                      <img src={itemImage} alt={item.name} loading="lazy" />
                      {item.discountPrice && (
                        <div className="discount-badge">
                          {Math.round((1 - item.discountPrice / item.price) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    <div className="menu-item-info">
                      <h4>{item.name}</h4>

                      <div className="menu-item-pricing">
                        <div className="price-info">
                          {item.discountPrice ? (
                            <>
                              <span className="original-price">₹{item.price}</span>
                              <span className="discounted-price">₹{item.discountPrice}</span>
                            </>
                          ) : (
                            <span className="discounted-price">₹{item.price}</span>
                          )}
                        </div>
                        <button
                          className="add-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {cart.length > 0 && (
          <button className="floating-cart" onClick={() => setShowCart(true)}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count-badge">
              {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
            </span>
          </button>
        )}

        <CartSidebar
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
        />
      </div>
      {/* ── END related-page ── */}
    </>
  );
};

export default VegOnly;
