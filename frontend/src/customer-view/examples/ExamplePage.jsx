import React from 'react';
import MobileTabs from '../components/MobileTabs';

const ExamplePage = () => {
  return (
    <div className="page">
      {/* Your existing header/navbar */}
      <header className="header">
        {/* Your navigation content */}
      </header>

      {/* Mobile Tabs - Only visible on mobile screens */}
      <MobileTabs />

      {/* Page Content with section IDs for scroll navigation */}
      <main className="page-content">
        <section id="home" className="content-section">
          <h2>Home</h2>
          <p>Welcome to our restaurant! Browse our delicious menu items.</p>
        </section>

        <section id="menu" className="content-section">
          <h2>Menu</h2>
          <p>Explore our complete menu with all categories.</p>
        </section>

        <section id="trending" className="content-section">
          <h2>Trending</h2>
          <p>Most popular items right now!</p>
        </section>

        <section id="offers" className="content-section">
          <h2>Offers</h2>
          <p>Special deals and promotions available today.</p>
        </section>

        <section id="drinks" className="content-section">
          <h2>Drinks</h2>
          <p>Refresh your meal with our selection of beverages.</p>
        </section>

        <section id="smoothies" className="content-section">
          <h2>Smoothies</h2>
          <p>Healthy and delicious smoothie options.</p>
        </section>

        <section id="desserts" className="content-section">
          <h2>Desserts</h2>
          <p>Sweet treats to complete your meal.</p>
        </section>
      </main>
    </div>
  );
};

export default ExamplePage;
