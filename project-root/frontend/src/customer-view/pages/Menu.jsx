import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import { API_CONFIG, fetchWithCacheBust } from '../../config/api';
import './Menu.css';
import './ItemsCard.css';

const API_URL = API_CONFIG.API_URL;

const Menu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // Fetch categories, items and banners
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannersResponse = await fetch(`${API_URL}/banners?position=hero&isActive=true`);
        const bannersData = await bannersResponse.json();
        if (bannersData.success) {
          setBanners(bannersData.data);
        }

        const categoriesResponse = await fetch(`${API_URL}/categories?isActive=true`);
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          const matchedCategory = categoriesData.data.find(c => c.slug === categorySlug);
          if (matchedCategory) {
            setActiveCategory(matchedCategory._id);
          } else if (categoriesData.data.length > 0 && !activeCategory) {
            const firstCategoryWithItems = categoriesData.data.find(c => c.itemCount > 0);
            if (firstCategoryWithItems) {
              setActiveCategory(firstCategoryWithItems._id);
            }
          }
        }

        let itemsUrl = `${API_URL}/items?isAvailable=true`;
        if (activeCategory) {
          itemsUrl += `&categoryId=${activeCategory}`;
        }
        const itemsResponse = await fetchWithCacheBust(itemsUrl);
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
  }, [categorySlug, activeCategory]);

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
    let filtered = items.filter(item => {
      if (!activeCategory) return true;
      let itemCategoryId;
      if (item.categoryId) {
        itemCategoryId = typeof item.categoryId === 'object' && item.categoryId !== null
          ? item.categoryId._id
          : item.categoryId;
      }
      return itemCategoryId && String(itemCategoryId) === String(activeCategory);
    });

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
    navigate(`/menu?id=${item._id}`);
  };

  const handleBackToMenu = () => {
    setSelectedItem(null);
    if (categorySlug) {
      navigate(`/menu/${categorySlug}`);
    } else {
      navigate('/menu');
    }
  };

  const heroBanner = banners.find(banner => banner.position === 'hero');
  const bannerImage = heroBanner?.mediaUrl ||
    'https://media.istockphoto.com/id/893041924/photo/masala-oats-upma-is-a-healthy-breakfast-menu-from-india.jpg?s=170667a&w=0&k=20&c=pZ-W1UxhHrV7bHRmLgs7eeNGvaMmvL8ymjxYPob2Kig=';

  if (loading) {
    return (
      <div className="menu-page">
        <YHKLoader message="Loading menu..." />
      </div>
    );
  }

  // ========================================
  // ITEM DETAIL VIEW
  // ========================================
  if (selectedItem) {
    const getCategoryId = (item) => {
      if (item.categoryId) {
        return typeof item.categoryId === 'object' && item.categoryId !== null
          ? item.categoryId._id
          : item.categoryId;
      }
      return null;
    };

    const selectedCategoryId = getCategoryId(selectedItem);
    const relatedItems = items
      .filter(item => {
        const itemCategoryId = getCategoryId(item);
        return String(itemCategoryId) === String(selectedCategoryId) && item._id !== selectedItem._id;
      })
      .slice(0, 4);

    const primaryImage =
      selectedItem.images?.[0]?.url ||
      selectedItem.image ||
      'https://via.placeholder.com/1200x400.png?text=No+Image';

    return (
      <>
        <Nav onOpenCart={() => setShowCart(true)} />

        <CartNotification
          show={showNotification}
          itemName={addedItemName}
          onViewCart={handleViewCart}
          onClose={() => setShowNotification(false)}
        />

        <div className="menu-page">
          <section
            className="menu-hero"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(46,204,113,0.8)), url('${primaryImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="menu-hero-content">
              <button className="back-btn" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left"></i> Back to Items
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

                {/* Price + Add button */}
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

                {/* Prep info */}
                {(selectedItem.preparationTime || selectedItem.ratings || selectedItem.servingSize) && (
                  <div className="prep-info">
                    {selectedItem.preparationTime && (
                      <div className="prep-item">
                        <i className="fas fa-clock"></i>
                        <span className="prep-label">Prep Time</span>
                        <span className="prep-value">{selectedItem.preparationTime} min</span>
                      </div>
                    )}
                    {selectedItem.ratings && selectedItem.ratings.count > 0 ? (
                      <div className="prep-item">
                        <i className="fas fa-star"></i>
                        <span className="prep-label">Rating</span>
                        <span className="prep-value">
                          {'★'.repeat(Math.round(selectedItem.ratings.average || 0))}
                          {'☆'.repeat(5 - Math.round(selectedItem.ratings.average || 0))}
                          ({(selectedItem.ratings.average || 0).toFixed(1)}/5)
                          <span className="rating-count">
                            ({selectedItem.ratings.count}{' '}
                            {selectedItem.ratings.count === 1 ? 'rating' : 'ratings'})
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="prep-item">
                        <i className="fas fa-star"></i>
                        <span className="prep-label">Rating</span>
                        <span className="prep-value">
                          ☆☆☆☆☆ (0.0/5)
                          <span className="rating-count">(No ratings yet)</span>
                        </span>
                      </div>
                    )}
                    {selectedItem.servingSize && (
                      <div className="prep-item">
                        <i className="fas fa-users"></i>
                        <span className="prep-label">Servings</span>
                        <span className="prep-value">{selectedItem.servingSize}</span>
                      </div>
                    )}
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
                        <li key={index}>💚 {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ingredients */}
                <div className="recipe-section" style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
                  <h3><i className="fas fa-carrot"></i> Ingredients</h3>
                  {selectedItem.ingredients && selectedItem.ingredients.length > 0 ? (
                    <ul className="ingredients-list">
                      {selectedItem.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
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
                        <li key={index} className="prep-step-item">
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
                            <div key={key} className="nutrient-item">
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
                      {selectedItem.type === 'non-veg' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                          color: '#721c24',
                          border: '2px solid #dc3545',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          🔴 Non-Vegetarian
                        </span>
                      )}
                      {selectedItem.type === 'vegan' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #d1ecf1, #bee5eb)',
                          color: '#0c5460',
                          border: '2px solid #17a2b8',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          🌿 Vegan
                        </span>
                      )}
                      {selectedItem.type === 'egg' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                          color: '#856404',
                          border: '2px solid #ffc107',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          🥚 Contains Egg
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
                        <span key={index} className="allergen-tag">⚠️ {allergen}</span>
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
                        <span key={index} className="tag-badge">#{tag}</span>
                      ))}
                    </div>
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
                    {relatedItems.map(item => {
                      const relatedImage =
                        item.images?.[0]?.url ||
                        item.image ||
                        'https://via.placeholder.com/200x150.png?text=No+Image';
                      return (
                        <div
                          key={item._id}
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
      <Nav onOpenCart={() => setShowCart(true)} />

      <CartNotification
        show={showNotification}
        itemName={addedItemName}
        onViewCart={handleViewCart}
        onClose={() => setShowNotification(false)}
      />

      <div className="related-page">
        {heroBanner?.mediaType === 'video' ? (
          <section className="related-hero related-hero-video">
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
              <button className="back-btn" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left"></i> Back to Home
              </button>
              <h1>
                {categories.find(cat => cat._id === activeCategory)?.name || 'Our Menu'}
              </h1>
              <p>Explore our delicious range of dishes</p>
            </div>
          </section>
        ) : (
          <section
            className="related-hero"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(46,204,113,0.8)), url('${bannerImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="related-hero-content">
              <button className="back-btn" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left"></i> Back to Home
              </button>
              <h1>
                {categories.find(cat => cat._id === activeCategory)?.name || 'Our Menu'}
              </h1>
              <p>Explore our delicious range of dishes</p>
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
                placeholder="Search items..."
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
            <YHKLoader message="Preparing the menu…" />
          ) : getFilteredItems().length === 0 ? (
            <div className="no-items">
              <i className="fas fa-utensils"></i>
              <p>No items available in this category</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {getFilteredItems().map(item => {
                const itemImage =
                  item.images?.[0]?.url ||
                  item.image ||
                  `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;

                return (
                  <div
                    key={item._id}
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
                      <p>{item.description || 'Delicious food item'}</p>

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

export default Menu;