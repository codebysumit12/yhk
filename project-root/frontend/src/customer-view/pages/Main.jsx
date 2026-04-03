import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import HeroBannerVideo from '../components/HeroBannerVideo';
import { API_CONFIG } from '../../config/api';
import './Main.css';

const Main = ({ restaurants }) => {
  console.log('🚀 Main component mounted!');
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [heroBanner, setHeroBanner] = useState(null);
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const navigate = useNavigate();

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

  // Fetch hero banner on mount
  useEffect(() => {
    console.log('🚀 useEffect for fetching hero banner triggered!');
    const fetchHeroBanner = async () => {
      try {
        console.log('🚀 Starting to fetch hero banner...');
        const bannerRes = await fetch(`${API_CONFIG.API_URL}/banners?position=hero&isActive=true`);

        console.log('🚀 Banner response received:', bannerRes.ok);

        if (!bannerRes.ok) {
          throw new Error(`HTTP error! status: ${bannerRes.status}`);
        }

        const bannerData = await bannerRes.json();
        console.log('🚀 Hero Banner API Response Data:', bannerData);

        if (bannerData.success && bannerData.data.length > 0) {
          console.log('🚀 Setting hero banner:', bannerData.data[0]);
          setHeroBanner(bannerData.data[0]);
        }
      } catch (error) {
        console.error('Error fetching hero banner:', error);
      }
    };

    fetchHeroBanner();
  }, []);

  // FIX: handleFilterClick was missing entirely — called in JSX but never defined
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // FIX: handleCategoryClick was trapped inside useEffect before — moved here
  const handleCategoryClick = (category) => {
    navigate(`/app/menu/${category.slug}`);
  };

  // FIX: handleViewCart was also trapped inside useEffect before — moved here
  const handleViewCart = () => {
    setShowNotification(false);
    setIsCartOpen(true);
  };

  return (
    <React.Fragment>
      {/* Cart Notification */}
      <CartNotification
        show={showNotification}
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

            {/* Quick Links Section */}
          <div className="quick-links-section">
            <div className="quick-links">
              <Link to="/app/onlyveg?type=desserts" className="quick-link">
                <i className="fas fa-birthday-cake"></i> Birthday Party
              </Link>
              <Link to="/app/onlyveg?type=vegan" className="quick-link">
                <i className="fas fa-leaf"></i> Vegan
              </Link>
              <Link to="/app/onlyveg?type=veg" className="quick-link">
                <i className="fas fa-pizza-slice"></i> Veg
              </Link>
              <Link to="/app/onlyveg?type=non-veg" className="quick-link">
                <i className="fas fa-drumstick-bite"></i> Non-Veg
              </Link>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
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
              className={`filter-btn ${activeFilter === 'new' ? 'active' : ''}`}
              onClick={() => handleFilterClick('new')}
            >
              <i className="fas fa-plus"></i> New Arrivals
            </button>

            <button
              className={`filter-btn ${activeFilter === 'offer' ? 'active' : ''}`}
              onClick={() => handleFilterClick('offer')}
            >
              <i className="fas fa-tag"></i> Offers
            </button>
          </div>

          {/* Navigate to Menu Button */}
          <div className="menu-navigation">
            <Link to="/app/menu" className="menu-btn">
              <i className="fas fa-utensils"></i> View Full Menu
            </Link>
          </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section className="location-section">
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
                <p><strong>Hours:</strong></p>
                <p>Open daily: 11 AM - 11 PM</p>
              </div>
            </div>
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
          <p>2024 Yeswanth's Healthy Kitchen - All rights reserved</p>
        </div>
      </footer>

      {/* Floating Cart Button */}
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
