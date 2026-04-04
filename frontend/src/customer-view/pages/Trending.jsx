import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import { API_CONFIG, authHeaders } from '../../config/api';
import './Trending.css';

const Trending = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  // Fetch trending/popular items using same logic as admin dashboard
  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        setLoading(true);
        console.log('🔥 Starting to fetch trending items...');
        
        // Fetch all orders to calculate popular items like admin dashboard
        console.log('📊 Fetching orders from:', `${API_CONFIG.API_URL}/orders`);
        
        // Debug authentication
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        console.log('🔑 Token found:', token ? 'YES' : 'NO');
        console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        const headers = authHeaders();
        console.log('📤 Headers being sent:', JSON.stringify(headers, null, 2));
        
        const ordersResponse = await fetch(`${API_CONFIG.API_URL}/orders`, {
          headers: headers
        });
        
        console.log('📋 Orders response status:', ordersResponse.status);
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          console.log('📦 Orders data received:', ordersData);
          
          if (ordersData.success && ordersData.data.length > 0) {
            console.log('✅ Found', ordersData.data.length, 'orders');
            console.log('📊 Analyzing orders for trending items:', ordersData.data);
            
            // Calculate popular items using same logic as admin dashboard
            const itemStats = {};
            ordersData.data.forEach(order => {
              const orderItems = order.orderItems || order.items || [];
              console.log('🛒 Processing order with', orderItems.length, 'items');
              
              orderItems.forEach(item => {
                const itemName = item.name || 'Unknown Item';
                if (itemStats[itemName]) {
                  itemStats[itemName].orders += item.quantity || 1;
                  itemStats[itemName].revenue += (item.price || 0) * (item.quantity || 1);
                  // Store the first item details for later use
                  if (!itemStats[itemName].itemDetails) {
                    itemStats[itemName].itemDetails = item;
                  }
                } else {
                  itemStats[itemName] = {
                    orders: item.quantity || 1,
                    revenue: (item.price || 0) * (item.quantity || 1),
                    itemDetails: item
                  };
                }
              });
            });

            console.log('📈 Item stats calculated:', itemStats);

            // Sort by orders and get top items
            const popularItemsData = Object.entries(itemStats)
              .sort(([, a], [, b]) => b.orders - a.orders)
              .slice(0, 20) // Show top 20 trending items
              .map(([name, data]) => ({
                name,
                orders: data.orders,
                revenue: Math.round(data.revenue),
                itemDetails: data.itemDetails
              }));

            console.log('🔥 Calculated trending items:', popularItemsData);
            
            if (popularItemsData.length > 0) {
              // Now fetch full item details for these popular items
              console.log('🔍 Fetching full item details...');
              const allItemsResponse = await fetch(`${API_CONFIG.API_URL}/items?isAvailable=true`, {
                headers: authHeaders()
              });
              
              if (allItemsResponse.ok) {
                const allItemsData = await allItemsResponse.json();
                console.log('📦 All items data:', allItemsData);
                
                if (allItemsData.success) {
                  // Match popular items with full item details
                  const trendingItemsWithDetails = popularItemsData.map(popularItem => {
                    const fullItem = allItemsData.data.find(item => 
                      item.name === popularItem.name || 
                      item._id === popularItem.itemDetails?._id
                    );
                    
                    console.log('🔍 Matching', popularItem.name, 'with full item:', fullItem);
                    
                    return {
                      ...fullItem,
                      ...popularItem,
                      // Ensure we have the calculated stats
                      soldCount: popularItem.orders,
                      totalRevenue: popularItem.revenue
                    };
                  }).filter(item => item); // Remove any undefined items
                  
                  console.log('🎯 Final trending items with details:', trendingItemsWithDetails);
                  
                  if (trendingItemsWithDetails.length > 0) {
                    setTrendingItems(trendingItemsWithDetails);
                    setLoading(false);
                    return;
                  } else {
                    console.log('❌ No matching items found');
                  }
                }
              }
            }
          } else {
            console.log('❌ No orders found or orders data empty');
          }
        } else {
          console.error('❌ Failed to fetch orders:', ordersResponse.status);
        }

        // Fallback: If no order data, use popular flag items
        console.log('⚠️ No order data found, using popular flag items as fallback');
        const popularResponse = await fetch(`${API_CONFIG.API_URL}/items?isPopular=true&isAvailable=true`, {
          headers: authHeaders()
        });
        
        console.log('🔥 Popular response status:', popularResponse.status);
        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          console.log('🔥 Popular items fallback response:', JSON.stringify(popularData, null, 2));
          
          if (popularData.success && popularData.data.length > 0) {
            console.log('✅ Found', popularData.data.length, 'popular items');
            setTrendingItems(popularData.data);
            setLoading(false);
            return;
          } else {
            console.log('❌ Popular items response not successful or no data');
          }
        } else {
          console.log('❌ Popular items request failed:', popularResponse.status);
        }

        // Final fallback: Featured items
        console.log('⚠️ Using featured items as final fallback');
        const featuredResponse = await fetch(`${API_CONFIG.API_URL}/items?isFeatured=true&isAvailable=true`, {
          headers: authHeaders()
        });
        
        console.log('⭐ Featured response status:', featuredResponse.status);
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          console.log('⭐ Featured items fallback response:', JSON.stringify(featuredData, null, 2));
          
          if (featuredData.success && featuredData.data.length > 0) {
            console.log('✅ Found', featuredData.data.length, 'featured items');
            setTrendingItems(featuredData.data);
          } else {
            console.log('❌ Featured items response not successful or no data');
          }
        } else {
          console.log('❌ Featured items request failed:', featuredResponse.status);
        }

        // Last resort: Fetch all available items without any filters
        console.log('🚨 Last resort: fetching all available items');
        const allItemsResponse = await fetch(`${API_CONFIG.API_URL}/items`, {
          headers: authHeaders()
        });
        
        console.log('📦 All items response status:', allItemsResponse.status);
        if (allItemsResponse.ok) {
          const allItemsData = await allItemsResponse.json();
          console.log('📦 All items response:', JSON.stringify(allItemsData, null, 2));
          
          if (allItemsData.success && allItemsData.data.length > 0) {
            // Filter only available items and sort by rating
            const availableItems = allItemsData.data.filter(item => item.isAvailable !== false);
            const sortedItems = availableItems
              .sort((a, b) => {
                const ratingA = a.ratings?.average || a.rating || 0;
                const ratingB = b.ratings?.average || b.rating || 0;
                return ratingB - ratingA;
              })
              .slice(0, 20); // Top 20 items
            
            console.log('✅ Found', sortedItems.length, 'available items as last resort');
            setTrendingItems(sortedItems);
          } else {
            console.log('❌ All items response not successful or no data');
          }
        } else {
          console.log('❌ All items request failed:', allItemsResponse.status);
        }
      } catch (error) {
        console.error('❌ Error fetching trending items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, []);

  const getFilteredAndSortedItems = () => {
    let filtered = [...trendingItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = a.ratings?.average || a.rating || 0;
          const ratingB = b.ratings?.average || b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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
        <YHKLoader message="Loading trending items..." />
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
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        minHeight: '100vh'
      }}>
        {/* Hero Section */}
        <section className="trending-hero" style={{
          backgroundImage: `linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(245, 158, 11, 0.8)), url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <div className="trending-hero-content">
            <h1>🔥 Trending Items</h1>
            <p>Discover what's hot and popular right now!</p>
            <div className="trending-stats">
              <div className="stat-item">
                <span className="stat-number">{trendingItems.length}</span>
                <span className="stat-label">Trending Items</span>
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
                <option value="popularity">🔥 Popularity</option>
                <option value="rating">⭐ Rating</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="name">📝 Name</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search trending items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Trending Items Grid */}
        <main className="trending-content">
          {filteredItems.length === 0 ? (
            <div className="no-trending-items">
              <i className="fas fa-fire"></i>
              <h3>No trending items found</h3>
              <p>Check back later for the latest popular items!</p>
            </div>
          ) : (
            <div className="trending-items-grid">
              {filteredItems.map((item, index) => {
                const itemImage =
                  item.images?.[0]?.url ||
                  item.image ||
                  `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(item.name)}`;
                
                const trendingKey = item._id
                  ? `trending-${item._id}`
                  : `trending-${index}-${(item.name || '').replace(/\s+/g, '-').substring(0, 30)}`;

                return (
                  <div
                    key={trendingKey}
                    className="trending-item-card clickable"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="trending-item-image">
                      <img src={itemImage} alt={item.name} loading="lazy" />
                      
                      {/* Trending badges */}
                      <div className="trending-badges">
                        {item.isPopular && (
                          <div className="trending-badge popular">🔥 Popular</div>
                        )}
                        {item.isFeatured && (
                          <div className="trending-badge featured">⭐ Featured</div>
                        )}
                        {item.discountPrice && (
                          <div className="trending-badge discount">
                            {Math.round((1 - item.discountPrice / item.price) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Trending rank */}
                      <div className="trending-rank">
                        #{index + 1}
                      </div>
                    </div>

                    <div className="trending-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.description || 'A delicious trending item'}</p>

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

                      {/* Sold count and revenue */}
                      <div className="trending-stats-row">
                        <div className="trending-orders">
                          <i className="fas fa-shopping-bag"></i>
                          <span>{item.orders || item.soldCount || 0} orders</span>
                        </div>
                        <div className="trending-revenue">
                          <i className="fas fa-rupee-sign"></i>
                          <span>₹{Math.round(item.revenue || item.totalRevenue || 0).toLocaleString()} revenue</span>
                        </div>
                      </div>

                      <div className="trending-item-pricing">
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

export default Trending;