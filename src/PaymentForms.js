// PaymentForms.js
import React, { useState } from 'react';

// Card Payment Form
export const CardPaymentForm = ({ paymentDetails, onUpdate, darkMode }) => {
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }

    onUpdate({ [name]: formattedValue });
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    return 'unknown';
  };

  const cardType = detectCardType(paymentDetails.cardNumber);

  return (
    <div className={`payment-form card-form ${darkMode ? 'dark' : 'light'}`}>
      <div className="card-preview">
        <div className="card-chip">💳</div>
        <div className="card-number-display">
          {paymentDetails.cardNumber || '•••• •••• •••• ••••'}
        </div>
        <div className="card-details">
          <div className="card-holder">
            <span className="card-label">Card Holder</span>
            <span className="card-value">{paymentDetails.cardHolder || 'FULL NAME'}</span>
          </div>
          <div className="card-expiry">
            <span className="card-label">Expires</span>
            <span className="card-value">{paymentDetails.expiryDate || 'MM/YY'}</span>
          </div>
        </div>
        {cardType !== 'unknown' && (
          <div className={`card-type ${cardType}`}></div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={paymentDetails.cardNumber}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          className={errors.cardNumber ? 'error' : ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cardHolder">Card Holder Name</label>
        <input
          type="text"
          id="cardHolder"
          name="cardHolder"
          value={paymentDetails.cardHolder}
          onChange={handleChange}
          placeholder="JOHN DOE"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            value={paymentDetails.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength="5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input
            type="password"
            id="cvv"
            name="cvv"
            value={paymentDetails.cvv}
            onChange={handleChange}
            placeholder="123"
            maxLength="4"
          />
          <div className="cvv-hint">3 or 4 digits on back of card</div>
        </div>
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="saveCard"
            checked={paymentDetails.saveCard}
            onChange={(e) => onUpdate({ saveCard: e.target.checked })}
          />
          Save this card for future purchases
        </label>
      </div>

      <div className="payment-security">
        <span>🔒 256-bit SSL Encryption</span>
        <span>✓ PCI Compliant</span>
      </div>
    </div>
  );
};

// Crypto Payment Form
export const CryptoPaymentForm = ({ cryptoPayment, onUpdate, darkMode }) => {
  const networks = [
    { id: 'ERC20', name: 'Ethereum (ERC-20)', fee: '~$15', time: '5-15 min' },
    { id: 'BEP20', name: 'Binance (BEP-20)', fee: '~$0.50', time: '2-5 min' },
    { id: 'TRC20', name: 'Tron (TRC-20)', fee: '~$1', time: '2-5 min' },
    { id: 'SOL', name: 'Solana', fee: '~$0.01', time: '<1 min' },
    { id: 'BTC', name: 'Bitcoin', fee: '~$5', time: '30-60 min' }
  ];

  const selectedNetwork = networks.find(n => n.id === cryptoPayment.network) || networks[0];

  return (
    <div className={`payment-form crypto-form ${darkMode ? 'dark' : 'light'}`}>
      <div className="crypto-wallet">
        <div className="wallet-icon">₿</div>
        <div className="wallet-address">
          <span className="address-label">Send payment to:</span>
          <code className="address-value">
            {cryptoPayment.walletAddress || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'}
          </code>
          <button className="copy-address-btn">📋 Copy</button>
        </div>
      </div>

      <div className="form-group">
        <label>Select Network</label>
        <select
          value={cryptoPayment.network}
          onChange={(e) => onUpdate({ network: e.target.value })}
          className="network-select"
        >
          {networks.map(network => (
            <option key={network.id} value={network.id}>
              {network.name} (Fee: {network.fee}, Time: {network.time})
            </option>
          ))}
        </select>
      </div>

      <div className="network-info">
        <div className="info-row">
          <span>Network Fee:</span>
          <span className="fee">{selectedNetwork.fee}</span>
        </div>
        <div className="info-row">
          <span>Estimated Time:</span>
          <span className="time">{selectedNetwork.time}</span>
        </div>
        <div className="info-row warning">
          <span>⚠️ Ensure you select the correct network</span>
        </div>
      </div>

      <div className="form-group">
        <label>Transaction Hash (optional)</label>
        <input
          type="text"
          value={cryptoPayment.transactionHash}
          onChange={(e) => onUpdate({ transactionHash: e.target.value })}
          placeholder="0x..."
          className="tx-hash-input"
        />
        <div className="hash-hint">Paste transaction hash after sending</div>
      </div>

      <div className="qr-code-placeholder">
        <div className="qr-icon">📱</div>
        <span>Scan QR Code with your wallet app</span>
      </div>
    </div>
  );
};

// Gift Card Payment Form
export const GiftCardPaymentForm = ({ giftCardPayment, onUpdate, darkMode }) => {
  const [isValidating, setIsValidating] = useState(false);

  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const validateGiftCard = async () => {
    setIsValidating(true);
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsValidating(false);
    // Mock validation success
    onUpdate({ balance: 100 });
  };

  return (
    <div className={`payment-form giftcard-form ${darkMode ? 'dark' : 'light'}`}>
      <div className="giftcard-header">
        <span className="giftcard-icon">🎁</span>
        <span className="giftcard-title">Redeem Gift Card</span>
      </div>

      <div className="form-group">
        <label>Card Number</label>
        <input
          type="text"
          value={giftCardPayment.cardNumber}
          onChange={(e) => onUpdate({ cardNumber: e.target.value.toUpperCase() })}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="giftcard-input"
        />
      </div>

      <div className="form-group">
        <label>PIN / Security Code</label>
        <input
          type="password"
          value={giftCardPayment.pin}
          onChange={(e) => onUpdate({ pin: e.target.value })}
          placeholder="••••"
          maxLength="4"
          className="giftcard-input"
        />
      </div>

      <button
        onClick={validateGiftCard}
        disabled={!giftCardPayment.cardNumber || !giftCardPayment.pin || isValidating}
        className="validate-giftcard-btn"
      >
        {isValidating ? 'Validating...' : 'Validate Card'}
      </button>

      {giftCardPayment.balance > 0 && (
        <div className="giftcard-balance">
          <span>Available Balance:</span>
          <span className="balance-amount">${formatNumber(giftCardPayment.balance)}</span>
        </div>
      )}

      <div className="giftcard-brands">
        <p>Accepted Gift Cards:</p>
        <div className="brand-icons">
          <span>Amazon</span>
          <span>iTunes</span>
          <span>Google Play</span>
          <span>Steam</span>
          <span>Xbox</span>
          <span>PlayStation</span>
        </div>
      </div>
    </div>
  );
};

// Bank Transfer Form
export const BankTransferForm = ({ darkMode }) => {
  const bankDetails = {
    bankName: 'Chase Bank',
    accountName: 'ASAP~FUNDS Inc.',
    accountNumber: '1234567890',
    routingNumber: '021000021',
    swiftCode: 'CHASUS33',
    reference: `PAY-${Date.now().toString().slice(-8)}`
  };

  return (
    <div className={`payment-form bank-form ${darkMode ? 'dark' : 'light'}`}>
      <div className="bank-details">
        <h4>Bank Transfer Details</h4>
        
        <div className="detail-item">
          <span className="detail-label">Bank Name:</span>
          <span className="detail-value">{bankDetails.bankName}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Account Name:</span>
          <span className="detail-value">{bankDetails.accountName}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Account Number:</span>
          <span className="detail-value">{bankDetails.accountNumber}</span>
          <button className="copy-btn">Copy</button>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Routing Number:</span>
          <span className="detail-value">{bankDetails.routingNumber}</span>
          <button className="copy-btn">Copy</button>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">SWIFT Code:</span>
          <span className="detail-value">{bankDetails.swiftCode}</span>
        </div>
        
        <div className="detail-item reference">
          <span className="detail-label">Payment Reference:</span>
          <span className="detail-value highlight">{bankDetails.reference}</span>
          <button className="copy-btn">Copy</button>
        </div>
      </div>

      <div className="bank-instructions">
        <h4>Payment Instructions:</h4>
        <ol>
          <li>Log in to your online banking</li>
          <li>Add {bankDetails.accountName} as a payee</li>
          <li>Enter the amount to transfer</li>
          <li>Include the payment reference in description</li>
          <li>Confirm and send the transfer</li>
        </ol>
      </div>

      <div className="bank-warning">
        ⚠️ Transfers typically take 1-3 business days to process
      </div>
    </div>
  );
};

// PayPal Form
export const PayPalForm = ({ darkMode }) => {
  return (
    <div className={`payment-form paypal-form ${darkMode ? 'dark' : 'light'}`}>
      <div className="paypal-button-container">
        <button className="paypal-button">
          <span className="paypal-logo">PayPal</span>
          <span className="paypal-text">Checkout</span>
        </button>
        <p className="paypal-note">You will be redirected to PayPal to complete your payment</p>
      </div>

      <div className="paypal-options">
        <label className="checkbox-label">
          <input type="checkbox" /> 
          <span>Pay with PayPal Credit</span>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" />
          <span>Save PayPal info for future purchases</span>
        </label>
      </div>
    </div>
  );
};