import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import { API_CONFIG, authHeaders } from '../../config/api';
import './Trending.css';

const Offers = () => {
  const [offersItems, setOffersItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  // Fetch offers items (items with more than 20% discount)
  useEffect(() => {
    const fetchOffersItems = async () => {
      try {
        setLoading(true);
        console.log('🎯 Fetching offers items...');
        
        // Fetch all items and filter for discounts > 20%
        const allItemsResponse = await fetch(`${API_CONFIG.API_URL}/items`, {
          headers: authHeaders()
        });
        
        console.log('📦 All items response status:', allItemsResponse.status);
        if (allItemsResponse.ok) {
          const allItemsData = await allItemsResponse.json();
          console.log('📦 All items response:', JSON.stringify(allItemsData, null, 2));
          
          if (allItemsData.success && allItemsData.data.length > 0) {
            // Filter items with more than 20% discount
            const offersItems = allItemsData.data.filter(item => {
              if (!item.discountPrice || !item.price) return false;
              const discountPercentage = ((item.price - item.discountPrice) / item.price) * 100;
              return discountPercentage > 20;
            });
            
            console.log('🎉 Found', offersItems.length, 'items with >20% discount');
            
            // Sort by discount percentage (highest first)
            const sortedOffers = offersItems.sort((a, b) => {
              const discountA = ((a.price - a.discountPrice) / a.price) * 100;
              const discountB = ((b.price - b.discountPrice) / b.price) * 100;
              return discountB - discountA;
            });
            
            setOffersItems(sortedOffers);
          } else {
            console.log('❌ No items data found');
          }
        } else {
          console.log('❌ Failed to fetch items:', allItemsResponse.status);
        }
      } catch (error) {
        console.error('❌ Error fetching offers items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffersItems();
  }, []);

  const getFilteredAndSortedItems = () => {
    let filtered = [...offersItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = ((a.price - a.discountPrice) / a.price) * 100;
          const discountB = ((b.price - b.discountPrice) / b.price) * 100;
          return discountB - discountA;
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = a.ratings?.average || a.rating || 0;
          const ratingB = b.ratings?.average || b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        break;
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
    navigate(`/onlyveg?id=${item._id}`);
  };

  if (loading) {
    return (
      <div className="trending-page">
        <YHKLoader message="Loading offers..." />
      </div>
    );
  }

  const filteredItems = getFilteredAndSortedItems();

  return (
    <>
      <CartNotification
        show={showNotification}
        itemName={addedItemName}
        onViewCart={handleViewCart}
        onClose={() => setShowNotification(false)}
      />

      <div className="trending-page" style={{ 
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        minHeight: '100vh'
      }}>
        {/* Hero Section */}
        <section className="trending-hero" style={{
          backgroundImage: `linear-gradient(135deg, rgba(16,185,129,0.9), rgba(34,197,94,0.8)), url('https://images.unsplash.com/photo-1607082348824-0a96fdaa7b0a?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <div className="trending-hero-content">
            <h1>🎉 Special Offers</h1>
            <p>Amazing deals with more than 20% discount!</p>
            <div className="trending-stats">
              <div className="stat-item">
                <span className="stat-number">{offersItems.length}</span>
                <span className="stat-label">Hot Deals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{filteredItems.length}</span>
                <span className="stat-label">Available Now</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <div className="trending-filters-container">
          <div className="trending-filters">
            <div className="filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="discount">💰 Biggest Discount</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="rating">⭐ Rating</option>
                <option value="name">📝 Name</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Offers Items Grid */}
        <main className="trending-content">
          {filteredItems.length === 0 ? (
            <div className="no-trending-items">
              <i className="fas fa-percent"></i>
              <h3>No special offers found</h3>
              <p>Check back later for amazing deals!</p>
            </div>
          ) : (
            <div className="trending-items-grid">
              {filteredItems.map((item, index) => {
                const itemImage =
                  item.images?.[0]?.url ||
                  item.image ||
                  `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
                
                const discountPercentage = ((item.price - item.discountPrice) / item.price) * 100;
                const offersKey = item._id
                  ? `offers-${item._id}`
                  : `offers-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

                return (
                  <div
                    key={offersKey}
                    className="trending-item-card clickable"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="trending-item-image">
                      <img src={itemImage} alt={item.name} loading="lazy" />
                      
                      {/* Offers badges */}
                      <div className="trending-badges">
                        <div className="trending-badge discount">
                          {Math.round(discountPercentage)}% OFF
                        </div>
                        {item.isPopular && (
                          <div className="trending-badge popular">🔥 Popular</div>
                        )}
                        {item.isFeatured && (
                          <div className="trending-badge featured">⭐ Featured</div>
                        )}
                      </div>

                      {/* Hot Deal Badge */}
                      <div className="trending-rank" style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        fontSize: '0.8rem',
                        fontWeight: '800'
                      }}>
                        🔥 HOT
                      </div>
                    </div>

                    <div className="trending-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description || 'Amazing deal item'}</p>

                      {/* Rating display */}
                      {item.ratings?.average && item.ratings.count > 0 ? (
                        <div className="trending-rating">
                          <span className="rating-stars">
                            {'★'.repeat(Math.round(item.ratings.average))}
                            {'☆'.repeat(5 - Math.round(item.ratings.average))}
                          </span>
                          <span className="rating-text">
                            {item.ratings.average.toFixed(1)} ({item.ratings.count} reviews)
                          </span>
                        </div>
                      ) : item.rating ? (
                        <div className="trending-rating">
                          <span className="rating-stars">
                            {'★'.repeat(Math.round(item.rating))}
                            {'☆'.repeat(5 - Math.round(item.rating))}
                          </span>
                          <span className="rating-text">{item.rating.toFixed(1)} / 5</span>
                        </div>
                      ) : null}

                      {/* Savings info */}
                      <div className="trending-stats-row">
                        <div className="trending-orders">
                          <i className="fas fa-piggy-bank"></i>
                          <span>Save ₹{Math.round(item.price - item.discountPrice).toLocaleString()}</span>
                        </div>
                        <div className="trending-revenue">
                          <i className="fas fa-percentage"></i>
                          <span>{Math.round(discountPercentage)}% OFF</span>
                        </div>
                      </div>

                      <div className="trending-item-pricing">
                        <div className="price-info">
                          <span className="original-price">₹{item.price}</span>
                          <span className="discounted-price">₹{item.discountPrice}</span>
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

        {/* Floating Cart */}
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
    </>
  );
};

export default Offers;
