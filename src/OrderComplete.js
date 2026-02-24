import React from 'react';
import { formatNumber } from './utils/formatters';

const OrderComplete = ({ order, onContinue, darkMode }) => {
  return (
    <div className={`order-complete ${darkMode ? 'dark' : 'light'}`}>
      <div className="success-animation">
        <div className="checkmark-circle">
          <div className="checkmark"></div>
        </div>
      </div>

      <h2 className="success-title">Payment Successful!</h2>
      <p className="success-message">Thank you for your purchase</p>

      <div className="order-details">
        <div className="order-header">
          <span className="order-label">Order Number:</span>
          <span className="order-number">{order?.id || 'ORD-12345678'}</span>
        </div>

        <div className="order-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        <div className="order-items">
          <h4>Items Purchased</h4>
          {order?.items?.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <span className="item-icon">
                  {item.type === 'forex' && '💱'}
                  {item.type === 'gold' && '🥇'}
                  {item.type === 'crypto' && '₿'}
                  {item.type === 'giftcard' && '🎁'}
                </span>
                <span className="item-name">{item.name || item.symbol}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">${formatNumber(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="order-total">
          <span>Total Paid:</span>
          <span className="total-amount">${formatNumber(order?.total || 0)}</span>
        </div>

        <div className="payment-method">
          <span>Payment Method:</span>
          <span>
            {order?.paymentMethod === 'card' && '💳 Credit Card'}
            {order?.paymentMethod === 'crypto' && '₿ Cryptocurrency'}
            {order?.paymentMethod === 'bank' && '🏦 Bank Transfer'}
            {order?.paymentMethod === 'giftcard' && '🎁 Gift Card'}
          </span>
        </div>
      </div>

      {order?.paymentMethod === 'giftcard' && order?.items?.some(i => i.type === 'giftcard') && (
        <div className="giftcard-delivery">
          <h4>🎁 Gift Card Delivery</h4>
          <p>Your gift cards have been sent to: {order?.billingDetails?.email}</p>
          <div className="giftcard-codes">
            {order?.items
              ?.filter(i => i.type === 'giftcard')
              .map((item, index) => (
                <div key={index} className="giftcard-code">
                  <span>{item.name}:</span>
                  <code>{item.giftCode || `GC-${Math.random().toString(36).substring(7).toUpperCase()}`}</code>
                  <button className="copy-code">Copy</button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={onContinue} className="continue-shopping-btn">
          Continue Shopping
        </button>
        <button onClick={() => window.print()} className="print-receipt-btn">
          🖨️ Print Receipt
        </button>
      </div>

      <div className="email-confirmation">
        📧 A confirmation email has been sent to {order?.billingDetails?.email || 'your email'}
      </div>
    </div>
  );
};

export default OrderComplete;