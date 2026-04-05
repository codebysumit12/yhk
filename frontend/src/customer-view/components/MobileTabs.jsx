import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileTabs.css';

const MobileTabs = () => {
  const [activeTab, setActiveTab] = useState('home');
  const tabsRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    { id: 'home', label: 'Home', route: '/' },
    { id: 'menu', label: 'Menu', route: '/menucard' },
    { id: 'trending', label: 'Trending', route: '/trending' },
    { id: 'offers', label: 'Offers', route: '/offers' },
    { id: 'drinks', label: 'Drinks', route: '/onlyveg?type=drinks' },
    { id: 'smoothies', label: 'Smoothies', route: '/onlyveg?type=smoothies' },
    { id: 'desserts', label: 'Desserts', route: '/onlyveg?type=desserts' }
  ];

  const handleTabClick = (category) => {
    setActiveTab(category.id);
    console.log(`Navigating to: ${category.route}`);
    navigate(category.route);
  };

  // Handle scroll wheel for horizontal scrolling
  useEffect(() => {
    const tabsContainer = tabsRef.current;
    if (!tabsContainer) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabsContainer.scrollLeft += e.deltaY;
      }
    };

    tabsContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      tabsContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="mobile-tabs-container">
      <div className="mobile-tabs" ref={tabsRef}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`mobile-tab ${activeTab === category.id ? 'active' : ''}`}
            onClick={() => handleTabClick(category)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileTabs;
