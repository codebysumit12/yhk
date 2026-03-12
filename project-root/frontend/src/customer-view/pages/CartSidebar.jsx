import React from 'react';
import './CartSidebar.css';

const CartSidebar = ({ 
  showCart, 
  setShowCart, 
  cart, 
  onRemoveFromCart, 
  onCheckout, 
  getCartTotal 
}) => {
  return (
    <>
      {/* Cart Sidebar */}
      <aside className={`cart-sidebar ${showCart ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button className="close-cart" onClick={() => setShowCart(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart"></i>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="cart-item">
                <div className="cart-item-info">
                  <h5>{item.name}</h5>
                  <span className="cart-item-price">₹{item.finalPrice || item.price}</span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveFromCart(item.cartId)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="total-amount">₹{getCartTotal()}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>Checkout</button>
          </div>
        )}
      </aside>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && (
        <button className="floating-cart" onClick={() => setShowCart(true)}>
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">{cart.length}</span>
        </button>
      )}
    </>
  );
};

export default CartSidebar;