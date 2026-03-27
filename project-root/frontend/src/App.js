import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Main from './customer-view/pages/Main';
import Menu from './customer-view/pages/Menu';
import MenuCard from './customer-view/pages/MenuCard';
import Drinks from './customer-view/pages/Drinks';
import Smoothies from './customer-view/pages/Smoothies';
import Desserts from './customer-view/pages/Desserts';
import Checkoutpage from './customer-view/pages/Checkoutpage';
import TrackOrder from './customer-view/pages/TrackMyOrder';
import MyOrders from './customer-view/pages/MyOrders';
import MyProfile from './customer-view/pages/MyProfile';
import AdminLayout from './admin-view/layout/AdminLayout';
import DeliveryBoyApp from './admin-view/pages/DeliveryBoyApp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔍 ProtectedRoute DEBUG:');
  console.log('🔑 Token exists:', !!token);
  console.log('👤 User data:', user);
  console.log('🔑 Required role:', requiredRole);
  console.log('👤 User isAdmin:', user.isAdmin);
  console.log('👤 User role:', user.role);

  if (!token) {
    console.log('❌ No token found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'admin' && !user.isAdmin && user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to /');
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'delivery' && user.role !== 'delivery_partner') {
      console.log('❌ User is not delivery partner, redirecting to /');
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Authentication passed, rendering children');
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
          <Routes>

             
                {/* ✅ FIXED: Main landing page at / */}
                <Route path="/" element={<Main />} />
                  
                {/* ✅ FIXED: Auth at /auth */}
                <Route path="/auth" element={<Auth />} />
                  
                {/* Customer Routes */}
                <Route path="/menu/:categorySlug" element={<Menu />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/menucard" element={<MenuCard />} />
                <Route path="/drinks" element={<Drinks />} />
                <Route path="/smoothies" element={<Smoothies />} />
                <Route path="/desserts" element={<Desserts />} />
                <Route path="/checkout" element={<Checkoutpage />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/my-orders" element={<MyOrders />} />
                  
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <MyProfile />
                    </ProtectedRoute>
                  } 
                />
                  
                {/* Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  } 
                />
                  
                {/* Delivery Partner Direct Access */}
                <Route 
                  path="/delivery-app" 
                  element={
                    <ProtectedRoute requiredRole="delivery">
                      <DeliveryBoyApp />
                    </ProtectedRoute>
                  } 
                />
                  
                {/* ✅ FIXED: Privacy Policy & Terms */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                  
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;