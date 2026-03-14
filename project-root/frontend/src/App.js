import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Main from './customer-view/pages/Main';
import Menu from './customer-view/pages/Menu';
import Checkoutpage from './customer-view/pages/Checkoutpage';
import TrackOrder from './customer-view/pages/TrackMyOrder';
import MyOrders from './customer-view/pages/MyOrders';
import MyProfile from './customer-view/pages/MyProfile';
import AdminLayout from './admin-view/layout/AdminLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('userToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth route - landing page */}
          <Route path="/" element={<Auth />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<Main />} />
          <Route path="/menu/:categorySlug" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkoutpage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          
          {/* Customer Routes */}
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
          <Route path="/admin/*" element={<AdminLayout />} />
          
          {/* Privacy Policy Route */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Terms of Service Route */}
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
