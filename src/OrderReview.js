import React from 'react';
import { formatNumber } from './utils/formatters';

const OrderReview = ({ cart, paymentMethod, billingDetails, onConfirm, darkMode, processing }) => {
  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: '💳',
      crypto: '₿',
      bank: '🏦',
      giftcard: '🎁',
      paypal: '🅿️',
      applepay: '📱'
    };
    return icons[method] || '💳';
  };

  const getPaymentMethodName = (method) => {
    const names = {
      card: 'Credit/Debit Card',
      crypto: 'Cryptocurrency',
      bank: 'Bank Transfer',
      giftcard: 'Gift Card',
      paypal: 'PayPal',
      applepay: 'Apple Pay'
    };
    return names[method] || method;
  };

  return (
    <div className={`order-review ${darkMode ? 'dark' : 'light'}`}>
      <h3 className="review-title">Order Review</h3>

      <div className="review-sections">
        <div className="review-section">
          <h4>Items</h4>
          <div className="review-items">
            {cart.items.map((item, index) => (
              <div key={index} className="review-item">
                <span className="item-name">
                  {item.name || item.symbol} x{item.quantity}
                </span>
                <span className="item-price">${formatNumber(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-section">
          <h4>Payment Method</h4>
          <div className="payment-method-display">
            <span className="method-icon">{getPaymentMethodIcon(paymentMethod)}</span>
            <span className="method-name">{getPaymentMethodName(paymentMethod)}</span>
          </div>
        </div>

        <div className="review-section">
          <h4>Billing Address</h4>
          <div className="billing-address">
            <p>{billingDetails.fullName}</p>
            <p>{billingDetails.address}</p>
            <p>
              {billingDetails.city}, {billingDetails.country} {billingDetails.zipCode}
            </p>
            <p>{billingDetails.email}</p>
            <p>{billingDetails.phone}</p>
          </div>
        </div>

        <div className="review-section summary">
          <h4>Order Summary</h4>
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${formatNumber(cart.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Fees:</span>
              <span>${formatNumber(cart.fees)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-${formatNumber(cart.discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Tax:</span>
              <span>${formatNumber(cart.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span className="total-amount">${formatNumber(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="terms-agreement">
        <label className="checkbox-label">
          <input type="checkbox" required />
          <span>
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </span>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" required />
          <span>I confirm that the information provided is correct</span>
        </label>
      </div>

      <button
        onClick={onConfirm}
        disabled={processing}
        className={`confirm-order-btn ${processing ? 'processing' : ''}`}
      >
        {processing ? (
          <>
            <span className="spinner"></span>
            Processing Payment...
          </>
        ) : (
          `Confirm & Pay $${formatNumber(cart.total)}`
        )}
      </button>
    </div>
  );
};

export default OrderReview;