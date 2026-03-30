import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from './Nav';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import HeroBannerVideo from '../components/HeroBannerVideo';
import { API_CONFIG } from '../../config/api';
import './Main.css';

const Main = ({ restaurants }) => {

  const [activeFilter, setActiveFilter] = useState('all');

  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants || []);

  const [heroBanner, setHeroBanner] = useState(null);
  const [heroVideoError, setHeroVideoError] = useState(false);

  const [categories, setCategories] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state - shared with Nav component

  const [cart, setCart] = useState(() => {

    const savedCart = localStorage.getItem('cart');

    return savedCart ? JSON.parse(savedCart) : [];

  });

  // Cart notification state

  const [showNotification, setShowNotification] = useState(false);

  const [addedItemName, setAddedItemName] = useState('');

  const navigate = useNavigate();

  // Auth check - redirect to /auth if not logged in

  useEffect(() => {

    const token = localStorage.getItem('token') || localStorage.getItem('userToken');

    if (!token) {

      navigate('/auth');

    }

  }, [navigate]);

  // Sync cart with localStorage

  useEffect(() => {

    localStorage.setItem('cart', JSON.stringify(cart));

    window.dispatchEvent(new Event('storage'));

  }, [cart]);

  // Listen for storage events from other tabs/components

  useEffect(() => {

    const handleStorageChange = () => {

      const savedCart = localStorage.getItem('cart');

      if (savedCart) {

        setCart(JSON.parse(savedCart));

      }

    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  useEffect(() => {

    // Filter logic can be added here if needed

  }, [restaurants]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [bannerRes, catRes] = await Promise.all([
          fetch(`${API_CONFIG.API_URL}/banners?position=hero&isActive=true`),
          fetch(`${API_CONFIG.API_URL}/categories?isActive=true`),
        ]);
        
        if (!bannerRes.ok) {
          throw new Error(`HTTP error! status: ${bannerRes.status}`);
        }
        if (!catRes.ok) {
          throw new Error(`HTTP error! status: ${catRes.status}`);
        }
        
        const bannerData = await bannerRes.json();
        const catData = await catRes.json();
        
        if (bannerData.success && bannerData.data.length > 0) {
          setHeroBanner(bannerData.data[0]);
        }
        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (error) {
        console.error('Error fetching main data:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleFilterClick = (filter) => {

    setActiveFilter(filter);

    

    if (!restaurants || !Array.isArray(restaurants)) {

      setFilteredRestaurants([]);

      return;

    }

    

    let filtered = [...restaurants];

    

    switch(filter) {

      case 'rating':

        filtered = restaurants.filter(r => r.rating >= 4.5);

        break;

      case 'fast':

        filtered = restaurants.filter(r => parseInt(r.deliveryTime) <= 30);

        break;

      case 'offer':

        filtered = restaurants.filter(r => parseInt(r.discount) >= 40);

        break;

      default:

        filtered = restaurants;

    }

    

    setFilteredRestaurants(filtered);

  };



  const handleCategoryClick = (category) => {

    navigate(`/menu/${category.slug}`);

  };



  // ✅ NEW: Handle viewing cart from notification

  const handleViewCart = () => {

    setShowNotification(false);

    setIsCartOpen(true);

  };



  return (

    <React.Fragment>

      {/* Navigation */}

      <Nav onOpenCart={() => setIsCartOpen(true)} cartCount={cart.reduce((total, item) => total + (item.quantity || 1), 0)} />



      {/* ✅ Cart Notification */}

      <CartNotification

        show={showNotification}

        itemName={addedItemName}

        onViewCart={handleViewCart}

        onClose={() => setShowNotification(false)}

      />



      {/* Hero Section */}

      {heroBanner && heroBanner.mediaType === 'video' && !heroVideoError ? (
        <HeroBannerVideo 
          heroBanner={heroBanner} 
          onError={() => setHeroVideoError(true)}
        />
      ) : (
        <section className="hero" style={{
          backgroundImage: heroBanner ? 
            `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${heroBanner.mediaUrl}')` :

            `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')`,

          backgroundSize: 'cover',

          backgroundPosition: 'center',

          backgroundRepeat: 'no-repeat'

        }}>

          <div className="hero-content">

            <h1>Yeswanth's Healthy Kitchen</h1>

            <div className="hero-links">

              <div className="quick-links">

                <Link to="/menu" className="quick-link">

                  <i className="fas fa-birthday-cake"></i> Birthday Party

                </Link>

                <Link to="/menu" className="quick-link">

                  <i className="fas fa-leaf"></i> Healthy Food

                </Link>

                <Link to="/menu" className="quick-link">

                  <i className="fas fa-pizza-slice"></i> Veg

                </Link>

                <Link to="/menu" className="quick-link">

                  <i className="fas fa-drumstick-bite"></i> Non-Veg

                </Link>

              </div>

            </div>

          </div>

        </section>

      )}



      {/* Main Content */}

      <main className="main-content">

        {/* Filters */}

        <div className="filters">

          <button 

            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 

            onClick={() => handleFilterClick('all')}

          >

            <i className="fas fa-border-all"></i> All

          </button>

          <button 

            className={`filter-btn ${activeFilter === 'rating' ? 'active' : ''}`} 

            onClick={() => handleFilterClick('rating')}

          >

            <i className="fas fa-star"></i> Top Rated

          </button>

          <button 

            className={`filter-btn ${activeFilter === 'fast' ? 'active' : ''}`} 

            onClick={() => handleFilterClick('fast')}

          >

            <i className="fas fa-bolt"></i> Fast Delivery

          </button>

          <button 

            className={`filter-btn ${activeFilter === 'offer' ? 'active' : ''}`} 

            onClick={() => handleFilterClick('offer')}

          >

            <i className="fas fa-tag"></i> Offers

          </button>

        </div>



        {/* Categories */}

        <div className="categories">
          {categories.length === 0 ? (
            <YHKLoader message="Loading menu categories..." />
          ) : (
            <div className="restaurant-grid">
              {categories.map((category, index) => (
                <div 
                  key={`${category._id || category.slug || 'category'}-${index}`} 
                  className="restaurant-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="restaurant-image">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} />
                    ) : (
                      <div 
                        className="category-icon-placeholder" 
                        style={{ 
                          background: (category.color || '#22c55e') + '20', 
                          color: category.color || '#22c55e' 
                        }}
                      >
                        <span className="category-icon">{category.icon || '🍽️'}</span>
                      </div>
                    )}
                    {category.avgDiscount > 0 && (
                      <div className="discount-badge">{category.avgDiscount}% OFF</div>
                    )}
                  </div>
                  
                  <div className="restaurant-info">
                    <div className="restaurant-name">{category.name}</div>
                    <div className="restaurant-cuisine">
                      {category.description || 'Delicious food options'}
                    </div>
                    <div className="restaurant-details">
                      <span className="rating">★ {category.avgRating || '4.5'}</span>
                      <span className="delivery-time">🍽️ {category.itemCount || 0} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>



      {/* Location Section */}

      <section className="location-section">

        <h2 className="section-title">Find Us Here</h2>

        <div className="location-container">

          <div className="location-map">

            <iframe 

              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.45678912345!2d81.804!3d16.98!2m3!1f0!2f0!3f0!2m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDU4JzUwLjAiTiA4McKwNDgnMjAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"

              width="100%" 

              height="400" 

              style={{ border: 0 }} 

              allowFullScreen="" 

              loading="lazy" 

              referrerPolicy="no-referrer-when-downgrade"

              title="Restaurant Location"

            />

          </div>

          <div className="location-info">

            <h3>Yeswanth's Healthy Kitchen - Food Delivery</h3>

            <div className="address-detail">

              <i className="fas fa-map-marker-alt"></i>

              <div>

                <p><strong>Address:</strong></p>

                <p>46-7-26/1, Danavaipeta</p>

                <p>Above Meg Unisex Lounge</p>

                <p>Rajahmundry - 533101</p>

              </div>

            </div>

            <div className="address-detail">

              <i className="fas fa-phone-alt"></i>

              <div>

                <p><strong>Contact:</strong></p>

                <p>Order now: +91 98765 43210</p>

              </div>

            </div>

            <div className="address-detail">

              <i className="fas fa-clock"></i>

              <div>

                <p><strong>Delivery Hours:</strong></p>

                <p>8:00 AM - 10:00 PM</p>

              </div>

            </div>

            <a 

              href="https://www.google.com/maps/dir//Yeswanth's+Healthy+Kitchen,+Rajahmundry" 

              target="_blank" 

              rel="noopener noreferrer" 

              className="directions-btn"

            >

              <i className="fas fa-directions"></i> Get Directions

            </a>

          </div>

        </div>

      </section>



      {/* Footer */}

      <footer className="footer">

        <div className="footer-content">

          <div className="footer-section">

            <h4>Yeswanth's Healthy Kitchen - Food Ordering Platform</h4>

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

              <li><Link to="/privacy-policy">Privacy Policy</Link></li>

              <li><Link to="/terms">Terms of Service</Link></li>

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

          <p>Yeswanth's Healthy Kitchen is a comprehensive food ordering and delivery platform that connects customers with local restaurants, providing a seamless dining experience with online ordering, real-time tracking, and secure payments.</p>

          <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.</p>

          2024 Yeswanth's Healthy Kitchen - All rights reserved

        </div>

      </footer>



      {/* ✅ Floating Cart Button */}

      {cart.length > 0 && (

        <button 

          className="floating-cart"

          onClick={() => setIsCartOpen(true)}

        >

          <i className="fas fa-shopping-cart"></i>

          <span className="cart-count-badge">

            {cart.reduce((total, item) => total + (item.quantity || 1), 0)}

          </span>

        </button>

      )}



      {/* Cart Sidebar */}

      <CartSidebar 

        isOpen={isCartOpen} 

        onClose={() => setIsCartOpen(false)} 

        cart={cart}

      />

    </React.Fragment>

  );

};



export default Main;