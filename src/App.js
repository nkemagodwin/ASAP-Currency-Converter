import React, { useState, useEffect, useMemo, useCallback } from 'react';

// =============== CONSTANTS & CONFIGURATIONS ===============
const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', rate: 1460.50, favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.0060, flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', rate: 12.85, favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.0045, flag: '🇬🇭' },
  { code: 'USD', name: 'US Dollar', rate: 1.0, favorite: true, color: '#667eea', trend: 'neutral', volatility: 0.0010, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', rate: 0.915, favorite: true, color: '#764ba2', trend: 'down', volatility: 0.0025, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', rate: 0.795, favorite: true, color: '#f093fb', trend: 'up', volatility: 0.0030, flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', rate: 149.30, favorite: false, color: '#f5576c', trend: 'down', volatility: 0.0035, flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', rate: 1.368, favorite: false, color: '#4facfe', trend: 'up', volatility: 0.0028, flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', rate: 1.565, favorite: false, color: '#00f2fe', trend: 'down', volatility: 0.0032, flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', rate: 0.882, favorite: false, color: '#43e97b', trend: 'neutral', volatility: 0.0020, flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', rate: 7.285, favorite: false, color: '#fa709a', trend: 'up', volatility: 0.0015, flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', rate: 83.42, favorite: false, color: '#ffee00', trend: 'down', volatility: 0.0018, flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', rate: 5.12, favorite: false, color: '#00b09b', trend: 'up', volatility: 0.0040, flag: '🇧🇷' },
  { code: 'RUB', name: 'Russian Ruble', rate: 92.75, favorite: false, color: '#96c93d', trend: 'down', volatility: 0.0050, flag: '🇷🇺' },
  { code: 'MXN', name: 'Mexican Peso', rate: 17.48, favorite: false, color: '#ff5e62', trend: 'up', volatility: 0.0035, flag: '🇲🇽' },
  { code: 'KRW', name: 'South Korean Won', rate: 1330.45, favorite: false, color: '#4F46E5', trend: 'neutral', volatility: 0.0022, flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', rate: 1.345, favorite: false, color: '#8B5CF6', trend: 'up', volatility: 0.0018, flag: '🇸🇬' },
  { code: 'ZAR', name: 'South African Rand', rate: 18.75, favorite: false, color: '#F97316', trend: 'down', volatility: 0.0045, flag: '🇿🇦' },
];

const ORDER_TYPES = [
  { id: 'market', name: 'Market Order', description: 'Execute immediately at current price', icon: '⚡', fee: 0.001 },
  { id: 'limit', name: 'Limit Order', description: 'Execute at specified price or better', icon: '🎯', fee: 0.0005 },
  { id: 'stop', name: 'Stop Order', description: 'Execute when price reaches trigger', icon: '🛑', fee: 0.001 },
  { id: 'stop_limit', name: 'Stop Limit', description: 'Stop order with price limit', icon: '📊', fee: 0.0005 },
  { id: 'trailing_stop', name: 'Trailing Stop', description: 'Stop that follows price', icon: '📈', fee: 0.001 }
];

const TRADE_DIRECTION = {
  BUY: 'buy',
  SELL: 'sell'
};

const TRADE_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

const RISK_LEVELS = [
  { id: 'low', name: 'Low Risk', maxPositionSize: 0.02, maxLossPerTrade: 0.01, color: '#10b981' },
  { id: 'medium', name: 'Medium Risk', maxPositionSize: 0.05, maxLossPerTrade: 0.02, color: '#f59e0b' },
  { id: 'high', name: 'High Risk', maxPositionSize: 0.10, maxLossPerTrade: 0.05, color: '#ef4444' }
];

const TIME_FRAMES = [
  { label: '1m', value: 1, interval: 2000 },
  { label: '5m', value: 5, interval: 10000 },
  { label: '15m', value: 15, interval: 30000 },
  { label: '1h', value: 60, interval: 120000 },
  { label: '4h', value: 240, interval: 480000 }
];

const TRADING_PAIRS = [
  { pair: 'USD/EUR', base: 'USD', quote: 'EUR', spread: 0.0001, minTrade: 100 },
  { pair: 'USD/GBP', base: 'USD', quote: 'GBP', spread: 0.0002, minTrade: 100 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', spread: 0.00015, minTrade: 100 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', spread: 0.01, minTrade: 100 },
  { pair: 'NGN/USD', base: 'NGN', quote: 'USD', spread: 0.5, minTrade: 1000 },
  { pair: 'GHS/USD', base: 'GHS', quote: 'USD', spread: 0.02, minTrade: 100 },
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', spread: 0.02, minTrade: 100 },
  { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', spread: 0.025, minTrade: 100 }
];

// =============== UTILITY FUNCTIONS ===============

const formatNumber = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

const formatLargeNumber = (value) => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${formatNumber(value)}`;
};

// =============== TRADING ENGINE ===============
class TradingEngine {
  static calculatePositionSize(accountBalance, riskPercentage, entryPrice, stopLossPrice, leverage = 1) {
    const riskAmount = accountBalance * riskPercentage;
    const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
    const positionSize = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0;
    return positionSize * leverage;
  }

  static calculateRiskRewardRatio(entryPrice, stopLossPrice, takeProfitPrice) {
    const risk = Math.abs(entryPrice - stopLossPrice);
    const reward = Math.abs(takeProfitPrice - entryPrice);
    return risk > 0 ? reward / risk : 0;
  }

  static calculateProfitLoss(positionSize, entryPrice, exitPrice, direction) {
    const priceDiff = exitPrice - entryPrice;
    const multiplier = direction === TRADE_DIRECTION.BUY ? 1 : -1;
    return positionSize * priceDiff * multiplier;
  }

  static calculateMargin(positionSize, price, leverage = 1) {
    return (positionSize * price) / leverage;
  }

  static calculateSpreadCost(positionSize, spread) {
    return positionSize * spread;
  }

  static calculatePairRate(baseCurrency, quoteCurrency, currencies) {
    const base = currencies.find(c => c.code === baseCurrency);
    const quote = currencies.find(c => c.code === quoteCurrency);
    
    if (!base || !quote) return 1;
    
    // Convert both to USD first, then calculate cross rate
    const baseToUSD = base.code === 'USD' ? 1 : base.rate;
    const quoteToUSD = quote.code === 'USD' ? 1 : quote.rate;
    
    return baseToUSD / quoteToUSD;
  }

  static convertCurrency(amount, fromCurrency, toCurrency, currencies) {
    if (fromCurrency === toCurrency) return amount;
    
    const from = currencies.find(c => c.code === fromCurrency);
    const to = currencies.find(c => c.code === toCurrency);
    
    if (!from || !to) return 0;
    
    // Convert fromCurrency to USD
    const amountInUSD = from.code === 'USD' ? amount : amount / from.rate;
    
    // Convert USD to toCurrency
    const convertedAmount = to.code === 'USD' ? amountInUSD : amountInUSD * to.rate;
    
    return convertedAmount;
  }

  static validateTrade(portfolio, currencyPair, amount, price, direction, orderType, riskLevel) {
    const errors = [];
    
    const [baseCurrency, quoteCurrency] = currencyPair.split('/');
    const riskConfig = RISK_LEVELS.find(r => r.id === riskLevel);
    const tradingPair = TRADING_PAIRS.find(p => p.pair === currencyPair);
    
    // Check minimum trade size
    if (tradingPair && amount < tradingPair.minTrade) {
      errors.push(`Minimum trade size is ${tradingPair.minTrade} ${baseCurrency}`);
    }
    
    // Check balance
    const margin = amount * price;
    if (direction === TRADE_DIRECTION.BUY) {
      const requiredBalance = margin;
      if (requiredBalance > portfolio.balance) {
        errors.push(`Insufficient balance. Required: $${formatNumber(requiredBalance)}`);
      }
    }
    
    // Check position size against risk level
    const positionSizePercentage = margin / portfolio.totalValue;
    if (positionSizePercentage > riskConfig.maxPositionSize) {
      errors.push(`Position size (${(positionSizePercentage * 100).toFixed(1)}%) exceeds ${(riskConfig.maxPositionSize * 100).toFixed(0)}% limit`);
    }
    
    // Check if currency is available for selling
    if (direction === TRADE_DIRECTION.SELL) {
      if (!portfolio.currencies[baseCurrency] || portfolio.currencies[baseCurrency] < amount) {
        errors.push(`Insufficient ${baseCurrency} to sell`);
      }
    }
    
    return errors;
  }
}

// =============== CUSTOM HOOKS ===============
const useMarketData = (currencies, setCurrencies, setRateHistory, setLastUpdate, timeFrame) => {
  useEffect(() => {
    const updateLiveRates = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      setCurrencies(prev => prev.map(currency => {
        if (currency.code === 'USD') return currency;
        
        // Simulate market hours effect (closed on weekends, less active at night)
        const isMarketOpen = day >= 1 && day <= 5 && hour >= 1 && hour < 23;
        const marketActivity = isMarketOpen ? 1 : 0.1;
        const randomChange = (Math.random() - 0.5) * currency.volatility * marketActivity;
        
        // Add market trend bias
        let trendBias = 0;
        switch(currency.trend) {
          case 'up': trendBias = 0.0002; break;
          case 'down': trendBias = -0.0002; break;
          default: trendBias = 0;
        }
        
        const totalChange = trendBias + randomChange;
        const newRate = Math.max(0.0001, currency.rate * (1 + totalChange));
        const changePercent = ((newRate - currency.rate) / currency.rate * 100);
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update rate history
        setRateHistory(prev => ({
          ...prev,
          [currency.code]: [
            ...(prev[currency.code] || []),
            { 
              time: timestamp, 
              rate: parseFloat(newRate.toFixed(6)),
              timestamp: now.getTime(),
              change: changePercent
            }
          ].slice(-100) // Keep last 100 data points
        }));
        
        return {
          ...currency,
          rate: parseFloat(newRate.toFixed(6)),
          previousRate: currency.rate,
          trend: totalChange > 0.0001 ? 'up' : totalChange < -0.0001 ? 'down' : 'neutral',
          change: parseFloat(changePercent.toFixed(4))
        };
      }));
      
      setLastUpdate(now);
    };
    
    const intervalId = setInterval(updateLiveRates, timeFrame.interval);
    updateLiveRates();
    
    return () => clearInterval(intervalId);
  }, [setCurrencies, setLastUpdate, setRateHistory, timeFrame]);
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

// =============== REUSABLE COMPONENTS ===============
const Notification = ({ message, type, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div className="notification" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      background: colors[type],
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      animation: 'slideIn 0.3s ease',
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      <span style={{ fontSize: '18px' }}>{icons[type]}</span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '4px' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </strong>
        <span style={{ fontSize: '14px' }}>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0',
          minWidth: '24px',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        className="notification-close-button"
      >
        ×
      </button>
    </div>
  );
};

const Loader = ({ size = 20, color = '#667eea' }) => (
  <div style={{
    width: size,
    height: size,
    border: `2px solid ${color}20`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
);

const Card = ({ children, darkMode, style = {}, className = '' }) => (
  <div className={`card ${className}`} style={{
    background: darkMode ? '#1e293b' : 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    ...style
  }}>
    {children}
  </div>
);

// =============== CURRENCY CONVERTER COMPONENT ===============
const CurrencyConverter = ({ currencies, darkMode }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(100);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [inverseRate, setInverseRate] = useState(0);
  const [favorites, setFavorites] = useLocalStorage('favorite-currencies', ['USD', 'EUR', 'GBP', 'JPY', 'NGN', 'GHS']);
  const [conversionHistory, setConversionHistory] = useLocalStorage('conversion-history', []);
  const [isSwapping, setIsSwapping] = useState(false);

  // Calculate conversion on mount and when dependencies change
  useEffect(() => {
    calculateConversion();
  }, [fromCurrency, toCurrency, amount, currencies]);

  const calculateConversion = () => {
    if (!amount || amount <= 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      setInverseRate(0);
      return;
    }

    const rate = TradingEngine.calculatePairRate(fromCurrency, toCurrency, currencies);
    const converted = TradingEngine.convertCurrency(amount, fromCurrency, toCurrency, currencies);
    
    setExchangeRate(rate);
    setInverseRate(1 / rate);
    setConvertedAmount(converted);
  };

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);
      setIsSwapping(false);
    }, 300);
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount);
  };

  const handleAddToFavorites = (currencyCode) => {
    if (!favorites.includes(currencyCode)) {
      setFavorites([...favorites, currencyCode]);
    }
  };

  const handleRemoveFromFavorites = (currencyCode) => {
    setFavorites(favorites.filter(fav => fav !== currencyCode));
  };

  const handleSaveConversion = () => {
    const newConversion = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
      convertedAmount: convertedAmount,
      rate: exchangeRate
    };
    
    setConversionHistory([newConversion, ...conversionHistory.slice(0, 9)]);
  };

  const favoriteCurrencies = currencies.filter(currency => favorites.includes(currency.code));
  const nonFavoriteCurrencies = currencies.filter(currency => !favorites.includes(currency.code));

  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000, 10000];

  return (
    <div className="converter-grid">
      {/* Left Column: Converter */}
      <Card darkMode={darkMode} className="converter-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="section-title">
            💱 Currency Converter
          </h2>
          <button
            onClick={handleSaveConversion}
            className="header-button"
            style={{
              padding: '8px 16px',
              background: darkMode ? '#334155' : '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            💾 Save Conversion
          </button>
        </div>

        {/* Converter Input Section */}
        <div className="converter-input-section">
          {/* From Currency */}
          <div className="converter-from">
            <label className="input-label">
              From
            </label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="currency-select"
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">
                  ▼
                </div>
              </div>
              {!favorites.includes(fromCurrency) ? (
                <button
                  onClick={() => handleAddToFavorites(fromCurrency)}
                  className="favorite-button"
                  title="Add to favorites"
                >
                    ⭐
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveFromFavorites(fromCurrency)}
                  className="favorite-button active"
                  title="Remove from favorites"
                >
                    ★
                </button>
              )}
            </div>
            
            <div className="amount-input-wrapper">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="amount-input"
                min="0"
                step="0.01"
              />
              <div className="currency-code">
                {fromCurrency}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-section">
            <button
              onClick={handleSwapCurrencies}
              disabled={isSwapping}
              className="swap-button"
              title="Swap currencies"
              style={{
                transform: isSwapping ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              🔄
            </button>
            <div className="rate-display">
              1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
            </div>
          </div>

          {/* To Currency */}
          <div className="converter-to">
            <label className="input-label">
              To
            </label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="currency-select"
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">
                  ▼
                </div>
              </div>
              {!favorites.includes(toCurrency) ? (
                <button
                  onClick={() => handleAddToFavorites(toCurrency)}
                  className="favorite-button"
                  title="Add to favorites"
                >
                    ⭐
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveFromFavorites(toCurrency)}
                  className="favorite-button active"
                  title="Remove from favorites"
                >
                    ★
                </button>
              )}
            </div>
            
            <div className="converted-amount-display">
              <div className="currency-code">
                {toCurrency}
              </div>
              {formatNumber(convertedAmount, 6)}
            </div>
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="quick-amounts-section">
          <label className="input-label">
            Quick Amounts ({fromCurrency})
          </label>
          <div className="quick-amounts-grid">
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => handleQuickAmount(quickAmount)}
                className={`quick-amount-button ${amount === quickAmount ? 'active' : ''}`}
              >
                {quickAmount >= 1000 ? formatLargeNumber(quickAmount) : formatNumber(quickAmount)}
              </button>
            ))}
          </div>
        </div>

        {/* Exchange Rate Details */}
        <div className="rate-details">
          <h3 className="rate-details-title">
            📊 Exchange Rate Details
          </h3>
          <div className="rate-details-grid">
            <div>
              <div className="rate-label">Current Rate</div>
              <div className="rate-value">
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </div>
            </div>
            <div>
              <div className="rate-label">Inverse Rate</div>
              <div className="rate-value inverse">
                1 {toCurrency} = {inverseRate.toFixed(6)} {fromCurrency}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Column: Favorites & History */}
      <div className="converter-sidebar">
        {/* Favorite Currencies */}
        <Card darkMode={darkMode} className="favorites-card">
          <h3 className="section-subtitle">
            ⭐ Favorite Currencies
          </h3>
          <div className="favorites-grid">
            {favoriteCurrencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => {
                  setFromCurrency(currency.code);
                  if (toCurrency === currency.code) {
                    setToCurrency('USD');
                  }
                }}
                className={`currency-button ${fromCurrency === currency.code ? 'active' : ''}`}
              >
                <div className="currency-flag">{currency.flag}</div>
                <div>
                  <div className="currency-code-text">{currency.code}</div>
                  <div className="currency-rate">
                    {formatNumber(currency.rate, 4)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {favoriteCurrencies.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <p>No favorite currencies yet</p>
              <p className="empty-subtitle">Click the star button to add favorites</p>
            </div>
          )}
        </Card>

        {/* Quick Conversions */}
        <Card darkMode={darkMode} className="quick-conversions-card">
          <h3 className="section-subtitle">
            ⚡ Quick Conversions
          </h3>
          <div className="quick-conversions-grid">
            {[
              { from: 'USD', to: 'EUR' },
              { from: 'EUR', to: 'GBP' },
              { from: 'GBP', to: 'USD' },
              { from: 'USD', to: 'JPY' },
              { from: 'USD', to: 'NGN' },
              { from: 'USD', to: 'GHS' },
            ].map((pair, index) => {
              const fromCurr = currencies.find(c => c.code === pair.from);
              const toCurr = currencies.find(c => c.code === pair.to);
              const rate = TradingEngine.calculatePairRate(pair.from, pair.to, currencies);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                    setAmount(100);
                  }}
                  className="quick-conversion-button"
                >
                  <div className="conversion-header">
                    <span className="conversion-pair">
                      {pair.from} → {pair.to}
                    </span>
                    <span className="conversion-rate">
                      {rate.toFixed(4)}
                    </span>
                  </div>
                  <div className="conversion-details">
                    <span>{fromCurr?.flag} 100 {pair.from}</span>
                    <span>=</span>
                    <span>{toCurr?.flag} {formatNumber(TradingEngine.convertCurrency(100, pair.from, pair.to, currencies), 2)} {pair.to}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Conversion History */}
      <Card darkMode={darkMode} className="history-card">
        <h3 className="section-subtitle">
          📋 Recent Conversions
        </h3>
        {conversionHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p style={{ fontSize: '14px' }}>No conversion history yet</p>
            <p className="empty-subtitle">Convert currencies to see history here</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th className="table-header">Time</th>
                  <th className="table-header">From</th>
                  <th className="table-header">To</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Result</th>
                </tr>
              </thead>
              <tbody>
                {conversionHistory.map((conversion) => (
                  <tr 
                    key={conversion.id}
                    className="history-row"
                  >
                    <td className="history-time">
                      {new Date(conversion.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="history-currency">
                      {currencies.find(c => c.code === conversion.from)?.flag}
                      {conversion.from}
                    </td>
                    <td className="history-currency">
                      {currencies.find(c => c.code === conversion.to)?.flag}
                      {conversion.to}
                    </td>
                    <td className="history-amount">
                      {formatNumber(conversion.amount, 2)}
                    </td>
                    <td className="history-result">
                      {formatNumber(conversion.convertedAmount, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {conversionHistory.length > 0 && (
          <button
            onClick={() => setConversionHistory([])}
            className="clear-history-button"
          >
            🗑️ Clear History
          </button>
        )}
      </Card>
    </div>
  );
};

// =============== TRADING COMPONENTS ===============
const CurrencyPairSelector = ({ selectedPair, onSelect, darkMode }) => (
  <div className="pair-selector">
    <label className="input-label">
      Select Trading Pair
    </label>
    <div className="pairs-grid">
      {TRADING_PAIRS.map(({ pair, spread }) => (
        <button
          key={pair}
          onClick={() => onSelect(pair)}
          className={`pair-button ${selectedPair === pair ? 'active' : ''}`}
        >
          <span className="pair-name">{pair}</span>
          <span className="pair-spread">
            Spread: {spread.toFixed(4)}
          </span>
        </button>
      ))}
    </div>
  </div>
);

const OrderBook = ({ pair, currencies, darkMode }) => {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);

  useEffect(() => {
    const generateOrderBook = () => {
      const [base, quote] = pair.split('/');
      const currentPrice = TradingEngine.calculatePairRate(base, quote, currencies);

      const newBids = Array.from({ length: 10 }, (_, i) => ({
        price: currentPrice * (1 - (i * 0.0005 + Math.random() * 0.0001)),
        volume: Math.random() * 1000,
        total: 0
      })).sort((a, b) => b.price - a.price);

      const newAsks = Array.from({ length: 10 }, (_, i) => ({
        price: currentPrice * (1 + (i * 0.0005 + Math.random() * 0.0001)),
        volume: Math.random() * 1000,
        total: 0
      })).sort((a, b) => a.price - b.price);

      // Calculate cumulative totals
      let bidTotal = 0;
      newBids.forEach(bid => {
        bidTotal += bid.volume;
        bid.total = bidTotal;
      });

      let askTotal = 0;
      newAsks.forEach(ask => {
        askTotal += ask.volume;
        ask.total = askTotal;
      });

      setBids(newBids);
      setAsks(newAsks);
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [pair, currencies]);

  const maxVolume = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  );

  return (
    <Card darkMode={darkMode} className="order-book-card">
      <h3 className="section-subtitle">
        📊 Order Book - {pair}
      </h3>
      <div className="order-book-grid">
        {/* Bids */}
        <div>
          <div className="order-book-header">
            <span>Bid (Buy)</span>
            <span>Volume</span>
          </div>
          {bids.map((bid, i) => (
            <div 
              key={i}
              className="order-book-row bid-row"
              style={{
                background: darkMode 
                  ? `linear-gradient(to left, rgba(16, 185, 129, 0.15) ${(bid.total / maxVolume) * 100}%, transparent 0%)`
                  : `linear-gradient(to left, rgba(16, 185, 129, 0.1) ${(bid.total / maxVolume) * 100}%, transparent 0%)`
              }}
            >
              <span className="bid-price">{bid.price.toFixed(5)}</span>
              <span className="order-volume">{bid.volume.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        {/* Asks */}
        <div>
          <div className="order-book-header ask-header">
            <span>Ask (Sell)</span>
            <span>Volume</span>
          </div>
          {asks.map((ask, i) => (
            <div 
              key={i}
              className="order-book-row ask-row"
              style={{
                background: darkMode
                  ? `linear-gradient(to left, rgba(239, 68, 68, 0.15) ${(ask.total / maxVolume) * 100}%, transparent 0%)`
                  : `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${(ask.total / maxVolume) * 100}%, transparent 0%)`
              }}
            >
              <span className="ask-price">{ask.price.toFixed(5)}</span>
              <span className="order-volume">{ask.volume.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const AdvancedTradePanel = ({ 
  portfolio, 
  currencies, 
  onExecuteTrade, 
  darkMode,
  pair,
  onPairChange
}) => {
  const [tradeConfig, setTradeConfig] = useState({
    direction: TRADE_DIRECTION.BUY,
    orderType: 'market',
    amount: 100,
    limitPrice: 0,
    stopPrice: 0,
    takeProfit: 0,
    stopLoss: 0,
    riskLevel: 'medium',
    leverage: 1,
    expiry: 'good_til_cancelled'
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculations, setCalculations] = useState({});
  const [errors, setErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentRate = useMemo(() => {
    const [from, to] = pair.split('/');
    return TradingEngine.calculatePairRate(from, to, currencies);
  }, [pair, currencies]);

  const calculateTrade = useCallback(() => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const [from, to] = pair.split('/');
      const entryPrice = tradeConfig.orderType === 'market' ? currentRate : tradeConfig.limitPrice;
      const spread = TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0.0001;
      
      const positionSize = tradeConfig.amount;
      const margin = TradingEngine.calculateMargin(positionSize, entryPrice, tradeConfig.leverage);
      const spreadCost = TradingEngine.calculateSpreadCost(positionSize, spread);
      
      const riskRewardRatio = tradeConfig.stopLoss && tradeConfig.takeProfit 
        ? TradingEngine.calculateRiskRewardRatio(entryPrice, tradeConfig.stopLoss, tradeConfig.takeProfit)
        : 0;
      
      const potentialProfit = tradeConfig.takeProfit 
        ? TradingEngine.calculateProfitLoss(
            positionSize,
            entryPrice,
            tradeConfig.takeProfit,
            tradeConfig.direction
          )
        : 0;
      
      const potentialLoss = tradeConfig.stopLoss
        ? TradingEngine.calculateProfitLoss(
            positionSize,
            entryPrice,
            tradeConfig.stopLoss,
            tradeConfig.direction
          )
        : 0;
      
      const riskPercentage = potentialLoss / portfolio.totalValue;
      const riskConfig = RISK_LEVELS.find(r => r.id === tradeConfig.riskLevel);
      
      const validationErrors = TradingEngine.validateTrade(
        portfolio,
        pair,
        positionSize,
        entryPrice,
        tradeConfig.direction,
        tradeConfig.orderType,
        tradeConfig.riskLevel
      );
      
      setErrors(validationErrors);
      
      setCalculations({
        entryPrice,
        positionSize,
        margin,
        spreadCost,
        riskRewardRatio,
        potentialProfit,
        potentialLoss,
        riskPercentage,
        maxAllowedLoss: portfolio.totalValue * riskConfig.maxLossPerTrade,
        isValid: validationErrors.length === 0
      });
      
      setIsCalculating(false);
    }, 200);
  }, [tradeConfig, portfolio, pair, currentRate]);

  useEffect(() => {
    calculateTrade();
  }, [tradeConfig, currentRate, calculateTrade]);

  const handleExecuteTrade = () => {
    if (errors.length > 0) return;
    
    const [from] = pair.split('/');
    const tradeData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      pair,
      direction: tradeConfig.direction,
      orderType: tradeConfig.orderType,
      amount: tradeConfig.amount,
      entryPrice: calculations.entryPrice,
      stopLoss: tradeConfig.stopLoss,
      takeProfit: tradeConfig.takeProfit,
      status: tradeConfig.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
      margin: calculations.margin,
      leverage: tradeConfig.leverage,
      riskLevel: tradeConfig.riskLevel,
      spreadCost: calculations.spreadCost,
      calculations
    };
    
    onExecuteTrade(tradeData);
    
    // Reset form
    setTradeConfig(prev => ({
      ...prev,
      amount: 100,
      limitPrice: 0,
      stopPrice: 0,
      takeProfit: 0,
      stopLoss: 0
    }));
  };

  const quickAmounts = useMemo(() => {
    const baseAmount = portfolio.totalValue * 0.01;
    return [
      baseAmount * 0.1,
      baseAmount * 0.25,
      baseAmount * 0.5,
      baseAmount * 1,
      baseAmount * 2,
      baseAmount * 5
    ].map(amt => Math.round(amt));
  }, [portfolio.totalValue]);

  return (
    <Card darkMode={darkMode} className="trade-panel-card">
      <div className="trade-panel-header">
        <h2 className="section-title">
          🚀 Advanced Trading
        </h2>
        <div className="trade-panel-actions">
          <span className="balance-display">
            Balance: ${formatNumber(portfolio.balance)}
          </span>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-button"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
      </div>
      
      <CurrencyPairSelector 
        selectedPair={pair}
        onSelect={onPairChange}
        darkMode={darkMode}
      />
      
      {/* Current Rate Display */}
      <div className="current-rate-display">
        <div className="rate-header">
          <span className="rate-label">
            Current Rate:
          </span>
          <span className="rate-value-large">
            {currentRate.toFixed(6)}
          </span>
        </div>
        <div className="rate-details">
          <span>Spread: {(TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0).toFixed(4)}</span>
          <span>Min Trade: {TRADING_PAIRS.find(p => p.pair === pair)?.minTrade || 100}</span>
        </div>
      </div>
      
      {/* Trade Direction */}
      <div className="trade-direction-section">
        <label className="input-label">
          Direction
        </label>
        <div className="direction-buttons">
          <button
            onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.BUY }))}
            className={`direction-button ${tradeConfig.direction === TRADE_DIRECTION.BUY ? 'active buy' : ''}`}
          >
            📈 BUY
          </button>
          <button
            onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.SELL }))}
            className={`direction-button ${tradeConfig.direction === TRADE_DIRECTION.SELL ? 'active sell' : ''}`}
          >
            📉 SELL
          </button>
        </div>
      </div>
      
      {/* Order Type Selection */}
      <div className="order-type-section">
        <label className="input-label">
          Order Type
        </label>
        <div className="order-type-grid">
          {ORDER_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setTradeConfig(prev => ({ ...prev, orderType: type.id }))}
              className={`order-type-button ${tradeConfig.orderType === type.id ? 'active' : ''}`}
              title={type.description}
            >
              <span className="order-icon">{type.icon}</span>
              <div className="order-info">
                <div className="order-name">{type.name}</div>
                <div className="order-fee">Fee: {(type.fee * 100).toFixed(2)}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="amount-section">
        <div className="amount-header">
          <label className="input-label">
            Amount ({pair.split('/')[0]})
          </label>
          <span className="available-amount">
            Available: {formatNumber(portfolio.currencies[pair.split('/')[0]] || 0, 2)}
          </span>
        </div>
        <div className="amount-input-wrapper">
          <input
            type="number"
            value={tradeConfig.amount}
            onChange={(e) => setTradeConfig(prev => ({ 
              ...prev, 
              amount: Math.max(0, parseFloat(e.target.value) || 0) 
            }))}
            className="trade-amount-input"
            min="0"
            step="0.01"
          />
          <span className="amount-currency">
            $
          </span>
        </div>
        <div className="quick-amount-buttons">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setTradeConfig(prev => ({ ...prev, amount }))}
              className={`quick-trade-amount-button ${tradeConfig.amount === amount ? 'active' : ''}`}
            >
              {formatNumber(amount)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Advanced Settings */}
      {showAdvanced && (
        <>
          {/* Order Prices */}
          {(tradeConfig.orderType === 'limit' || tradeConfig.orderType === 'stop_limit') && (
            <div className="advanced-setting">
              <label className="input-label">
                Limit Price ({pair.split('/')[1]})
              </label>
              <input
                type="number"
                value={tradeConfig.limitPrice || ''}
                onChange={(e) => setTradeConfig(prev => ({ 
                  ...prev, 
                  limitPrice: parseFloat(e.target.value) || 0 
                }))}
                className="advanced-input"
                placeholder="Enter limit price"
                step="0.000001"
              />
            </div>
          )}
          
          {(tradeConfig.orderType === 'stop' || tradeConfig.orderType === 'stop_limit') && (
            <div className="advanced-setting">
              <label className="input-label">
                Stop Price ({pair.split('/')[1]})
              </label>
              <input
                type="number"
                value={tradeConfig.stopPrice || ''}
                onChange={(e) => setTradeConfig(prev => ({ 
                  ...prev, 
                  stopPrice: parseFloat(e.target.value) || 0 
                }))}
                className="advanced-input"
                placeholder="Enter stop price"
                step="0.000001"
              />
            </div>
          )}
          
          {/* Risk Management */}
          <div className="risk-management-section">
            <label className="input-label">
              Risk Management
            </label>
            <div className="risk-inputs-grid">
              <div>
                <label className="risk-label">
                  Take Profit
                </label>
                <input
                  type="number"
                  value={tradeConfig.takeProfit || ''}
                  onChange={(e) => setTradeConfig(prev => ({ 
                    ...prev, 
                    takeProfit: parseFloat(e.target.value) || 0 
                  }))}
                  className="risk-input"
                  placeholder="TP"
                  step="0.000001"
                />
              </div>
              <div>
                <label className="risk-label">
                  Stop Loss
                </label>
                <input
                  type="number"
                  value={tradeConfig.stopLoss || ''}
                  onChange={(e) => setTradeConfig(prev => ({ 
                    ...prev, 
                    stopLoss: parseFloat(e.target.value) || 0 
                  }))}
                  className="risk-input"
                  placeholder="SL"
                  step="0.000001"
                />
              </div>
            </div>
            
            <div className="risk-level-section">
              <label className="risk-label">
                Risk Level
              </label>
              <div className="risk-level-buttons">
                {RISK_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setTradeConfig(prev => ({ ...prev, riskLevel: level.id }))}
                    className={`risk-level-button ${tradeConfig.riskLevel === level.id ? 'active' : ''}`}
                    style={{ backgroundColor: tradeConfig.riskLevel === level.id ? level.color : undefined }}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Leverage */}
            <div className="leverage-section">
              <label className="risk-label">
                Leverage (1:{tradeConfig.leverage})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={tradeConfig.leverage}
                onChange={(e) => setTradeConfig(prev => ({ 
                  ...prev, 
                  leverage: parseInt(e.target.value) 
                }))}
                className="trade-slider"
              />
            </div>
          </div>
        </>
      )}
      
      {/* Trade Calculations */}
      {!isCalculating && calculations.entryPrice && (
        <div className={`trade-summary ${calculations.isValid ? 'valid' : 'invalid'}`}>
          <h4 className="summary-title">
            📊 Trade Summary
            {calculations.isValid && (
              <span className="valid-badge">
                Valid
              </span>
            )}
          </h4>
          <div className="summary-grid">
            <div>
              <div className="summary-label">Entry Price:</div>
              <div className="summary-value primary">{calculations.entryPrice.toFixed(6)}</div>
            </div>
            <div>
              <div className="summary-label">Position Size:</div>
              <div className="summary-value">{calculations.positionSize.toFixed(2)}</div>
            </div>
            <div>
              <div className="summary-label">Margin Required:</div>
              <div className="summary-value">${calculations.margin.toFixed(2)}</div>
            </div>
            <div>
              <div className="summary-label">Spread Cost:</div>
              <div className="summary-value warning">${calculations.spreadCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="summary-label">Risk/Reward:</div>
              <div className={`summary-value ${
                calculations.riskRewardRatio >= 2 ? 'success' : 
                calculations.riskRewardRatio >= 1 ? 'warning' : 'error'
              }`}>
                {calculations.riskRewardRatio.toFixed(2)}:1
              </div>
            </div>
            <div>
              <div className="summary-label">Potential Profit:</div>
              <div className={`summary-value ${
                calculations.potentialProfit >= 0 ? 'success' : 'error'
              }`}>
                ${calculations.potentialProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="summary-label">Potential Loss:</div>
              <div className={`summary-value ${
                calculations.potentialLoss <= calculations.maxAllowedLoss ? 'success' : 'error'
              }`}>
                ${calculations.potentialLoss.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="summary-label">Risk Level:</div>
              <div className="summary-value" style={{ 
                color: RISK_LEVELS.find(r => r.id === tradeConfig.riskLevel)?.color
              }}>
                {tradeConfig.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="error-messages">
          <h4 className="error-title">
            ⚠️ Trade Validation Errors
          </h4>
          <ul className="error-list">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Execute Button */}
      <button
        onClick={handleExecuteTrade}
        disabled={errors.length > 0 || isCalculating}
        className={`execute-button ${tradeConfig.direction === TRADE_DIRECTION.BUY ? 'buy' : 'sell'}`}
      >
        {isCalculating ? (
          <>
            <Loader size={20} color="white" />
            Calculating...
          </>
        ) : (
          <>
            {tradeConfig.direction === TRADE_DIRECTION.BUY ? '📈' : '📉'}
            {tradeConfig.orderType === 'market' ? 'EXECUTE MARKET ORDER' : 'PLACE LIMIT ORDER'}
          </>
        )}
      </button>
    </Card>
  );
};

const PortfolioDashboard = ({ portfolio, trades, darkMode }) => {
  const calculateMetrics = useCallback(() => {
    if (trades.length === 0) return portfolio;
    
    const winningTrades = trades.filter(t => 
      t.status === TRADE_STATUS.FILLED && 
      t.exitPrice && 
      t.entryPrice && 
      ((t.direction === TRADE_DIRECTION.BUY && t.exitPrice > t.entryPrice) ||
       (t.direction === TRADE_DIRECTION.SELL && t.exitPrice < t.entryPrice))
    );
    
    const totalTrades = trades.filter(t => t.status === TRADE_STATUS.FILLED && t.exitPrice);
    const winRate = totalTrades.length > 0 ? (winningTrades.length / totalTrades.length) * 100 : 0;
    
    const totalValue = Object.entries(portfolio.currencies).reduce((sum, [currency, amount]) => {
      const rate = CURRENCIES.find(c => c.code === currency)?.rate || 1;
      return sum + (amount * rate);
    }, 0);
    
    const totalPnL = totalValue - portfolio.initialBalance;
    
    return {
      ...portfolio,
      totalValue,
      winRate: parseFloat(winRate.toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      dailyPnL: parseFloat((Math.random() * 200 - 100).toFixed(2))
    };
  }, [portfolio, trades]);

  const metrics = useMemo(() => calculateMetrics(), [calculateMetrics]);

  return (
    <Card darkMode={darkMode} className="portfolio-card">
      <h2 className="section-title">
        💼 Portfolio Dashboard
      </h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Value</div>
          <div className="metric-value primary">
            ${formatNumber(metrics.totalValue)}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Total P&L</div>
          <div className={`metric-value ${metrics.totalPnL >= 0 ? 'success' : 'error'}`}>
            {metrics.totalPnL >= 0 ? '+' : ''}${formatNumber(metrics.totalPnL)}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Win Rate</div>
          <div className={`metric-value ${
            metrics.winRate >= 50 ? 'success' : 
            metrics.winRate >= 30 ? 'warning' : 'error'
          }`}>
            {formatNumber(metrics.winRate, 1)}%
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Daily P&L</div>
          <div className={`metric-value ${metrics.dailyPnL >= 0 ? 'success' : 'error'}`}>
            {metrics.dailyPnL >= 0 ? '+' : ''}${formatNumber(metrics.dailyPnL)}
          </div>
        </div>
      </div>
      
      {/* Holdings */}
      <div className="holdings-section">
        <h3 className="section-subtitle">
          💰 Current Holdings
        </h3>
        <div className="holdings-grid">
          {Object.entries(portfolio.currencies)
            .filter(([, amount]) => amount > 0)
            .map(([currency, amount]) => {
              const currencyInfo = CURRENCIES.find(c => c.code === currency);
              const rate = currencyInfo?.rate || 1;
              const value = amount * rate;
              
              return (
                <div 
                  key={currency}
                  className="holding-item"
                  style={{
                    borderLeft: `4px solid ${currencyInfo?.color || '#667eea'}`
                  }}
                >
                  <div>
                    <div className="holding-currency">{currency}</div>
                    <div className="holding-name">{currencyInfo?.name || 'Currency'}</div>
                  </div>
                  <div className="holding-details">
                    <div className="holding-amount">
                      {formatNumber(amount)} {currency}
                    </div>
                    <div className="holding-value">
                      ${formatNumber(value)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="portfolio-stats">
        <div>
          <div>Total Trades: {trades.length}</div>
          <div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div>
        </div>
        <div>
          <div>Avg. Profit: ${(trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / 
            trades.filter(t => t.profit > 0).length || 0).toFixed(2)}</div>
          <div>Avg. Loss: ${(trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) / 
            Math.abs(trades.filter(t => t.profit < 0).length || 1)).toFixed(2)}</div>
        </div>
      </div>
    </Card>
  );
};

const AdvancedTradeHistory = ({ trades, onCloseTrade, onCancelOrder, darkMode }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    switch(filter) {
      case 'open':
        filtered = filtered.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice);
        break;
      case 'pending':
        filtered = filtered.filter(t => t.status === TRADE_STATUS.PENDING);
        break;
      case 'closed':
        filtered = filtered.filter(t => t.status === TRADE_STATUS.FILLED && t.exitPrice);
        break;
      case 'profitable':
        filtered = filtered.filter(t => t.profit > 0);
        break;
      case 'losing':
        filtered = filtered.filter(t => t.profit < 0);
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'profit':
          aValue = a.profit || 0;
          bValue = b.profit || 0;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'timestamp':
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return filtered;
  }, [trades, filter, sortBy, sortOrder, searchTerm]);

  return (
    <Card darkMode={darkMode} className="trade-history-card">
      <div className="trade-history-header">
        <h2 className="section-title">
          📋 Trade History
        </h2>
        <div className="trade-history-controls">
          <input
            type="text"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="trade-search"
          />
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="trade-filter"
          >
            <option value="all">All Trades</option>
            <option value="open">Open Positions</option>
            <option value="pending">Pending Orders</option>
            <option value="closed">Closed Trades</option>
            <option value="profitable">Profitable</option>
            <option value="losing">Losing</option>
          </select>
        </div>
      </div>
      
      {filteredTrades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-title">No trades found</p>
          <p className="empty-subtitle">Execute some trades to see your history here</p>
        </div>
      ) : (
        <div className="trade-history-table-container">
          <table className="trade-history-table">
            <thead>
              <tr>
                <th className="table-header">Time</th>
                <th className="table-header">Pair</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Entry</th>
                <th className="table-header">Exit</th>
                <th className="table-header">P&L</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(trade => {
                const isOpen = trade.status === TRADE_STATUS.FILLED && !trade.exitPrice;
                const isPending = trade.status === TRADE_STATUS.PENDING;
                const profit = trade.profit || 0;
                
                return (
                  <tr 
                    key={trade.id}
                    className={`trade-row ${isOpen ? 'open' : profit > 0 ? 'profit' : profit < 0 ? 'loss' : ''}`}
                  >
                    <td className="trade-time">
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <div className="trade-date">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="trade-pair">
                      <div className="trade-direction-indicator">
                        <span className={`direction-badge ${trade.direction === TRADE_DIRECTION.BUY ? 'buy' : 'sell'}`}>
                          {trade.direction === TRADE_DIRECTION.BUY ? 'BUY' : 'SELL'}
                        </span>
                        <span className="pair-name">
                          {trade.pair}
                        </span>
                      </div>
                    </td>
                    <td className="trade-type">
                      {ORDER_TYPES.find(ot => ot.id === trade.orderType)?.name || trade.orderType}
                    </td>
                    <td className="trade-status">
                      <span className={`status-badge ${
                        isOpen ? 'open' : 
                        isPending ? 'pending' : 
                        profit > 0 ? 'profit' : 'loss'
                      }`}>
                        {isOpen ? 'OPEN' : 
                         isPending ? 'PENDING' : 
                         profit > 0 ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td className="trade-amount">
                      {formatNumber(trade.amount)}
                    </td>
                    <td className="trade-price">
                      {trade.entryPrice?.toFixed(5) || '-'}
                    </td>
                    <td className="trade-price">
                      {trade.exitPrice?.toFixed(5) || '-'}
                    </td>
                    <td className="trade-pnl">
                      {profit !== 0 ? (
                        <span className={`pnl-value ${profit > 0 ? 'profit' : 'loss'}`}>
                          {profit > 0 ? '▲' : '▼'}
                          ${Math.abs(profit).toFixed(2)}
                        </span>
                      ) : (
                        <span className="pnl-neutral">
                          -
                        </span>
                      )}
                    </td>
                    <td className="trade-actions">
                      {isOpen ? (
                        <button
                          onClick={() => onCloseTrade(trade.id, trade.entryPrice * (1 + (Math.random() - 0.5) * 0.02))}
                          className="action-button close"
                        >
                          Close
                        </button>
                      ) : isPending ? (
                        <button
                          onClick={() => onCancelOrder(trade.id)}
                          className="action-button cancel"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Summary */}
      <div className="trade-history-summary">
        <div>
          <div>Showing {filteredTrades.length} of {trades.length} trades</div>
          <div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div>
        </div>
        <div>
          <div>Total P&L: 
            <span className={`summary-pnl ${
              trades.reduce((sum, t) => sum + (t.profit || 0), 0) >= 0 ? 'profit' : 'loss'
            }`}>
              ${trades.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)}
            </span>
          </div>
          <div>Win Rate: {formatNumber(
            (trades.filter(t => t.profit > 0).length / 
            trades.filter(t => t.profit !== 0).length * 100 || 0), 
            1
          )}%</div>
        </div>
      </div>
    </Card>
  );
};

// =============== MAIN COMPONENT ===============
const LiveCurrencySimulator = () => {
  const [currencies, setCurrencies] = useState(CURRENCIES);
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem('forex-portfolio');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading portfolio:', e);
    }
    return {
      balance: 10000,
      initialBalance: 10000,
      currencies: {
        'USD': 10000,
        'EUR': 0,
        'GBP': 0,
        'JPY': 0,
        'NGN': 0,
        'GHS': 0
      },
      totalValue: 10000,
      dailyPnL: 0,
      totalPnL: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
  });
  
  const [trades, setTrades] = useLocalStorage('forex-trades', []);
  const [rateHistory, setRateHistory] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(TIME_FRAMES[1]);
  const [activeTab, setActiveTab] = useState('converter'); // Changed default to converter
  const [selectedPair, setSelectedPair] = useState('USD/EUR');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMarketData(currencies, setCurrencies, setRateHistory, setLastUpdate, selectedTimeFrame);

  // Save portfolio to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forex-portfolio', JSON.stringify(portfolio));
    } catch (e) {
      console.error('Error saving portfolio:', e);
    }
  }, [portfolio]);

  // Save dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (e) {
      console.error('Error saving dark mode:', e);
    }
  }, [darkMode]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExecuteTrade = (tradeData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const [fromCurrency, toCurrency] = tradeData.pair.split('/');
        const spread = TRADING_PAIRS.find(p => p.pair === tradeData.pair)?.spread || 0.0001;
        
        // Calculate execution price with slippage
        const slippage = Math.random() * 0.001;
        const executionPrice = tradeData.orderType === 'market' 
          ? tradeData.calculations.entryPrice * (1 + (Math.random() > 0.5 ? slippage : -slippage))
          : tradeData.limitPrice || tradeData.calculations.entryPrice;
        
        // Calculate spread cost
        const spreadCost = tradeData.amount * spread;
        
        // Update portfolio
        setPortfolio(prev => {
          const newPortfolio = { ...prev };
          const margin = tradeData.calculations.margin;
          
          if (tradeData.direction === TRADE_DIRECTION.BUY) {
            // Deduct margin and spread cost
            newPortfolio.balance -= (margin + spreadCost);
            // Add purchased currency
            newPortfolio.currencies[toCurrency] = 
              (newPortfolio.currencies[toCurrency] || 0) + tradeData.amount;
          } else {
            // Deduct sold currency
            newPortfolio.currencies[fromCurrency] -= tradeData.amount;
            // Add margin back to balance (seller receives margin when selling)
            newPortfolio.balance += margin - spreadCost;
          }
          
          return newPortfolio;
        });
        
        // Add trade to history
        const newTrade = {
          ...tradeData,
          entryPrice: executionPrice,
          spreadCost,
          status: tradeData.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
          profit: 0,
          margin: tradeData.calculations.margin
        };
        
        setTrades(prev => [newTrade, ...prev]);
        
        // Show notification
        showNotification(
          tradeData.orderType === 'market' 
            ? `Market ${tradeData.direction} order executed for ${tradeData.pair} at ${executionPrice.toFixed(5)}`
            : `Limit ${tradeData.direction} order placed for ${tradeData.pair}`,
          'success'
        );
      } catch (error) {
        console.error('Trade execution error:', error);
        showNotification('Trade execution failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleCloseTrade = (tradeId, exitPrice) => {
    try {
      setTrades(prev => prev.map(trade => {
        if (trade.id === tradeId && trade.status === TRADE_STATUS.FILLED && !trade.exitPrice) {
          const profit = TradingEngine.calculateProfitLoss(
            trade.amount,
            trade.entryPrice,
            exitPrice,
            trade.direction
          );
          
          // Update portfolio
          setPortfolio(prevPortfolio => {
            const newPortfolio = { ...prevPortfolio };
            const [fromCurrency, toCurrency] = trade.pair.split('/');
            
            if (trade.direction === TRADE_DIRECTION.BUY) {
              // Sell the purchased currency
              newPortfolio.currencies[toCurrency] -= trade.amount;
              // Add profit/loss and margin to balance
              newPortfolio.balance += trade.margin + profit;
            } else {
              // Return margin and profit/loss
              newPortfolio.balance += profit;
            }
            
            return newPortfolio;
          });
          
          showNotification(
            `Trade closed at ${exitPrice.toFixed(5)}. ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)}`,
            profit >= 0 ? 'success' : 'error'
          );
          
          return {
            ...trade,
            exitPrice,
            profit,
            status: TRADE_STATUS.FILLED,
            closedAt: new Date().toISOString()
          };
        }
        return trade;
      }));
    } catch (error) {
      console.error('Error closing trade:', error);
      showNotification('Failed to close trade', 'error');
    }
  };

  const handleCancelOrder = (tradeId) => {
    try {
      setTrades(prev => prev.map(trade => {
        if (trade.id === tradeId && trade.status === TRADE_STATUS.PENDING) {
          // Refund margin
          setPortfolio(prevPortfolio => ({
            ...prevPortfolio,
            balance: prevPortfolio.balance + trade.margin
          }));
          
          showNotification('Order cancelled successfully', 'info');
          
          return {
            ...trade,
            status: TRADE_STATUS.CANCELLED,
            cancelledAt: new Date().toISOString()
          };
        }
        return trade;
      }));
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification('Failed to cancel order', 'error');
    }
  };

  const resetPortfolio = () => {
    if (window.confirm('Are you sure you want to reset your portfolio? All trades will be cleared.')) {
      try {
        setPortfolio({
          balance: 10000,
          initialBalance: 10000,
          currencies: {
            'USD': 10000,
            'EUR': 0,
            'GBP': 0,
            'JPY': 0,
            'NGN': 0,
            'GHS': 0
          },
          totalValue: 10000,
          dailyPnL: 0,
          totalPnL: 0,
          winRate: 0,
          maxDrawdown: 0,
          sharpeRatio: 0
        });
        setTrades([]);
        showNotification('Portfolio reset successfully', 'info');
      } catch (error) {
        showNotification('Failed to reset portfolio', 'error');
      }
    }
  };

  const exportTrades = () => {
    try {
      const dataStr = JSON.stringify(trades, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forex-trades-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('Trades exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export trades', 'error');
    }
  };

  const currentPairRate = useMemo(() => {
    const [base, quote] = selectedPair.split('/');
    return TradingEngine.calculatePairRate(base, quote, currencies);
  }, [selectedPair, currencies]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            {[
              { id: 'converter', label: '💱 Converter', icon: '💱' },
              { id: 'trade', label: '🚀 Trade', icon: '🚀' },
              { id: 'portfolio', label: '💼 Portfolio', icon: '💼' },
              { id: 'history', label: '📋 History', icon: '📋' },
              { id: 'orders', label: '📊 Order Book', icon: '📊' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-tab-button ${activeTab === id ? 'active' : ''}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">
              🚀 Advanced Forex Trading Platform
            </h1>
            <p className="app-subtitle">
              <span>Professional trading with risk management & currency conversion</span>
              <span className="subtitle-separator">•</span>
              <span>Live Market</span>
              <span className="subtitle-separator">•</span>
              <span>Portfolio: ${formatNumber(portfolio.totalValue)}</span>
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="header-button theme-toggle"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
            <button
              onClick={resetPortfolio}
              className="header-button reset-button"
              title="Reset Portfolio"
            >
              🔄 Reset
            </button>
            <button
              onClick={exportTrades}
              className="header-button export-button"
              title="Export Trades"
            >
              📥 Export
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs - Desktop */}
        <div className="tabs-container">
          {[
            { id: 'converter', label: '💱 Converter', icon: '💱' },
            { id: 'trade', label: '🚀 Trade', icon: '🚀' },
            { id: 'portfolio', label: '💼 Portfolio', icon: '💼' },
            { id: 'history', label: '📋 History', icon: '📋' },
            { id: 'orders', label: '📊 Order Book', icon: '📊' }
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-button ${activeTab === id ? 'active' : ''}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        
        {/* Time Frame Selector */}
        <div className="timeframe-selector">
          <label className="timeframe-label">
            Time Frame:
          </label>
          <div className="timeframe-buttons">
            {TIME_FRAMES.map(tf => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeFrame(tf)}
                className={`timeframe-button ${selectedTimeFrame.label === tf.label ? 'active' : ''}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'converter' && (
          <CurrencyConverter
            currencies={currencies}
            darkMode={darkMode}
          />
        )}
        
        {activeTab === 'trade' && (
          <div className="trade-panel-grid">
            {/* Trading Panel */}
            <AdvancedTradePanel
              portfolio={portfolio}
              currencies={currencies}
              onExecuteTrade={handleExecuteTrade}
              darkMode={darkMode}
              pair={selectedPair}
              onPairChange={setSelectedPair}
            />
            
            {/* Chart Section */}
            <div className="chart-section">
              <Card darkMode={darkMode} className="chart-card">
                <h2 className="section-title">
                  📈 {selectedPair} - Live Chart
                </h2>
                <div className="chart-container">
                  <svg width="100%" height="100%" className="chart-svg">
                    {/* Grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line
                        key={`h${i}`}
                        x1="0"
                        y1={(i + 1) * 60}
                        x2="100%"
                        y2={(i + 1) * 60}
                        className="chart-grid-line"
                      />
                    ))}
                    
                    {/* Price line */}
                    <path
                      d={(() => {
                        const points = Array.from({ length: 50 }, (_, i) => {
                          const x = (i / 49) * 100;
                          const y = 50 + Math.sin(i * 0.5) * 40 + Math.random() * 20;
                          return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
                        }).join(' ');
                        return points;
                      })()}
                      className="chart-line"
                    />
                  </svg>
                  
                  <div className="chart-info">
                    <div className="current-price">
                      Current: {currentPairRate.toFixed(5)}
                    </div>
                    <div className="chart-update-time">
                      Last update: {lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Card>
              
              <OrderBook
                pair={selectedPair}
                currencies={currencies}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'portfolio' && (
          <div className="portfolio-grid">
            <PortfolioDashboard
              portfolio={portfolio}
              trades={trades}
              darkMode={darkMode}
            />
            
            {/* Risk Management Dashboard */}
            <Card darkMode={darkMode} className="risk-dashboard-card">
              <h2 className="section-title">
                🛡️ Risk Management
              </h2>
              
              {/* Risk Metrics */}
              <div className="risk-metrics-grid">
                <div className="risk-metric-card" style={{ borderColor: '#10b981' }}>
                  <div className="risk-metric-label">Max Drawdown</div>
                  <div className="risk-metric-value" style={{ color: '#10b981' }}>
                    2.5%
                  </div>
                </div>
                
                <div className="risk-metric-card" style={{ borderColor: '#f59e0b' }}>
                  <div className="risk-metric-label">Sharpe Ratio</div>
                  <div className="risk-metric-value" style={{ color: '#f59e0b' }}>
                    1.8
                  </div>
                </div>
                
                <div className="risk-metric-card" style={{ borderColor: '#3b82f6' }}>
                  <div className="risk-metric-label">Volatility</div>
                  <div className="risk-metric-value" style={{ color: '#3b82f6' }}>
                    15%
                  </div>
                </div>
                
                <div className="risk-metric-card" style={{ borderColor: '#8b5cf6' }}>
                  <div className="risk-metric-label">Value at Risk</div>
                  <div className="risk-metric-value" style={{ color: '#8b5cf6' }}>
                    $250
                  </div>
                </div>
              </div>
              
              {/* Risk Controls */}
              <div className="risk-controls-section">
                <h3 className="section-subtitle">
                  ⚙️ Risk Controls
                </h3>
                <div className="risk-controls-list">
                  {RISK_LEVELS.map(level => (
                    <div 
                      key={level.id}
                      className="risk-control-item"
                    >
                      <div>
                        <div className="risk-control-name" style={{ color: level.color }}>{level.name}</div>
                        <div className="risk-control-details">
                          Max Position: {(level.maxPositionSize * 100).toFixed(1)}% • Max Loss: {(level.maxLossPerTrade * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div 
                        className="risk-control-indicator"
                        style={{ backgroundColor: level.color }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'history' && (
          <AdvancedTradeHistory
            trades={trades}
            onCloseTrade={handleCloseTrade}
            onCancelOrder={handleCancelOrder}
            darkMode={darkMode}
          />
        )}
        
        {activeTab === 'orders' && (
          <OrderBook
            pair={selectedPair}
            currencies={currencies}
            darkMode={darkMode}
          />
        )}
      </div>

      <GlobalStyles />
    </div>
  );
};

const GlobalStyles = () => (
  <>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px !important;
        }
        
        input, select, button {
          font-family: inherit;
        }
        
        /* Base Styles */
        .app-container {
          background-color: var(--bg-color);
          color: var(--text-color);
          min-height: 100vh;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          transition: background-color 0.3s, color 0.3s;
        }
        
        .app-container.dark {
          --bg-color: #0f172a;
          --text-color: #ffffff;
          --card-bg: #1e293b;
          --card-border: #334155;
          --input-bg: #0f172a;
          --input-border: #334155;
          --hover-bg: #334155;
        }
        
        .app-container.light {
          --bg-color: #f8fafc;
          --text-color: #1e293b;
          --card-bg: white;
          --card-border: #e2e8f0;
          --input-bg: #f8fafc;
          --input-border: #e2e8f0;
          --hover-bg: #f1f5f9;
        }
        
        /* Header Styles */
        .app-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .app-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 700;
        }
        
        .app-subtitle {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .subtitle-separator {
          opacity: 0.6;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        /* Button Styles */
        .header-button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .header-button:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.05);
        }
        
        .theme-toggle {
          width: 40px;
          height: 40px;
          padding: 0;
          justify-content: center;
        }
        
        .reset-button {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .export-button {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        /* Tabs */
        .tabs-container {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .tab-button {
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .tab-button:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        
        .tab-button.active {
          background: rgba(255,255,255,0.3);
        }
        
        /* Time Frame Selector */
        .timeframe-selector {
          margin-top: 15px;
        }
        
        .timeframe-label {
          font-size: 12px;
          opacity: 0.8;
          margin-right: 10px;
        }
        
        .timeframe-buttons {
          display: flex;
          gap: 5px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        
        .timeframe-button {
          padding: 4px 12px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 20px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .timeframe-button:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .timeframe-button.active {
          background: rgba(255,255,255,0.3);
        }
        
        /* Main Content */
        .main-content {
          max-width: 100%;
          overflow-x: hidden;
        }
        
        /* Converter Styles */
        .converter-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .converter-main {
          grid-column: 1 / -1;
        }
        
        .converter-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .converter-input-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .swap-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .swap-button {
          padding: 16px;
          background: var(--hover-bg);
          border: none;
          border-radius: 50%;
          color: #667eea;
          cursor: pointer;
          font-size: 24px;
          transition: all 0.3s ease;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .swap-button:hover {
          transform: rotate(180deg);
          background: #667eea;
          color: white;
        }
        
        /* Input Styles */
        .input-label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-color);
          opacity: 0.8;
          font-size: 14px;
          font-weight: 500;
        }
        
        .currency-select-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .select-wrapper {
          flex: 1;
          position: relative;
        }
        
        .currency-select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 16px;
          font-weight: 600;
        }
        
        .select-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.6;
        }
        
        .favorite-button {
          padding: 12px;
          background: var(--hover-bg);
          border: none;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s ease;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .favorite-button.active {
          color: #fbbf24;
        }
        
        .favorite-button:hover {
          transform: scale(1.1);
        }
        
        .amount-input-wrapper {
          position: relative;
        }
        
        .amount-input {
          width: 100%;
          padding: 16px 20px;
          padding-left: 60px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 24px;
          font-weight: 700;
          transition: all 0.2s ease;
        }
        
        .currency-code {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          font-weight: 600;
          font-size: 16px;
        }
        
        .converted-amount-display {
          position: relative;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 16px 20px;
          padding-left: 60px;
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
          min-height: 64px;
          display: flex;
          align-items: center;
        }
        
        /* Quick Amounts */
        .quick-amounts-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        .quick-amount-button {
          padding: 10px 20px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 20px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .quick-amount-button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .quick-amount-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
        }
        
        /* Rate Details */
        .rate-details {
          background: var(--input-bg);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          margin-bottom: 20px;
        }
        
        .rate-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin-top: 10px;
        }
        
        .rate-label {
          color: var(--text-color);
          opacity: 0.7;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .rate-value {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .rate-value.inverse {
          color: #10b981;
        }
        
        /* Favorites Grid */
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }
        
        .currency-button {
          padding: 12px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .currency-button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .currency-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .currency-flag {
          font-size: 20px;
        }
        
        .currency-code-text {
          font-weight: 600;
          font-size: 16px;
        }
        
        .currency-rate {
          font-size: 11px;
          opacity: 0.7;
        }
        
        /* Quick Conversions */
        .quick-conversions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .quick-conversion-button {
          padding: 12px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .quick-conversion-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .conversion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .conversion-pair {
          font-size: 16px;
          font-weight: 600;
        }
        
        .conversion-rate {
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }
        
        .conversion-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          opacity: 0.7;
        }
        
        /* History Table */
        .history-table-container {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .history-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table-header {
          padding: 8px;
          text-align: left;
          color: var(--text-color);
          opacity: 0.7;
          font-size: 11px;
          font-weight: 600;
          background: var(--card-bg);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .history-row {
          border-bottom: 1px solid var(--input-border);
          transition: background-color 0.2s;
        }
        
        .history-row:hover {
          background-color: rgba(102, 126, 234, 0.1);
        }
        
        .history-time {
          padding: 8px;
          font-size: 11px;
          opacity: 0.7;
          white-space: nowrap;
        }
        
        .history-currency {
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .history-amount {
          padding: 8px;
          font-size: 12px;
        }
        
        .history-result {
          padding: 8px;
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
        }
        
        /* Empty States */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          opacity: 0.5;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .empty-title {
          font-size: 18px;
          margin-bottom: 10px;
          font-weight: 500;
        }
        
        .empty-subtitle {
          font-size: 12px;
        }
        
        /* Clear History Button */
        .clear-history-button {
          width: 100%;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          margin-top: 15px;
          transition: all 0.2s ease;
        }
        
        .clear-history-button:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }
        
        /* Trade Panel */
        .trade-panel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .chart-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .trade-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .section-title {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #667eea;
          font-size: 20px;
          font-weight: 600;
        }
        
        .section-subtitle {
          margin: 0 0 15px 0;
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .trade-panel-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .balance-display {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .toggle-button {
          padding: 6px 12px;
          background: var(--hover-bg);
          border: none;
          border-radius: 6px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .toggle-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Pair Selector */
        .pair-selector {
          margin-bottom: 20px;
        }
        
        .pairs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }
        
        .pair-button {
          padding: 12px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .pair-button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .pair-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .pair-name {
          font-size: 16px;
          font-weight: 600;
        }
        
        .pair-spread {
          font-size: 12px;
          opacity: 0.8;
        }
        
        /* Current Rate Display */
        .current-rate-display {
          margin-bottom: 20px;
          padding: 15px;
          background: var(--input-bg);
          border-radius: 8px;
          border: 1px solid var(--input-border);
        }
        
        .rate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .rate-label {
          color: var(--text-color);
          opacity: 0.8;
          font-size: 14px;
        }
        
        .rate-value-large {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }
        
        .rate-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.7;
        }
        
        /* Direction Buttons */
        .direction-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .direction-button {
          padding: 12px;
          background: var(--hover-bg);
          border: none;
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .direction-button.active.buy {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        
        .direction-button.active.sell {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        
        .direction-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        /* Order Type Grid */
        .order-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        
        .order-type-button {
          padding: 12px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .order-type-button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .order-type-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .order-icon {
          font-size: 18px;
        }
        
        .order-info {
          text-align: center;
        }
        
        .order-name {
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .order-fee {
          font-size: 11px;
          opacity: 0.8;
        }
        
        /* Amount Section */
        .amount-section {
          margin-bottom: 20px;
        }
        
        .amount-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .available-amount {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .trade-amount-input {
          width: 100%;
          padding: 12px 16px;
          padding-left: 40px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .amount-currency {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          font-weight: 600;
        }
        
        .quick-trade-amount-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        
        .quick-trade-amount-button {
          padding: 6px 12px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 20px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .quick-trade-amount-button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .quick-trade-amount-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Advanced Settings */
        .advanced-setting {
          margin-bottom: 20px;
        }
        
        .advanced-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .risk-management-section {
          margin-bottom: 20px;
        }
        
        .risk-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .risk-label {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 4px;
          display: block;
          font-weight: 500;
        }
        
        .risk-input {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .risk-level-section {
          margin-top: 10px;
        }
        
        .risk-level-buttons {
          display: flex;
          gap: 8px;
        }
        
        .risk-level-button {
          flex: 1;
          padding: 8px;
          background: var(--hover-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .risk-level-button.active {
          color: white;
          border-color: transparent;
        }
        
        .risk-level-button:hover {
          transform: translateY(-1px);
        }
        
        .leverage-section {
          margin-top: 10px;
        }
        
        .trade-slider {
          width: 100%;
          height: 6px;
          background: var(--hover-bg);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }
        
        .trade-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }
        
        .trade-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }
        
        /* Trade Summary */
        .trade-summary {
          background: var(--input-bg);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid var(--input-border);
        }
        
        .trade-summary.valid {
          border-color: #10b981;
        }
        
        .trade-summary.invalid {
          border-color: #ef4444;
        }
        
        .summary-title {
          margin: 0 0 10px 0;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .valid-badge {
          font-size: 10px;
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          font-size: 12px;
        }
        
        .summary-label {
          color: var(--text-color);
          opacity: 0.7;
          margin-bottom: 2px;
        }
        
        .summary-value {
          font-weight: 600;
        }
        
        .summary-value.primary {
          color: #667eea;
        }
        
        .summary-value.success {
          color: #10b981;
        }
        
        .summary-value.warning {
          color: #f59e0b;
        }
        
        .summary-value.error {
          color: #ef4444;
        }
        
        /* Error Messages */
        .error-messages {
          background: rgba(239, 68, 68, 0.1);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #ef4444;
        }
        
        .error-title {
          margin: 0 0 8px 0;
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .error-list {
          margin: 0;
          padding-left: 20px;
          font-size: 12px;
          color: #ef4444;
          line-height: 1.5;
        }
        
        /* Execute Button */
        .execute-button {
          width: 100%;
          padding: 16px;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .execute-button.buy {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .execute-button.sell {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .execute-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .execute-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
        
        /* Chart Styles */
        .chart-container {
          width: 100%;
          height: 300px;
          background: var(--input-bg);
          border-radius: 8px;
          border: 1px solid var(--input-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-color);
          opacity: 0.7;
          position: relative;
          overflow: hidden;
        }
        
        .chart-svg {
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .chart-grid-line {
          stroke: var(--input-border);
          stroke-width: 1;
        }
        
        .chart-line {
          fill: none;
          stroke: #667eea;
          stroke-width: 2;
        }
        
        .chart-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.8);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
        }
        
        .current-price {
          font-weight: 600;
          color: #667eea;
        }
        
        .chart-update-time {
          opacity: 0.7;
        }
        
        /* Order Book */
        .order-book-card {
          height: 100%;
        }
        
        .order-book-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        
        .order-book-header {
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          padding: 0 8px;
        }
        
        .ask-header {
          color: #ef4444;
        }
        
        .order-book-row {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 12px;
          align-items: center;
        }
        
        .bid-price {
          color: #10b981;
          font-weight: 500;
        }
        
        .ask-price {
          color: #ef4444;
          font-weight: 500;
        }
        
        .order-volume {
          color: var(--text-color);
          opacity: 0.8;
        }
        
        /* Portfolio Dashboard */
        .portfolio-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .metric-card {
          padding: 15px;
          background: var(--input-bg);
          border-radius: 8px;
          text-align: center;
          border: 1px solid var(--input-border);
        }
        
        .metric-label {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 8px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
        }
        
        .holdings-section {
          margin-bottom: 20px;
        }
        
        .holdings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
        
        .holding-item {
          padding: 12px;
          background: var(--input-bg);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s ease;
        }
        
        .holding-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .holding-currency {
          font-weight: 700;
          font-size: 16px;
          color: #667eea;
        }
        
        .holding-name {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .holding-details {
          text-align: right;
        }
        
        .holding-amount {
          font-weight: 700;
          font-size: 14px;
        }
        
        .holding-value {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .portfolio-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 15px;
          border-top: 1px solid var(--input-border);
          opacity: 0.7;
          font-size: 12px;
        }
        
        /* Risk Dashboard */
        .risk-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .risk-metric-card {
          padding: 15px;
          background: var(--input-bg);
          border-radius: 8px;
          text-align: center;
          border: 1px solid;
        }
        
        .risk-controls-section {
          margin-bottom: 20px;
        }
        
        .risk-controls-list {
          background: var(--input-bg);
          padding: 15px;
          border-radius: 8px;
        }
        
        .risk-control-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: var(--card-bg);
          border-radius: 6px;
          margin-bottom: 8px;
          transition: transform 0.2s ease;
        }
        
        .risk-control-item:hover {
          transform: translateX(5px);
        }
        
        .risk-control-name {
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .risk-control-details {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .risk-control-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--card-bg);
        }
        
        /* Trade History */
        .trade-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .trade-history-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .trade-search {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 12px;
          min-width: 200px;
        }
        
        .trade-filter {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 12px;
        }
        
        .trade-history-table-container {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .trade-history-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .trade-row.open {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .trade-row.profit {
          background-color: rgba(16, 185, 129, 0.1);
        }
        
        .trade-row.loss {
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        .trade-row:hover {
          background-color: rgba(102, 126, 234, 0.1);
        }
        
        .trade-time {
          padding: 12px;
          font-size: 12px;
          opacity: 0.8;
          white-space: nowrap;
        }
        
        .trade-date {
          font-size: 11px;
          opacity: 0.6;
        }
        
        .trade-direction-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .direction-badge {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
        
        .direction-badge.sell {
          background: #ef4444;
        }
        
        .pair-name {
          font-size: 12px;
          font-weight: 600;
        }
        
        .trade-type {
          padding: 12px;
          font-size: 12px;
          opacity: 0.7;
        }
        
        .trade-status {
          padding: 12px;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          display: inline-block;
          min-width: 70px;
          text-align: center;
        }
        
        .status-badge.open {
          background: #3b82f6;
        }
        
        .status-badge.pending {
          background: #f59e0b;
        }
        
        .status-badge.profit {
          background: #10b981;
        }
        
        .status-badge.loss {
          background: #ef4444;
        }
        
        .trade-amount {
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .trade-price {
          padding: 12px;
          font-size: 12px;
          opacity: 0.7;
        }
        
        .trade-pnl {
          padding: 12px;
        }
        
        .pnl-value {
          font-weight: 600;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        .pnl-value.profit {
          color: #10b981;
        }
        
        .pnl-value.loss {
          color: #ef4444;
        }
        
        .pnl-neutral {
          opacity: 0.7;
          font-size: 12px;
        }
        
        .trade-actions {
          padding: 12px;
        }
        
        .action-button {
          padding: 6px 12px;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .action-button.close {
          background: #ef4444;
        }
        
        .action-button.cancel {
          background: #f59e0b;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .trade-history-summary {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--input-border);
          opacity: 0.7;
          font-size: 12px;
        }
        
        .summary-pnl {
          font-weight: 600;
          margin-left: 5px;
        }
        
        .summary-pnl.profit {
          color: #10b981;
        }
        
        .summary-pnl.loss {
          color: #ef4444;
        }
        
        /* Mobile Menu */
        .mobile-menu-button {
          display: none;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          width: 50px;
          height: 50px;
          font-size: 24px;
          cursor: pointer;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
        }
        
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: var(--card-bg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          box-shadow: -4px 0 20px rgba(0,0,0,0.1);
        }
        
        .mobile-tab-button {
          padding: 15px;
          background: var(--hover-bg);
          border: none;
          border-radius: 8px;
          color: var(--text-color);
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .mobile-tab-button.active {
          background: #667eea;
          color: white;
        }
        
        .mobile-tab-button:hover {
          transform: translateX(-5px);
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.8);
        }
        
        /* Responsive Breakpoints */
        @media (min-width: 640px) {
          .rate-details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .summary-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .order-book-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (min-width: 768px) {
          .converter-grid {
            grid-template-columns: 2fr 1fr;
          }
          
          .converter-input-section {
            grid-template-columns: 1fr auto 1fr;
          }
          
          .trade-panel-grid {
            grid-template-columns: 400px 1fr;
          }
          
          .portfolio-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (min-width: 1024px) {
          .converter-grid {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas: 
              "main main sidebar"
              "history history sidebar";
          }
          
          .converter-main {
            grid-area: main;
          }
          
          .converter-sidebar {
            grid-area: sidebar;
          }
          
          .history-card {
            grid-area: history;
          }
          
          .trade-panel-grid {
            grid-template-columns: minmax(400px, 1fr) minmax(500px, 2fr);
          }
        }
        
        @media (max-width: 768px) {
          .app-title {
            font-size: 20px;
          }
          
          .app-subtitle {
            font-size: 12px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          
          .tabs-container {
            display: none;
          }
          
          .mobile-menu-button {
            display: flex;
          }
          
          .mobile-menu-overlay {
            display: block;
          }
          
          .trade-history-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .trade-history-controls {
            width: 100%;
          }
          
          .trade-search {
            min-width: 0;
            flex: 1;
          }
          
          .trade-filter {
            flex: 1;
          }
        }
        
        @media (max-width: 640px) {
          .app-container {
            padding: 10px;
          }
          
          .app-header {
            padding: 15px;
          }
          
          .section-title {
            font-size: 18px;
          }
          
          .amount-input {
            font-size: 20px;
          }
          
          .converted-amount-display {
            font-size: 20px;
          }
          
          .rate-value {
            font-size: 18px;
          }
          
          .rate-value-large {
            font-size: 20px;
          }
          
          .metric-value {
            font-size: 20px;
          }
          
          .risk-metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .trade-history-table {
            font-size: 11px;
          }
          
          .trade-time, .trade-date, .trade-type, .trade-amount, .trade-price, .trade-pnl {
            padding: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .converter-input-section {
            gap: 15px;
          }
          
          .swap-button {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          
          .amount-input {
            padding: 12px 20px;
            padding-left: 50px;
            font-size: 18px;
          }
          
          .currency-code {
            left: 15px;
            font-size: 14px;
          }
          
          .converted-amount-display {
            padding: 12px 20px;
            padding-left: 50px;
            font-size: 18px;
            min-height: 56px;
          }
          
          .direction-buttons {
            grid-template-columns: 1fr;
          }
          
          .order-type-grid {
            grid-template-columns: 1fr;
          }
          
          .risk-inputs-grid {
            grid-template-columns: 1fr;
          }
          
          .risk-level-buttons {
            flex-direction: column;
          }
          
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
          
          .quick-conversions-grid {
            grid-template-columns: 1fr;
          }
          
          .trade-history-controls {
            flex-direction: column;
          }
        }
      `}
    </style>
    <footer className="app-footer" align="center">
      © <span>{new Date().getFullYear()}</span> ASAP~PRICE. All rights reserved.
      <br/>
      <span>Powered By Royzeenet</span>
    </footer>
  </>
);

export default LiveCurrencySimulator;
