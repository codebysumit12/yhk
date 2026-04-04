import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

const Nav = ({ onOpenCart, cart, showCart, setShowCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // Get cart count from localStorage or from prop
    updateCartCount();
  }, [cart]);

  // Update cart count
  const updateCartCount = () => {
    if (cart && Array.isArray(cart)) {
      setCartCount(cart.reduce((total, item) => total + (item.quantity || 1), 0));
    } else {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cartData.reduce((total, item) => total + (item.quantity || 1), 0));
    }
  };

  // Listen for storage changes (when cart is updated)
  useEffect(() => {
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [mobileMenuOpen]);

  // Pages where Nav should NOT render
  const noNavPages = ['/auth', '/register', '/admin', '/delivery-app'];
  
  // Don't render Nav on these pages (AFTER all hooks)
  if (noNavPages.some(page => location.pathname.startsWith(page))) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/auth');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleDropdownClick = (path) => {
    setShowProfileDropdown(false);
    if (path === '/cart') {
      // Handle cart opening specially
      if (onOpenCart) {
        onOpenCart();
      }
    } else if (path) {
      navigate(path);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
  };

  // Helper function to check if link is active
  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <Link to="/app" className="logo">
            <div className="logo-icon">
              <i className="fas fa-carrot"></i>
            </div>
            Yeswanth's Healthy Kitchen
          </Link>
          
          <div className="header-search">
            <div className="search-bar">
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Search for the best food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <button className="search-btn" onClick={handleSearch}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
☰
            </button>
            {user ? (
              <div className="profile-section" ref={dropdownRef}>

                <button 
                  className="profile-trigger" 
                  onClick={toggleProfileDropdown}
                >
                  <div className="profile-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span className="avatar-initials">{getUserInitials()}</span>
                    )}
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">{user.name}</span>
                    <i className={`fas fa-chevron-down dropdown-arrow ${showProfileDropdown ? 'rotate' : ''}`}></i>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <span className="avatar-initials-large">{getUserInitials()}</span>
                        )}
                      </div>
                      <div className="dropdown-user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <span className="user-role">{user.role === 'admin' ? '👑 Admin' : '🍽️ Foodie'}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => handleDropdownClick('/app/track-order')}
                      >
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Track My Order</span>
                      </button>

                      <button 
                        className="dropdown-item"
                        onClick={() => handleDropdownClick('/app/my-orders')}
                      >
                        <i className="fas fa-receipt"></i>
                        <span>My Orders</span>
                      </button>

                      <button 
                        className="dropdown-item cart-item"
                        onClick={() => handleDropdownClick('/cart')}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="cart-count-badge">{cartCount}</span>
                        )}
                      </button>

                      <button 
                        className="dropdown-item"
                        onClick={() => handleDropdownClick('/app/profile')}
                      >
                        <i className="fas fa-user-circle"></i>
                        <span>My Profile</span>
                      </button>

                      {user.role === 'admin' && (
                        <button 
                          className="dropdown-item admin-item"
                          onClick={() => handleDropdownClick('/admin')}
                        >
                          <i className="fas fa-crown"></i>
                          <span>Admin Panel</span>
                        </button>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-footer">
                      <button 
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="login-btn">
                <i className="fas fa-user"></i> Login / Sign Up
              </Link>
            )}
          </div>
        </div>
        
        <nav className="nav">
          <Link to="/app" className={isActive('/app') ? 'active' : ''}>
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/app/menucard" className={isActive('/app/menucard') ? 'active' : ''}>
            <i className="fas fa-utensils"></i> Menu
          </Link>
          <Link to="/app/trending" className={isActive('/app/trending') ? 'active' : ''}>
            <i className="fas fa-fire"></i> Trending
          </Link>
          <Link to="/app/offers" className={isActive('/app/offers') ? 'active' : ''}>
            <i className="fas fa-percent"></i> Offers
          </Link>
          <Link to="/app/onlyveg?type=drinks" className={isActive('/app/onlyveg?type=drinks') ? 'active' : ''}>
            <i className="fas fa-mug-hot"></i> Drinks
          </Link>
          <Link to="/app/onlyveg?type=smoothies" className={isActive('/app/onlyveg?type=smoothies') ? 'active' : ''}>
            <i className="fas fa-blender"></i> Smoothies
          </Link>
          <Link to="/app/onlyveg?type=desserts" className={isActive('/app/onlyveg?type=desserts') ? 'active' : ''}>
            <i className="fas fa-birthday-cake"></i> Desserts
          </Link>
        </nav>
      </header>
      
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <a href="/app" className="mobile-logo">
                  <i className="fas fa-carrot"></i>
                  Yeswanth's Healthy Kitchen
                </a>
                <button 
                  className="close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {/* No nav links in hamburger menu per request */}
              <div className="mobile-menu-actions">
                {user ? (
                  <button 
                    className="mobile-profile-btn"
                    onClick={() => { setMobileMenuOpen(false); handleDropdownClick('/app/profile'); }}
                  >
                    <i className="fas fa-user-circle"></i>
                    Profile
                  </button>
                ) : (
                  <Link to="/auth" className="mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fas fa-user"></i>
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
};


export default Nav;
