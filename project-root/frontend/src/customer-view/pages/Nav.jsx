import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

const Nav = ({ onOpenCart, cart, showCart, setShowCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setIsMobileMenuOpen(false); // Close mobile menu when opening profile
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDropdownClick = (path) => {
    setShowProfileDropdown(false);
    closeMobileMenu();
    if (path === '/cart') {
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

  // ✅ Helper function to check if link is active
  const isActive = (path) => {
    if (path === '/customer') {
      return location.pathname === '/customer' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">
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
                className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                ref={mobileMenuRef}
              >
                <span></span>
                <span></span>
                <span></span>
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
                        onClick={() => handleDropdownClick('/track-order')}
                      >
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Track My Order</span>
                      </button>

                      <button 
                        className="dropdown-item"
                        onClick={() => handleDropdownClick('/my-orders')}
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
                        onClick={() => handleDropdownClick('/profile')}
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
        
        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/customer" className={isActive('/customer') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/menucard" className={isActive('/menucard') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-utensils"></i> Menu
          </Link>
          <Link to="/trending" className={isActive('/trending') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-fire"></i> Trending
          </Link>
          <Link to="/offers" className={isActive('/offers') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-percent"></i> Offers
          </Link>
          <Link to="/onlyveg?type=drinks" className={isActive('/onlyveg?type=drinks') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-mug-hot"></i> Drinks
          </Link>
          <Link to="/onlyveg?type=smoothies" className={isActive('/onlyveg?type=smoothies') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-blender"></i> Smoothies
          </Link>
          <Link to="/onlyveg?type=desserts" className={isActive('/onlyveg?type=desserts') ? 'active' : ''} onClick={closeMobileMenu}>
            <i className="fas fa-birthday-cake"></i> Desserts
          </Link>
        </nav>

        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-backdrop" 
            onClick={closeMobileMenu}
          />
        )}
      </header>
    </>
  );
};

export default Nav;