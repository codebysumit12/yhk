import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../pages/Nav';

const CustomerLayout = () => {
  const handleOpenCart = () => {
    // Placeholder - pages have their own cart sidebar
    console.log('Open cart from Nav');
  };

  return (
    <>
      <Nav onOpenCart={handleOpenCart} />
      <Outlet />
    </>
  );
};

export default CustomerLayout;

