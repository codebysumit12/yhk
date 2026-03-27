import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import '../styles/AdminLayout.css';
import CustomersPage from '../pages/Customers';
import BannersPage from '../pages/BannersPage';
import CategoriesPage from '../pages/CategoriesPage';
import ItemsPage from '../pages/ItemsPage';
import OrdersPage from '../pages/OrdersPage';
import DeliveriesPage from '../pages/DeliveriesPage';
import DeliveryBoyApp from '../pages/DeliveryBoyApp';
import AdminDashboard from '../pages/AdminDashboard';
import OthersPage from '../pages/OthersPage';
import ReportsPage from '../pages/ReportsPage';
import ServicePricing from '../pages/ServicePricing';

// Map URL paths → header titles
const PATH_TITLES = {
  '/admin':            'Dashboard',
  '/admin/orders':     'Orders',
  '/admin/deliveries': 'Deliveries',
  '/admin/delivery-app': 'Delivery Boy App',
  '/admin/customers':  'Customers',
  '/admin/analytics':  'Reports',
  '/admin/pricing':   'Pricing',
  '/admin/settings':   'Settings',
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuMgmt, setIsMenuMgmt] = useState(false);
  const [activeSubNav, setActiveSubNav] = useState('Banners');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate] = useState('Tuesday, 24 February 2026');

  // Header title: Menu Management if open, otherwise derive from current URL
  const headerTitle = isMenuMgmt
    ? 'Menu Management'
    : (PATH_TITLES[location.pathname] || 'Dashboard');

  // Close Menu Management when user navigates via browser back/forward
  useEffect(() => {
    setIsMenuMgmt(false);
  }, [location.pathname]);

  const navItems = [
    { section: 'Main', items: [
      { name: 'Dashboard',       icon: '▦',  to: '/admin' },
      { name: 'Menu Management', icon: '🍕',  to: null },
      { name: 'Orders',          icon: '📋',  to: '/admin/orders' },
    ]},
    { section: 'Operations', items: [
      { name: 'Deliveries',  icon: '🛵', badge: '5',  badgeType: 'green',  to: '/admin/deliveries' },
      { name: 'Delivery App', icon: '📱', badge: null, to: '/admin/delivery-app' },
      { name: 'Customers',   icon: '👥', badge: '8',  badgeType: 'blue',   to: '/admin/customers' },
      { name: 'Promotions',  icon: '🏷️', badge: '3',  badgeType: 'orange', to: '/admin/promotions' },
    ]},
    { section: 'Analytics', items: [
      { name: 'Reports',  icon: '📊', to: '/admin/reports' },
      { name: 'Pricing', icon: '💰', to: '/admin/pricing' },
    ]},
  ];

  const handleNavClick = (itemName, to) => {
    if (itemName === 'Menu Management') {
      setIsMenuMgmt(true);
      setActiveSubNav('Banners');
    } else {
      setIsMenuMgmt(false);
      if (to) navigate(to);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">🍽️</div>
          <h1>Yashwanth's Healthy Kitchen</h1>
          <span>Restaurant Admin</span>
        </div>

        <nav>
          {navItems.map((section) => (
            <React.Fragment key={section.section}>
              <div className="nav-section">{section.section}</div>
              {section.items.map((item) =>
                item.to ? (
                  // URL-based nav items → NavLink
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      // De-activate NavLink highlight when Menu Management is open
                      `nav-item ${isActive && !isMenuMgmt ? 'active' : ''}`
                    }
                    onClick={() => handleNavClick(item.name, item.to)}
                  >
                    <span className="icon">{item.icon}</span>
                    {item.name}
                    {item.badge && (
                      <span className={`badge ${item.badgeType || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ) : (
                  // State-based nav items (Menu Management, Promotions, Ingredients)
                  <button
                    key={item.name}
                    className={`nav-item ${
                      item.name === 'Menu Management' && isMenuMgmt ? 'active' : ''
                    }`}
                    onClick={() => handleNavClick(item.name, item.to)}
                  >
                    <span className="icon">{item.icon}</span>
                    {item.name}
                    {item.badge && (
                      <span className={`badge ${item.badgeType || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">AM</div>
          <div className="user-info">
            <p>Admin Manager</p>
            <span>Super Admin</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h2>{headerTitle}</h2>
          <p>{currentDate}</p>
        </div>

        <div className="header-right">
          <form className="search-box" onSubmit={handleSearch}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search orders, items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <button className="icon-btn">
            🔔 <span className="dot"></span>
          </button>

          <button className="icon-btn">📩</button>

          <div className="avatar" style={{ cursor: 'pointer' }}>AM</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">

          {/* Routes only render when Menu Management is NOT active */}
          {!isMenuMgmt && (
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="orders"     element={<OrdersPage />} />
              <Route path="pricing"    element={<ServicePricing />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="delivery-app" element={<DeliveryBoyApp />} />
              <Route path="customers"  element={<CustomersPage />} />
               <Route path="promotions"   element={<div className="page-placeholder">⚙️ Promotions Page - Coming Soon</div>} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings"   element={<div className="page-placeholder">⚙️ Settings Page - Coming Soon</div>} />
              <Route path="*"          element={<Navigate to="/admin" replace />} />
            </Routes>
          )}

          {/* Menu Management fully replaces Routes when active */}
          {isMenuMgmt && (
            <div className="menu-management">
              <div className="submenu">
                <button
                  className={`submenu-btn ${activeSubNav === 'Banners' ? 'active' : ''}`}
                  onClick={() => setActiveSubNav('Banners')}
                >
                  <span className="submenu-icon">🎨</span>
                  <span className="submenu-text">Banners</span>
                </button>
                <button
                  className={`submenu-btn ${activeSubNav === 'Categories' ? 'active' : ''}`}
                  onClick={() => setActiveSubNav('Categories')}
                >
                  <span className="submenu-icon">📁</span>
                  <span className="submenu-text">Categories</span>
                </button>
                <button
                  className={`submenu-btn ${activeSubNav === 'Items' ? 'active' : ''}`}
                  onClick={() => setActiveSubNav('Items')}
                >
                  <span className="submenu-icon">🍔</span>
                  <span className="submenu-text">Items</span>
                </button>
                <button
                  className={`submenu-btn ${activeSubNav === 'Others' ? 'active' : ''}`}
                  onClick={() => setActiveSubNav('Others')}
                >
                  <span className="submenu-icon">🥤</span>
                  <span className="submenu-text">Beverages & Desserts</span>
                </button>
              </div>

              <div className="submenu-content">
                {activeSubNav === 'Banners'     && <BannersPage />}
                {activeSubNav === 'Categories'  && <CategoriesPage />}
                {activeSubNav === 'Items'       && <ItemsPage />}
                {activeSubNav === 'Others' && <OthersPage />}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <span>© 2026 FeastOS Restaurant Admin Panel. All rights reserved.</span>
        <div className="footer-links">
          <button onClick={() => window.open('#', '_blank')}>Support</button>
          <button onClick={() => window.open('#', '_blank')}>Privacy</button>
          <button onClick={() => window.open('#', '_blank')}>Docs</button>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;