import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './customer-view/pages/Main';
import Menu from './customer-view/pages/Menu';
import Login from './customer-view/pages/Login';
import Signup from './customer-view/pages/Signup';
import RelatedItems from './customer-view/pages/RelatedItems';
import Checkoutpage from './customer-view/pages/Checkoutpage';
import AdminDashboard from './admin-view/pages/AdminDashboard';
import MenuManagement from './admin-view/pages/MenuManagement';
import IngredientsPage from './admin-view/pages/IngredientsPage';
import './App.css';

// Sample restaurant data
const sampleRestaurants = [
  {
    id: 1,
    name: "Yeswanth's Healthy Kitchen",
    cuisine: "Healthy, South Indian, North Indian",
    rating: 4.8,
    deliveryTime: "25-30",
    discount: "40% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/9/18737879/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  },
  {
    id: 2,
    name: "Spice Garden",
    cuisine: "Indian, Chinese",
    rating: 4.5,
    deliveryTime: "35-40",
    discount: "25% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/5/18737875/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  },
  {
    id: 3,
    name: "Biryani House",
    cuisine: "Biryani, Mughlai",
    rating: 4.6,
    deliveryTime: "30-35",
    discount: "30% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/7/18737877/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  },
  {
    id: 4,
    name: "Pizza Paradise",
    cuisine: "Pizza, Italian",
    rating: 4.4,
    deliveryTime: "20-25",
    discount: "20% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/3/18737873/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  },
  {
    id: 5,
    name: "Green Leaf",
    cuisine: "Salads, Healthy Food",
    rating: 4.7,
    deliveryTime: "20-30",
    discount: "35% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/1/18737871/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  },
  {
    id: 6,
    name: "Sea Food Corner",
    cuisine: "Sea Food, Indian",
    rating: 4.3,
    deliveryTime: "40-45",
    discount: "15% OFF",
    image: "https://b.zmtcdn.com/data/pictures/chains/2/18737872/0f0f1e1e4c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9.jpg"
  }
];

function App() {
  const [restaurants] = useState(sampleRestaurants);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main restaurants={restaurants} />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:categoryId" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/related" element={<RelatedItems />} />
          <Route path="/checkout" element={<Checkoutpage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/menu/:categoryId" element={<MenuManagement />} />
          <Route path="/admin/ingredients" element={<IngredientsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
