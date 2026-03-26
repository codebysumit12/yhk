import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import Nav from './Nav';
import CartSidebar from './CartSidebar';
import { API_CONFIG, fetchWithCacheBust } from '../../config/api';
import './Menu.css';
import './ItemsCard.css';

const API_URL = API_CONFIG.API_URL;

const Menu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categorySlug } = useParams(); // Get category slug from URL params
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
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

  // Fetch ratings when component mounts - remove order-based calculation
  // useEffect(() => {
  //   fetchItemRatings();
  // }, []);

  // Fetch categories, items and banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const bannersResponse = await fetch(`${API_URL}/banners?position=hero&isActive=true`);
        const bannersData = await bannersResponse.json();
        
        if (bannersData.success) {
          setBanners(bannersData.data);
        }

        const categoriesResponse = await fetch(`${API_URL}/categories?isActive=true`);
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          
          console.log('📋 All categories:', categoriesData.data.map(c => ({ name: c.name, id: c._id, itemCount: c.itemCount, isActive: c.isActive })));
          
          // Find category by slug and set active category ID
          const matchedCategory = categoriesData.data.find(c => c.slug === categorySlug);
          if (matchedCategory) {
            setActiveCategory(matchedCategory._id);
            console.log('🎯 Set category from URL slug:', matchedCategory.name);
          } else if (categoriesData.data.length > 0 && !activeCategory) {
            // AGGRESSIVE: Force set to first category with items
            const firstCategoryWithItems = categoriesData.data.find(c => c.itemCount > 0);
            if (firstCategoryWithItems) {
              setActiveCategory(firstCategoryWithItems._id);
              console.log('🎯 FORCED: Set category with items:', firstCategoryWithItems.name, 'ID:', firstCategoryWithItems._id);
            } else {
              // If no items, find Sweets category specifically (we know it has items)
              const sweetsCategory = categoriesData.data.find(c => c.name === 'Sweets');
              if (sweetsCategory) {
                setActiveCategory(sweetsCategory._id);
                console.log('🎯 FORCED: Set Sweets category:', sweetsCategory._id);
              } else {
                // Final fallback
                const firstActiveCategory = categoriesData.data.find(c => c.isActive);
                if (firstActiveCategory) {
                  setActiveCategory(firstActiveCategory._id);
                  console.log('⚠️ FINAL FALLBACK: Set first active category:', firstActiveCategory.name);
                } else {
                  setActiveCategory(categoriesData.data[0]._id);
                  console.log('⚠️ ULTIMATE FALLBACK: Set first category:', categoriesData.data[0].name);
                }
              }
            }
          }
        }

        // Build API URL with categoryId filter if active
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
  }, [categorySlug]);


  // Handle item detail view from URL
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
    // If no active category, show all items
    if (!activeCategory) {
      return true;
    }
    
    // Handle both categoryId and category fields
    let itemCategoryId;
    
    if (item.categoryId) {
      // If categoryId is an object, extract the _id
      if (typeof item.categoryId === 'object' && item.categoryId !== null) {
        itemCategoryId = item.categoryId._id;
      } else {
        itemCategoryId = item.categoryId;
      }
    } else if (item.category) {
      // For menuitems collection, map category string to ObjectId
      const categoryMap = {
        'beverage': '69b13b978ffe7b66b415b8c5', // Beverages
        'appetizer': '69b13b978ffe7b66b415b8c6', // Appetizers
        'main_course': '69a5ca29bf3eb97a6daa4f22', // Pizza Category Updated (as main course)
        // Alternative mappings for your actual food categories:
        // 'pizza': '69a5ca29bf3eb97a6daa4f22',  // Pizza Category Updated
        // 'sweets': '69a7a24e8ed14f1c9b1cb01f',  // Sweets
        // 'kaju katli': '69a7f292a7ac46d7d19ba645', // kaju katli
      };
      itemCategoryId = categoryMap[item.category];
    }
    
    // Only show items that match the active category
    return itemCategoryId && String(itemCategoryId) === String(activeCategory);
  });
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply sorting
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'discount') {
    filtered.sort((a, b) => {
      const aDiscount = a.discountPrice ? (1 - a.discountPrice/a.price) * 100 : 0;
      const bDiscount = b.discountPrice ? (1 - b.discountPrice/b.price) * 100 : 0;
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
    setShowCart(true); // Show cart sidebar automatically
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice || item.price), 0);
  };

  const handleCheckout = () => {
    // Save cart data to localStorage for checkout page
    const checkoutData = {
      items: cart,
      restaurantId: 'default',
      restaurantName: "Yeswanth's Healthy Kitchen",
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    navigate('/checkout');
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

  
  // Get hero banner from backend
  const heroBanner = banners.find(banner => banner.position === 'hero');
  const bannerImage = heroBanner?.mediaUrl || 'https://media.istockphoto.com/id/893041924/photo/masala-oats-upma-is-a-healthy-breakfast-menu-from-india.jpg?s=170667a&w=0&k=20&c=pZ-W1UxhHrV7bHRmLgs7eeNGvaMmvL8ymjxYPob2Kig=';

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // ITEM DETAIL VIEW
  // ========================================
  if (selectedItem) {
  // ✅ Helper function to extract category ID
  const getCategoryId = (item) => {
    if (item.categoryId) {
      return typeof item.categoryId === 'object' && item.categoryId !== null
        ? item.categoryId._id
        : item.categoryId;
    } else if (item.category) {
      return typeof item.category === 'object' && item.category !== null
        ? item.category._id
        : item.category;
    }
    return null;
  };

  const selectedCategoryId = getCategoryId(selectedItem);
  console.log('🎯 Selected item:', selectedItem.name);
  console.log('🎯 Selected item category:', selectedItem.category || selectedItem.categoryId);
  console.log('🎯 Selected category ID:', selectedCategoryId);
  
  const relatedItems = items.filter(item => {
    const itemCategoryId = getCategoryId(item);
    const isMatch = String(itemCategoryId) === String(selectedCategoryId) && item._id !== selectedItem._id;
    console.log('🔍 Item:', item.name, 'Category:', item.category || item.categoryId, 'Category ID:', itemCategoryId, 'Match:', isMatch);
    return isMatch;
  }).slice(0, 4);
  
  console.log('📋 Related items found:', relatedItems.map(i => i.name));
    
    const primaryImage = selectedItem.images?.[0]?.url || 
                        selectedItem.image || 
                        selectedItem.imageUrl || 
                        'https://via.placeholder.com/1200x400.png?text=No+Image';
    
    // Debug: Check if selectedItem exists
    console.log('🔍 Debug - selectedItem:', selectedItem);
    console.log('🔍 Debug - selectedItem.ratings:', selectedItem?.ratings);
    
    return (
      <>
        <Nav onOpenCart={() => setShowCart(true)} />
        <div className="menu-page">
        <section className="menu-hero" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(46, 204, 113, 0.8)), url('${primaryImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
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
                        {Math.round((1 - selectedItem.discountPrice/selectedItem.price) * 100)}% OFF
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
                    console.log('🔘 Item detail Add + clicked!', selectedItem);
                    console.log('🔘 Selected item data:', selectedItem);
                    handleAddToCart(selectedItem);
                  }}
                >
                  Add +
                </button>
              </div>

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
                        {'★'.repeat(Math.round(selectedItem.ratings.average || 0))}{'☆'.repeat(5 - Math.round(selectedItem.ratings.average || 0))}
                        ({(selectedItem.ratings.average || 0).toFixed(1)}/5)
                        <span className="rating-count">({selectedItem.ratings.count} {selectedItem.ratings.count === 1 ? 'rating' : 'ratings'})</span>
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

              {/* ⭐ BADGES SECTION */}
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

              {/* ⭐ HEALTH BENEFITS */}
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

                 {/* ⭐ INGREDIENTS SECTION - THIS IS WHAT YOU WANT ⭐ */}
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

              {/* ⭐ PREPARATION STEPS */}
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

              {/* ⭐ ENHANCED NUTRITION */}
              {selectedItem.nutritionInfo && Object.values(selectedItem.nutritionInfo).some(val => val) && (
                <div className="recipe-section nutritional-section">
                  <h3><i className="fas fa-chart-pie"></i> Nutritional Information</h3>
                  <div className="nutritional-grid">
                    {Object.entries(selectedItem.nutritionInfo).map(([key, value]) => (
                      value && (
                        <div key={key} className="nutrient-item">
                          <span className="nutrient-name">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="nutrient-value">
                            {typeof value === 'number' ? value : value}
                            {key.toLowerCase().includes('calorie') ? ' cal' : 
                             key.toLowerCase().includes('sodium') ? 'mg' : 'g'}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}


         



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
                        transition: 'all 0.3s ease'
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
                        transition: 'all 0.3s ease'
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
                        transition: 'all 0.3s ease'
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
                        transition: 'all 0.3s ease'
                      }}>
                        🥚 Contains Egg
                      </span>
                    )}
                  </div>
                </div>
              )}

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

            {relatedItems.length > 0 && (
              <div className="related-items-column">
                <h3 className="related-items-title">
                  <i className="fas fa-utensils"></i> More Items
                </h3>
                <div className="related-items-list">
                  {relatedItems.map(item => {
                    const relatedImage = item.images?.[0]?.url || item.image || item.imageUrl || 'https://via.placeholder.com/200x150.png?text=No+Image';
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
                            <span className="related-item-price">₹{item.discountPrice || item.price}</span>
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
          </div>
        </div>

        <CartSidebar
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onCheckout={handleCheckout}
          getCartTotal={getCartTotal}
        />
      </div>
      </>
    );
  }

  // ========================================
// MAIN MENU VIEW
// ========================================
return (
  <>
    <Nav onOpenCart={() => setShowCart(true)} />
    <div className="related-page">
    {console.log('Menu.jsx heroBanner:', heroBanner, 'mediaType:', heroBanner?.mediaType)}
    {heroBanner?.mediaType === 'video' ? (
    <section className="related-hero related-hero-video">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        controls
        onError={(e) => console.error('Menu video error:', e)}
        onLoadStart={() => console.log('Menu video loading started')}
        onCanPlay={() => console.log('Menu video can play')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: '-1',
          display: 'block'
        }}
      >
        <source src={heroBanner.mediaUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="related-hero-overlay"></div>
      <div className="related-hero-content">
      <button className="back-btn" onClick={() => navigate('/customer')}>
        <i className="fas fa-arrow-left"></i> Back to Menu
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(46, 204, 113, 0.8)), url('${bannerImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
    <div className="related-hero-content">
      <button className="back-btn" onClick={() => navigate('/customer')}>
        <i className="fas fa-arrow-left"></i> Back to Menu
      </button>
      <h1>
        {categories.find(cat => cat._id === activeCategory)?.name || 'Our Menu'}
      </h1>
      <p>Explore our delicious range of dishes</p>
    </div>
    </section>
    )}

    <div className="filters-container">
    {/* Filters Bar */}
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


 {/* Main Content Area */}
<main className="menu-content">

  {getFilteredItems().length === 0 ? (
    <div className="no-items">
      <i className="fas fa-utensils"></i>
      <p>No items available in this category</p>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '14px', borderRadius: '5px' }}>
        <strong>DEBUG:</strong><br/>
        Active Category: {activeCategory}<br/>
        Total Items Loaded: {items.length}<br/>
        Filtered Items: {getFilteredItems().length}<br/>
        Items Data: {JSON.stringify(getFilteredItems().slice(0, 2), null, 2)}
      </div>
    </div>
  ) : (
    <div className="menu-items-grid">
      {getFilteredItems().map(item => {
        // Fix malformed image URLs
        const fixImageUrl = (url) => {
          if (!url) return url;
          // If URL starts with 'via.placeholder.com' or similar, add https://
          if (url.startsWith('via.placeholder.com') || url.match(/^\d+x\d+\.png/)) {
            return `https://via.placeholder.com/${url}`;
          }
          return url;
        };
        
        const itemImage = fixImageUrl(item.images?.[0]?.url || item.image || item.imageUrl) || 
                         `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}&bg=ffffff&color=cccccc`;
        
        return (
          <div 
            key={item._id} 
            className="menu-item-card clickable"
            onClick={() => handleItemClick(item)}
          >
            {/* Item Image */}
            <div className="menu-item-image">
              <img 
                src={itemImage} 
                alt={item.name}
                onError={(e) => {
                  console.error('Image failed to load:', itemImage, 'for item:', item.name);
                  const fallbackUrl = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}&bg=ff6b6b&color=ffffff`;
                  e.target.src = fallbackUrl;
                }}
                loading="lazy"
              />
              {/* Discount Badge */}
              {item.discountPrice && (
                <div className="discount-badge">
                  {Math.round((1 - item.discountPrice/item.price) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="menu-item-info">
              <h4>{item.name}</h4>
              <p>{item.description || 'Delicious food item'}</p>

              {/* Pricing Section */}
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
  </>
);

};

export default Menu;
