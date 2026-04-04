import React from 'react';
import Nav from '../pages/Nav';

const CustomerLayout = ({ children }) => {
  return (
    <>
      <Nav onOpenCart={() => {}} />
      {children}
    </>
  );
};

export default CustomerLayout;

