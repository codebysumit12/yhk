import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import CartSidebar from './CartSidebar';
import YHKLoader from './Yhkloader';
import { API_CONFIG } from '../../config/api';
import './Menu.css';
import './OnlyVeg.css';

const API_URL = API_CONFIG.API_URL;

const OnlyVeg = () => {
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
      heroColor: 'rgba(34,197,94,0.8)'
    },
    vegan: {
      title: '🟢 Vegan Items',
      description: 'Explore our delicious vegan dishes',
      searchPlaceholder: 'Search vegan items...',
      emptyMessage: 'No vegan items available',
      loadingMessage: 'Loading vegan dishes...',
      backText: 'Back to Vegan Items',
      itemDescription: 'Delicious vegan item',
      heroColor: 'rgba(34,197,94,0.8)'
    },
    'non-veg': {
      title: '🔴 Non-Vegetarian Items',
      description: 'Explore our delicious non-vegetarian dishes',
      searchPlaceholder: 'Search non-vegetarian items...',
      emptyMessage: 'No non-vegetarian items available',
      loadingMessage: 'Loading non-vegetarian dishes...',
      backText: 'Back to Non-Vegetarian Items',
      itemDescription: 'Delicious non-vegetarian item',
      heroColor: 'rgba(239,68,68,0.8)'
    }
  };
  
  const currentConfig = foodTypeConfig[foodType] || foodTypeConfig.veg;
  
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

  // Fetch items based on food type and banners
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch banners
        const bannersResponse = await fetch(`${API_URL}/banners?position=hero&isActive=true`);
        const bannersData = await bannersResponse.json();
        if (bannersData.success) {
          setBanners(bannersData.data);
        }

        // Fetch items based on food type
        const itemsResponse = await fetch(`${API_URL}/items?type=${foodType}&isAvailable=true`);
        const itemsData = await itemsResponse.json();
        if (itemsData.success) {
          setItems(itemsData.data);
        }
      } catch (error) {
        console.error(`Error fetching ${foodType} items:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [foodType]);

  const handleAddToCart = (item) => {
    if (!item || !item._id) {
      console.error('❌ Invalid item:', item);
      return;
    }
    const price = item.discountPrice || item.price;
    const newCart = [...cart, { ...item, cartId: Date.now(), finalPrice: price, quantity: 1 }];
    setCart(newCart);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    navigate(`/onlyveg?type=${foodType}&id=${item._id}`);
  };

  const handleBackToItems = () => {
    setSelectedItem(null);
    navigate(`/onlyveg?type=${foodType}`);
  };

  const heroBanner = banners.find(banner => banner.position === 'hero');
  const bannerImage = heroBanner?.mediaUrl ||
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80';

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
    const primaryImage =
      selectedItem.images?.[0]?.url ||
      selectedItem.image ||
      'https://via.placeholder.com/1200x400.png?text=No+Image';

    return (
      <div className="menu-page">
        <section
          className="menu-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), ${currentConfig.heroColor}), url('${primaryImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="menu-hero-content">
            <button className="back-btn" onClick={handleBackToItems}>
              <i className="fas fa-arrow-left"></i> {currentConfig.backText}
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
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ========================================
  // MAIN VEG MENU VIEW
  // ========================================
  return (
    <div className="related-page">
      <section
        className="related-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), ${currentConfig.heroColor}), url('${bannerImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="related-hero-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <h1>{currentConfig.title}</h1>
          <p>{currentConfig.description}</p>
        </div>
      </section>

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
            Showing {items.length} {foodType} items
          </div>
        </div>
      </div>

      <main className="menu-content">
        {loading ? (
          <YHKLoader message={`Preparing ${foodType} menu…`} />
        ) : items.length === 0 ? (
          <div className="no-items">
            <i className="fas fa-leaf"></i>
            <p>{currentConfig.emptyMessage}</p>
          </div>
        ) : (
          <div className="menu-items-grid">
            {items.map((item, index) => {
              const itemImage =
                item.images?.[0]?.url ||
                item.image ||
                `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
              const menuItemKey = item._id
                ? `${foodType}-item-${item._id}`
                : `${foodType}-item-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

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
                    <p>{item.description || currentConfig.itemDescription}</p>

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

      {/* <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
      /> */}
    </div>
  );
};

export default OnlyVeg;