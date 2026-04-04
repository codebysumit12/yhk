import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import CartSidebar from './CartSidebar';
import CartNotification from './CartNotification';
import YHKLoader from './Yhkloader';
import './ItemDetailPage.css';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Use simple item endpoint that doesn't modify existing logic
        const response = await fetch(`${API_CONFIG.API_URL}/simple-item/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setItem(data.data);
        } else {
          console.error('Failed to fetch item:', data.message);
          navigate('/menu');
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem = {
      _id: item._id,
      id: item._id,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image || item.images?.[0]?.url,
      quantity: quantity,
      size: selectedSize,
      category: item.category?.name || 'Uncategorized',
      description: item.description
    };

    const existingItemIndex = cart.findIndex(
      cartItem => cartItem._id === item._id && cartItem.size === selectedSize
    );

    let updatedCart;
    if (existingItemIndex >= 0) {
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
    } else {
      updatedCart = [...cart, cartItem];
    }

    setCart(updatedCart);
    setAddedItemName(`${item.name} (${selectedSize})`);
    setShowNotification(true);
  };

  const handleViewCart = () => {
    setShowNotification(false);
    setIsCartOpen(true);
  };

  const calculateTotalPrice = () => {
    const basePrice = item.discountPrice || item.price;
    const sizeMultiplier = {
      small: 0.8,
      medium: 1,
      large: 1.2
    };
    return (basePrice * sizeMultiplier[selectedSize] * quantity).toFixed(2);
  };

  if (loading) {
    return <YHKLoader message="Loading item details..." />;
  }

  if (!item) {
    return (
      <div className="item-not-found">
        <div className="not-found-content">
          <h2>Item Not Found</h2>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/menu')} className="back-to-menu-btn">
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CartNotification
        show={showNotification}
        itemName={addedItemName}
        onViewCart={handleViewCart}
        onClose={() => setShowNotification(false)}
      />

      <div className="item-detail-page">
        <div className="item-detail-container">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            ← Back
          </button>

          <div className="item-detail-content">
            {/* Item Image */}
            <div className="item-image-section">
              <div className="item-main-image">
                {item.image || item.images?.[0]?.url ? (
                  <img 
                    src={item.image || item.images?.[0]?.url} 
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="item-image-placeholder">
                    🍽️
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              {item.images && item.images.length > 1 && (
                <div className="item-thumbnails">
                  {item.images.map((img, index) => (
                    <div key={index} className="thumbnail">
                      <img src={img.url} alt={`${item.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="item-details-section">
              <div className="item-header">
                <h1 className="item-name">{item.name}</h1>
                <div className="item-category">
                  <span className="category-badge">{item.category?.name}</span>
                </div>
              </div>

              <div className="item-description">
                <h3>Description</h3>
                <p>{item.description || 'Delicious food item prepared with care and quality ingredients.'}</p>
              </div>

              {/* Size Selection */}
              <div className="size-selection">
                <h3>Select Size</h3>
                <div className="size-options">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <span className="size-name">
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </span>
                      <span className="size-price">
                        ₹{((item.discountPrice || item.price) * (size === 'small' ? 0.8 : size === 'large' ? 1.2 : 1)).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="quantity-selection">
                <h3>Quantity</h3>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="item-purchase">
                <div className="item-price">
                  {item.discountPrice ? (
                    <>
                      <span className="original-price">₹{item.price}</span>
                      <span className="discounted-price">₹{item.discountPrice}</span>
                    </>
                  ) : (
                    <span className="price">₹{item.price}</span>
                  )}
                </div>
                
                <div className="total-price">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">₹{calculateTotalPrice()}</span>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                >
                  Add to Cart +
                </button>
              </div>

              {/* Item Details */}
              <div className="item-meta">
                {item.prepTime && (
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span className="meta-text">Prep time: {item.prepTime}</span>
                  </div>
                )}
                
                {item.avgRating && (
                  <div className="meta-item">
                    <span className="meta-icon">⭐</span>
                    <span className="meta-text">Rating: {item.avgRating}</span>
                  </div>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="item-tags">
                    <h3>Tags</h3>
                    <div className="tags-list">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </>
  );
};

export default ItemDetailPage;
