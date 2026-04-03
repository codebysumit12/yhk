import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import CustomerLayout from './customer-view/layout/CustomerLayout';
import Main from './customer-view/pages/Main';
import Menu from './customer-view/pages/Menu';
import MenuCard from './customer-view/pages/MenuCard';
import OnlyVeg from './customer-view/pages/OnlyVeg';
import Trending from './customer-view/pages/Trending';
import Offers from './customer-view/pages/Offers';
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
  const userStr = localStorage.getItem('user');

  // No token → redirect to auth
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Has token but no user data → clear and redirect
  if (!userStr) {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Role-based access control
    if (requiredRole) {
      if (requiredRole === 'admin' && !user.isAdmin && user.role !== 'admin') {
        return <Navigate to="/app" replace />;
      }
      if (requiredRole === 'delivery' && user.role !== 'delivery_partner') {
        return <Navigate to="/app" replace />;
      }
    }

    return children;
  } catch (error) {
    // Invalid user data → clear and redirect
    console.error('Invalid user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    return <Navigate to="/auth" replace />;
  }
};

// Public Route - Redirect if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // Redirect based on role
      if (user.isAdmin || user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user.role === 'delivery_partner') {
        return <Navigate to="/delivery-app" replace />;
      } else {
        return <Navigate to="/app" replace />;
      }
    } catch (error) {
      // Invalid data, let them access auth
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Admin Routes - MUST come first */}
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
          
          {/* Auth Routes - Public (redirect if already logged in) */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          
          {/* Privacy Policy & Terms */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Customer Routes with Nav */}
          <Route path="/app" element={<CustomerLayout />}>
            {/* Main app page moved to /app */}
            <Route index element={<Main />} />
              
            {/* Customer Routes */}
            <Route path="menu/:categorySlug" element={<Menu />} />
            <Route path="menu" element={<Menu />} />
            <Route path="menucard" element={<MenuCard />} />
            <Route path="onlyveg" element={<OnlyVeg />} />
            <Route path="trending" element={<Trending />} />
            <Route path="offers" element={<Offers />} />
            <Route path="checkout" element={<Checkoutpage />} />
            <Route path="track-order" element={<TrackOrder />} />
            
            <Route path="my-orders" element={<MyOrders />} />
              
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;