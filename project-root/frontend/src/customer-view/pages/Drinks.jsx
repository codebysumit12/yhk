import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Nav from './Nav';
import CartSidebar from './CartSidebar';
import YHKLoader from './Yhkloader';
import { API_CONFIG } from '../../config/api';
import './Menu.css';

const API_URL = API_CONFIG.API_URL;

const Drinks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
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

  // Sync cart changes to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch items and banners
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannersResponse = await fetch(`${API_URL}/banners?position=hero&isActive=true`);
        const bannersData = await bannersResponse.json();
        
        if (bannersData.success) {
          setBanners(bannersData.data);
        }

        const itemsResponse = await fetch(`${API_URL}/items?type=drinks&isAvailable=true`);
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
  }, []);

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
    
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const aDiscount = a.discountPrice ? (1 - a.discountPrice/a.price) * 100 : 0;
          const bDiscount = b.discountPrice ? (1 - b.discountPrice/b.price) * 100 : 0;
          return bDiscount - aDiscount;
        });
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const handleAddToCart = (item) => {
    alert(`Drinks Add to Cart clicked! Item: ${item.name || 'Unknown'}`);
    console.log('🛒 Drinks Add to Cart clicked:', item);
    console.log('🛒 Current cart:', cart);
    
    const price = item.discountPrice || item.price;
    console.log('🛒 Item price:', price);
    
    const newCart = [...cart, { ...item, cartId: Date.now(), finalPrice: price, quantity: 1 }];
    console.log('🛒 New cart:', newCart);
    
    setCart(newCart); // useEffect will handle localStorage sync
    
    // Show success feedback
    console.log('✅ Drinks Item added to cart successfully!');
    alert(`✅ ${item.name} added to cart! Total items: ${newCart.length}`);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice || item.price), 0);
  };

  const handleCheckout = () => {
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
    navigate(`/drinks?id=${item._id}`);
  };

  const handleBackToMenu = () => {
    setSelectedItem(null);
    navigate('/drinks');
  };

  const heroBanner = banners.find(banner => banner.position === 'hero');
  const bannerImage = heroBanner?.mediaUrl || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1920&q=80';

  if (loading) {
    return (
      <div className="menu-page">
        <YHKLoader message="Loading drinks..." />
      </div>
    );
  }

  // ITEM DETAIL VIEW
  if (selectedItem) {
    const relatedItems = items.filter(item => item._id !== selectedItem._id).slice(0, 4);
    const primaryImage = selectedItem.images?.[0]?.url || selectedItem.image || selectedItem.imageUrl || 'https://via.placeholder.com/1200x400.png?text=No+Image';
    
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
                <i className="fas fa-arrow-left"></i> Back to Drinks
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
                  <button className="add-btn" onClick={() => handleAddToCart(selectedItem)}>
                    Add to Cart
                  </button>
                </div>

                {(selectedItem.preparationTime || selectedItem.calories || selectedItem.servingSize) && (
                  <div className="prep-info">
                    {selectedItem.preparationTime && (
                      <div className="prep-item">
                        <i className="fas fa-clock"></i>
                        <span className="prep-label">Prep Time</span>
                        <span className="prep-value">{selectedItem.preparationTime} min</span>
                      </div>
                    )}
                    {selectedItem.calories && (
                      <div className="prep-item">
                        <i className="fas fa-fire"></i>
                        <span className="prep-label">Calories</span>
                        <span className="prep-value">{selectedItem.calories} cal</span>
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

                {(selectedItem.isFeatured || selectedItem.isPopular) && (
                  <div className="recipe-section">
                    <h3><i className="fas fa-award"></i> Special</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {selectedItem.isFeatured && <span className="badge-featured">⭐ Featured</span>}
                      {selectedItem.isPopular && <span className="badge-popular">🔥 Popular</span>}
                    </div>
                  </div>
                )}

                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div className="recipe-section" style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
                    <h3><i className="fas fa-carrot"></i> Ingredients</h3>
                    <ul className="ingredients-list">
                      {selectedItem.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
              </div>

              {relatedItems.length > 0 && (
                <div className="related-items-column">
                  <h3 className="related-items-title">
                    <i className="fas fa-glass-cheers"></i> More Drinks
                  </h3>
                  <div className="related-items-list">
                    {relatedItems.map((item, index) => {
                      const relatedImage = item.images?.[0]?.url || item.image || item.imageUrl || 'https://via.placeholder.com/200x150.png?text=No+Image';
                      return (
                        <div 
                          key={`drink-related-${item._id || item.name || index}`}
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

  // MAIN GRID VIEW
  return (
    <>
      <Nav onOpenCart={() => setShowCart(true)} />
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
              <h1>🥤 Drinks</h1>
              <p>Refresh yourself with our refreshing drinks</p>
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
              <h1>🥤 Drinks</h1>
              <p>Refresh yourself with our refreshing drinks</p>
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
                placeholder="Search drinks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="item-count">
              Showing {getFilteredItems().length} items
            </div>
          </div>
        </div>

        <main className="menu-content" style={{ padding: '30px 50px' }}>
          {getFilteredItems().length === 0 ? (
            <div className="no-items">
              <i className="fas fa-glass-martini"></i>
              <p>No drinks available</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {getFilteredItems().map((item, index) => {
                const itemImage = item.images?.[0]?.url || item.image || item.imageUrl || `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
                
                return (
                  <div 
                    key={`drink-item-${item._id || item.name || index}`}
                    className="menu-item-card clickable"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="menu-item-image">
                      <img 
                        src={itemImage} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
                        }}
                        loading="lazy"
                      />
                      {item.discountPrice && (
                        <div className="discount-badge">
                          {Math.round((1 - item.discountPrice/item.price) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    <div className="menu-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description || 'Delicious drink'}</p>

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

export default Drinks;