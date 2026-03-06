import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Nav from './Nav';
import './Menu.css';

const API_URL = 'http://localhost:5001/api';

const RelatedItems = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = searchParams.get('id');
  const restaurantName = searchParams.get('name') || 'Related Items';
  
  const [relatedItems, setRelatedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isCategoryView, setIsCategoryView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a category view (category IDs are MongoDB ObjectId strings)
    const isCategory = restaurantId && restaurantId.length === 24; // MongoDB ObjectId length
    setIsCategoryView(isCategory);
    
    if (isCategory) {
      // Fetch items from backend for this category
      fetchItemsByCategory(restaurantId);
    } else {
      // Fetch all items for restaurant view
      fetchAllItems();
    }
  }, [restaurantId]);

  const fetchItemsByCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/items?category=${categoryId}&isAvailable=true`);
      const data = await response.json();
      if (data.success) {
        setRelatedItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items?isAvailable=true`);
      const data = await response.json();
      if (data.success) {
        setRelatedItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (value) => {
    setSortBy(value);
    // Sort items based on selected criteria
    let sorted = [...relatedItems];
    switch(value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      default:
        // Keep original order for popular
        break;
    }
    setRelatedItems(sorted);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    // Filter items by category if needed
    if (category === 'all') {
      // Reset to all items
      if (isCategoryView) {
        fetchItemsByCategory(restaurantId);
      } else {
        fetchAllItems();
      }
    } else {
      // Filter by category logic here if needed
      const filtered = relatedItems.filter(item => item.type === category);
      setRelatedItems(filtered);
    }
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleItemClick = (item) => {
    // Navigate to recipe details if recipe details exist
    if (item.recipeDetails) {
      navigate(`/recipe?id=${item.id}&name=${encodeURIComponent(item.name)}`);
    } else {
      // Show item details modal or navigate to related page
      navigate(`/related?id=${item.id}&name=${encodeURIComponent(item.name)}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <Nav />

      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-hero-content">
          <h1>{restaurantName}</h1>
          <p>Discover delicious items from our collection</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="related-container">
        {/* Filters Bar */}
        <div className="related-filters" style={{
          background: 'red',
          border: '2px solid blue',
          padding: '20px',
          borderRadius: '8px',
          position: 'relative',
          zIndex: '1000'
        }}>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => handleSort(e.target.value)}>
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Discount %</option>
            </select>
          </div>
          <div style={{color: 'white', fontSize: '12px'}}>
            DEBUG: Filters should be visible here!
          </div>
        </div>

        {/* Items Grid */}
        <div className="menu-items-grid">
          {relatedItems.map(item => (
            <div className="menu-item-card" key={item.id}>
              <div className="menu-item-image">
                <img src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} />
                <div className="discount-badge">{item.discountPrice || item.discount}% OFF</div>
              </div>
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <div className="menu-item-action">
                  <div className="menu-item-price">₹{item.discountPrice || item.price}</div>
                  <button className="add-btn" onClick={() => handleAddToCart(item)}>
                    <i className="fas fa-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Yeswanth's Healthy Kitchen</h4>
            <ul>
              <li><Link to="">About Us</Link></li>
              <li><Link to="">Culture</Link></li>
              <li><Link to="">Blog</Link></li>
              <li><Link to="">Careers</Link></li>
              <li><Link to="">Financial Information</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Restaurants</h4>
            <ul>
              <li><Link to="">Partner With Us</Link></li>
              <li><Link to="">Apps For You</Link></li>
              <li><Link to="">Restaurant Owner</Link></li>
              <li><Link to="">Advertise</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Learn More</h4>
            <ul>
              <li><Link to="">Privacy</Link></li>
              <li><Link to="">Terms</Link></li>
              <li><Link to="">Security</Link></li>
              <li><Link to="">Sitemap</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Social Links</h4>
            <div className="social-links">
              <Link to=""><i className="fab fa-facebook"></i></Link>
              <Link to=""><i className="fab fa-instagram"></i></Link>
              <Link to=""><i className="fab fa-twitter"></i></Link>
              <Link to=""><i className="fab fa-youtube"></i></Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.</p>
          © 2024 Yeswanth's Healthy Kitchen - All rights reserved
        </div>
      </footer>
    </>
  );
};

export default RelatedItems;
