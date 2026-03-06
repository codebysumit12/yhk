import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MenuManagement.css';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const API_URL = 'http://localhost:5001/api';

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Set active category from URL or fetch items when category changes
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      setActiveCategory(categoryId);
      fetchItemsByCategory(categoryId);
    } else if (activeCategory && !categoryId) {
      fetchItemsByCategory(activeCategory);
    }
  }, [categoryId, activeCategory, categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories?isActive=true`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setCategories(data.data);
        // Only set first category as active if no categoryId is provided in URL
        if (!categoryId) {
          setActiveCategory(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/items?category=${categoryId}&isAvailable=true`);
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + price;
    }, 0);
  };

  const activeCategoryData = categories.find(cat => cat._id === activeCategory);

  // Get primary image or first image
  const getItemImage = (item) => {
    if (!item.images || item.images.length === 0) {
      return 'https://via.placeholder.com/300x200?text=No+Image';
    }
    const primaryImage = item.images.find(img => img.isPrimary);
    return primaryImage ? primaryImage.url : item.images[0].url;
  };

  // Type emoji mapping
  const typeEmojis = {
    veg: '🟢',
    'non-veg': '🔴',
    vegan: '🟢',
    egg: '🟡'
  };

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-hero-content">
          <h1>Our Menu</h1>
          <p>Explore our delicious range of dishes</p>
        </div>
      </section>

      <div className="menu-container">
        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category._id}
                className={`category-item ${activeCategory === category._id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category._id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="item-count">{category.itemCount || 0}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Menu Content */}
        <main className="menu-content">
          <div className="category-header">
            <h2>
              <span className="category-icon">{activeCategoryData?.icon}</span>
              {activeCategoryData?.name}
            </h2>
            <span className="item-total">{items.length} items</span>
          </div>

          {loading ? (
            <div className="loading">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="no-items">
              <p>No items available in this category</p>
            </div>
          ) : (
            <div className="menu-items-grid">
              {items.map(item => (
                <div key={item._id} className="menu-item-card">
                  {/* Item Image */}
                  <div className="menu-item-image">
                    <img src={getItemImage(item)} alt={item.name} />
                    <div className="type-badge" style={{
                      background: item.type === 'veg' || item.type === 'vegan' ? '#dcfce7' : 
                                  item.type === 'non-veg' ? '#fee2e2' : '#fef3c7'
                    }}>
                      {typeEmojis[item.type]}
                    </div>
                    {item.isFeatured && (
                      <div className="featured-badge">⭐ Featured</div>
                    )}
                    {item.isPopular && (
                      <div className="popular-badge">🔥 Popular</div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="menu-item-info">
                    <h4>{item.name}</h4>
                    <p className="description">{item.description}</p>
                    
                    {/* Additional Info */}
                    {(item.preparationTime || item.calories || item.spiceLevel !== 'none') && (
                      <div className="item-meta">
                        {item.preparationTime && (
                          <span className="meta-item">⏱️ {item.preparationTime} min</span>
                        )}
                        {item.calories && (
                          <span className="meta-item">🔥 {item.calories} cal</span>
                        )}
                        {item.spiceLevel !== 'none' && (
                          <span className="meta-item">
                            🌶️ {item.spiceLevel.charAt(0).toUpperCase() + item.spiceLevel.slice(1)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Item Action */}
                  <div className="menu-item-action">
                    <div className="price-container">
                      {item.discountPrice ? (
                        <>
                          <span className="original-price">₹{item.price}</span>
                          <span className="menu-item-price">₹{item.discountPrice}</span>
                          <span className="discount-badge">
                            {Math.round((1 - item.discountPrice/item.price) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="menu-item-price">₹{item.price}</span>
                      )}
                    </div>
                    <button 
                      className="add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        <aside className={`cart-sidebar ${showCart ? 'open' : ''}`}>
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button className="close-cart" onClick={() => setShowCart(false)}>
              ✕
            </button>
          </div>
          
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <i className="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-info">
                    <h5>{item.name}</h5>
                    <span className="cart-item-price">
                      ₹{item.discountPrice || item.price}
                    </span>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.cartId)}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span className="total-amount">₹{getCartTotal()}</span>
              </div>
              <button className="checkout-btn">Checkout</button>
            </div>
          )}
        </aside>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && (
        <button className="floating-cart" onClick={() => setShowCart(true)}>
          🛒
          <span className="cart-count">{cart.length}</span>
        </button>
      )}
    </div>
  );
};

export default MenuManagement;
