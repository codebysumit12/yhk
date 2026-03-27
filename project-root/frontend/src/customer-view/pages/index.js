import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { default as Checkoutpage } from './Checkoutpage';
export { default as CartSidebar } from './CartSidebar';
export { default as Menu } from './Menu';
export { default as MyOrders } from './MyOrders';
export { default as TrackMyOrder } from './TrackMyOrder';
export { default as MyProfile } from './MyProfile';
export { default as Login } from './Login';
export { default as Signup } from './Signup';
export { default as Nav } from './Nav';
export { default as PhoneTest } from './PhoneTest';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);