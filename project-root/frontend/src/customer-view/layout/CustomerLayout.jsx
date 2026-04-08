import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../pages/Nav';

const CustomerLayout = () => {
  return (
    <>
      <Nav onOpenCart={() => {}} cart={[]} />
      <Outlet />
    </>
  );
};

export default CustomerLayout;

