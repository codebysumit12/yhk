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
import ItemDetailPage from './customer-view/pages/ItemDetailPage'; // NEW - Item detail page
import AdminLayout from './admin-view/layout/AdminLayout';
import DeliveryBoyApp from './admin-view/pages/DeliveryBoyApp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!userStr) {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (requiredRole) {
      if (requiredRole === 'admin' && !user.isAdmin && user.role !== 'admin') {
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
          
          {/* ✅ Privacy & Terms - Public */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* ✅ Customer Routes - Flat Structure (No /app prefix) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <CustomerLayout>
                  <Main />
                </CustomerLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route path="/menu/:categorySlug" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Menu />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/menu" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Menu />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/menucard" element={
            <ProtectedRoute>
              <CustomerLayout>
                <MenuCard />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/onlyveg" element={
            <ProtectedRoute>
              <CustomerLayout>
                <OnlyVeg />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/trending" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Trending />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/offers" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Offers />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CustomerLayout>
                <Checkoutpage />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/track-order" element={
            <ProtectedRoute>
              <CustomerLayout>
                <TrackOrder />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <CustomerLayout>
                <MyOrders />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <CustomerLayout>
                <MyProfile />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/item/:id" element={
            <ProtectedRoute>
              <CustomerLayout>
                <ItemDetailPage />
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          {/* ✅ Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
