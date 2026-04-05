import React, { useState, useRef, useEffect } from 'react';
import './MobileTabs.css';

const MobileTabs = () => {
  const [activeTab, setActiveTab] = useState('home');
  const tabsRef = useRef(null);

  const categories = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'trending', label: 'Trending' },
    { id: 'offers', label: 'Offers' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'smoothies', label: 'Smoothies' },
    { id: 'desserts', label: 'Desserts' }
  ];

  const handleTabClick = (categoryId) => {
    setActiveTab(categoryId);
    
    // Scroll to section if it exists
    const section = document.getElementById(categoryId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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
            onClick={() => handleTabClick(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileTabs;
