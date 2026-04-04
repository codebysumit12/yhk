import React, { useState, useEffect } from 'react';
import Nav from '../pages/Nav';
import CartSidebar from '../pages/CartSidebar';

const CustomerLayout = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      <Nav 
        onOpenCart={handleOpenCart} 
        cart={cart} 
        showCart={isCartOpen} 
        setShowCart={setIsCartOpen} 
      />
      {children}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </>
  );
};

export default CustomerLayout;

