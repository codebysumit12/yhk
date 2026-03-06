import React, { useState } from 'react';
import '../styles/AdminLayout.css';
import CustomersPage from '../pages/Customers';
import MenuManagement from '../pages/MenuManagement';
import BannersPage from '../pages/BannersPage';
import CategoriesPage from '../pages/Categories';
import ItemsPage from '../pages/ItemsPage';
import IngredientsPage from '../pages/IngredientsPage';

const AdminLayout = ({ children }) => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate] = useState('Tuesday, 24 February 2026');
  const [activeSubNav, setActiveSubNav] = useState(null);

  const navItems = [
    { section: 'Main', items: [
      { name: 'Dashboard', icon: '▦' },
      { name: 'Menu Management', icon: '🍕' },
      { name: 'Orders', icon: '📋' },
    ]},
    { section: 'Operations', items: [
      { name: 'Deliveries', icon: '🛵', badge: '5', badgeType: 'green' },
      { name: 'Customers', icon: '👥', badge: '8', badgeType: 'blue' },
      { name: 'Promotions', icon: '🏷️', badge: '3', badgeType: 'orange' },
      { name: 'Ingredients', icon: '🥬', badge: '12', badgeType: 'purple' }
    ]},
    { section: 'Analytics', items: [
      { name: 'Reports', icon: '📊' },
      { name: 'Settings', icon: '⚙️' },
    ]},
  ];

  const handleNavClick = (itemName) => {
    setActiveNav(itemName);
    // Add your navigation logic here
    console.log('Navigating to:', itemName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
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
          {navItems.map((section, idx) => (
            <React.Fragment key={section.section}>
              <div className="nav-section">{section.section}</div>
              {section.items.map((item) => (
                <button
                  key={item.name}
                  className={`nav-item ${activeNav === item.name ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.name}
                  {item.badge && (
                    <span className={`badge ${item.badgeType || ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="avatar">AM</div>
          <div className="user-info">
            <p>Admin Manager</p>
            <span>Super Admin</span>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h2>{activeNav}</h2>
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
        {activeNav === 'Dashboard' && children} 
        {activeNav === 'Customers' && <CustomersPage />} 
        {activeNav === 'Menu Management' && ( <div className="menu-management"> 
          {/* Submenu Options */} 
          <div className="submenu"> 
            <button onClick={() => setActiveSubNav('Banners')}>Banners</button>         
             <button onClick={() => setActiveSubNav('Categories')}>Categories</button>
              <button onClick={() => setActiveSubNav('Items')}>Items</button> 
              <button onClick={() => setActiveSubNav('Ingredients')}>Ingredients</button> 
              </div> {/* Render only when a submenu is selected */} 
              <div className="submenu-content"> 
                {activeSubNav === 'Banners' && <BannersPage />}
                 {activeSubNav === 'Categories' && <CategoriesPage />} 
                 {activeSubNav === 'Items' && <ItemsPage />}
                 {activeSubNav === 'Ingredients' && <IngredientsPage />}
                  </div> 
                  </div> )} 
                  </div> 
    </main>

      {/* Footer */}
      <footer className="admin-footer">
        <span>© 2026 FeastOS Restaurant Admin Panel. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">Support</a>
          <a href="#">Privacy</a>
          <a href="#">Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
