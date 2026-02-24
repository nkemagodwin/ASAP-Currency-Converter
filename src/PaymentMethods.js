// PaymentMethods.js
import React from 'react';

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    icon: '💳',
    description: 'Pay with Visa, Mastercard, American Express',
    processingTime: 'Instant',
    fee: '2.9% + $0.30'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: '₿',
    description: 'Pay with Bitcoin, Ethereum, USDT',
    processingTime: '5-30 minutes',
    fee: '1%'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer / Wire transfer',
    processingTime: '1-3 business days',
    fee: '$15 flat'
  },
  {
    id: 'giftcard',
    name: 'Gift Card',
    icon: '🎁',
    description: 'Redeem gift cards from major brands',
    processingTime: 'Instant',
    fee: '0%'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay with your PayPal account',
    processingTime: 'Instant',
    fee: '2.9% + $0.30'
  },
  {
    id: 'applepay',
    name: 'Apple Pay',
    icon: '📱',
    description: 'Fast and secure payment with Apple',
    processingTime: 'Instant',
    fee: '2.9% + $0.30'
  }
];

const PaymentMethods = ({ selectedMethod, onSelect, darkMode }) => {
  return (
    <div className={`payment-methods ${darkMode ? 'dark' : 'light'}`}>
      <h3 className="payment-methods-title">Select Payment Method</h3>
      
      <div className="payment-methods-grid">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
          >
            <div className="payment-method-icon">{method.icon}</div>
            <div className="payment-method-info">
              <div className="payment-method-name">{method.name}</div>
              <div className="payment-method-desc">{method.description}</div>
              <div className="payment-method-meta">
                <span className="processing-time">⏱️ {method.processingTime}</span>
                <span className="fee">💰 Fee: {method.fee}</span>
              </div>
            </div>
            {selectedMethod === method.id && (
              <div className="selected-indicator">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;