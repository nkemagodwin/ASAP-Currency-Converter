import React from 'react';
import { useCheckout } from './CheckoutContext';
import { formatNumber } from './utils/formatters';

const ShoppingCart = ({ darkMode, onCheckout }) => {
  const { state, removeFromCart, updateQuantity, applyPromoCode } = useCheckout();
  const [promoCode, setPromoCode] = React.useState('');
  const [promoMessage, setPromoMessage] = React.useState({ type: '', message: '' });
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    const result = await applyPromoCode(promoCode);
    setIsApplyingPromo(false);
    
    if (result.success) {
      setPromoMessage({ type: 'success', message: `Promo applied! ${result.discount}% off` });
      setPromoCode('');
    } else {
      setPromoMessage({ type: 'error', message: result.message });
    }
    
    setTimeout(() => setPromoMessage({ type: '', message: '' }), 3000);
  };

  const getItemIcon = (item) => {
    switch(item.type) {
      case 'forex': return '💱';
      case 'gold': return '🥇';
      case 'crypto': return '₿';
      case 'giftcard': return '🎁';
      default: return '📦';
    }
  };

  if (state.cart.items.length === 0) {
    return (
      <div className={`shopping-cart empty ${darkMode ? 'dark' : 'light'}`}>
        <div className="cart-empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items from the trading panels to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`shopping-cart ${darkMode ? 'dark' : 'light'}`}>
      <div className="cart-header">
        <h2 className="cart-title">
          🛒 Shopping Cart
          <span className="cart-item-count">{state.cart.items.length} items</span>
        </h2>
      </div>

      <div className="cart-items">
        {state.cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-icon">{getItemIcon(item)}</div>
            
            <div className="cart-item-details">
              <div className="cart-item-name">
                {item.name || item.symbol || item.id}
                {item.type === 'giftcard' && (
                  <span className="giftcard-badge">🎁 {item.amount} {item.currency}</span>
                )}
              </div>
              <div className="cart-item-meta">
                <span className="cart-item-price">${formatNumber(item.price)}</span>
                {item.type === 'giftcard' && item.discount > 0 && (
                  <span className="cart-item-discount">-{item.discount}% off</span>
                )}
              </div>
            </div>

            <div className="cart-item-quantity">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn minus"
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn plus"
              >
                +
              </button>
            </div>

            <div className="cart-item-total">
              ${formatNumber(item.price * item.quantity)}
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="cart-item-remove"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-promo">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="promo-input"
          disabled={isApplyingPromo}
        />
        <button
          onClick={handleApplyPromo}
          className="promo-apply-btn"
          disabled={!promoCode.trim() || isApplyingPromo}
        >
          {isApplyingPromo ? 'Applying...' : 'Apply'}
        </button>
        {promoMessage.message && (
          <div className={`promo-message ${promoMessage.type}`}>
            {promoMessage.message}
          </div>
        )}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${formatNumber(state.cart.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Fees:</span>
          <span>${formatNumber(state.cart.fees)}</span>
        </div>
        {state.cart.discount > 0 && (
          <div className="summary-row discount">
            <span>Discount:</span>
            <span>-${formatNumber(state.cart.discount)}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Tax (7%):</span>
          <span>${formatNumber(state.cart.tax)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span className="total-amount">${formatNumber(state.cart.total)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <button
          onClick={() => onCheckout()}
          className="checkout-btn"
          disabled={state.cart.items.length === 0}
        >
          Proceed to Checkout →
        </button>
        <button className="continue-shopping-btn" onClick={() => window.history.back()}>
          Continue Shopping
        </button>
      </div>

      <div className="secure-checkout-badge">
        <span>🔒 Secure Checkout</span>
        <span>✓ SSL Encrypted</span>
        <span>💳 100% Safe</span>
      </div>
    </div>
  );
};

export default ShoppingCart;