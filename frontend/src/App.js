import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import ItemDetailPage from './customer-view/pages/ItemDetailPage'; // NEW - Item detail page
import AdminLayout from './admin-view/layout/AdminLayout';
import DeliveryBoyApp from './admin-view/pages/DeliveryBoyApp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CheckoutProtectedRoute from './shared/components/ProtectedRoute/CheckoutProtectedRoute';
import './App.css';

const ProtectedRoute = ({ children, requiredRole, redirectToSignup = false }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const userStr = localStorage.getItem('user');
  const location = window.location.pathname;

  if (!token) {
    if (redirectToSignup && location === '/checkout') {
      // Store current path for redirect after signup
      localStorage.setItem('redirectAfterAuth', '/checkout');
      return <Navigate to="/auth?mode=signup" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (!userStr) {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    if (redirectToSignup && location === '/checkout') {
      localStorage.setItem('redirectAfterAuth', '/checkout');
      return <Navigate to="/auth?mode=signup" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (requiredRole) {
      if (requiredRole === 'admin' && (!user.isAdmin && user.role !== 'admin')) {
        return <Navigate to="/" replace />;
      }
      if (requiredRole === 'delivery' && user.role !== 'delivery_partner') {
        return <Navigate to="/" replace />;
      }
    }

    return children;
  } catch (error) {
    console.error('Invalid user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    return <Navigate to="/auth" replace />;
  }
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      if (user.isAdmin || user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user.role === 'delivery_partner') {
        return <Navigate to="/delivery-app" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
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

          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/delivery-app" 
            element={
              <ProtectedRoute requiredRole="delivery">
                <DeliveryBoyApp />
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ Auth Routes */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          
          {/* Privacy & Terms - Public */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Customer Routes - Flat Structure (No /app prefix) */}
          <Route 
            path="/" 
            element={
              <CustomerLayout>
                <Main />
              </CustomerLayout>
            } 
          />
          
          <Route path="/menu/:categorySlug" element={
           
              <CustomerLayout>
                <Menu />
              </CustomerLayout>
          
          } />
          
          <Route path="/menu" element={
           
              <CustomerLayout>
                <Menu />
              </CustomerLayout>
          
          } />
          
          <Route path="/menucard" element={
            
              <CustomerLayout>
                <MenuCard />
              </CustomerLayout>
          
          } />
          
          <Route path="/onlyveg" element={
              <CustomerLayout>
                <OnlyVeg />
              </CustomerLayout>
          } />
          
          <Route path="/trending" element={
              <CustomerLayout>
                <Trending />
              </CustomerLayout>
          } />
          
          <Route path="/offers" element={
              <CustomerLayout>
                <Offers />
              </CustomerLayout>
          } />
          
          <Route 
            path="/checkout" 
            element={
              <CustomerLayout>
                <CheckoutProtectedRoute>
                  <Checkoutpage />
                </CheckoutProtectedRoute>
              </CustomerLayout>
            } 
          />
          
          <Route path="/track-order" element={
            <ProtectedRoute redirectToSignup={true}>
              <CustomerLayout>
                <TrackOrder />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-orders" element={
            <ProtectedRoute redirectToSignup={true}>
              <CustomerLayout>
                <MyOrders />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute redirectToSignup={true}>
              <CustomerLayout>
                <MyProfile />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/item/:id" element={
           
              <CustomerLayout>
                <ItemDetailPage />
              </CustomerLayout>
            
          } />
          
          {/* ✅ Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
