import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../pages/Nav';

const CustomerLayout = () => {
  return (
    <>
      <Nav onOpenCart={() => {}} />
      <Outlet />
    </>
  );
};

export default CustomerLayout;

