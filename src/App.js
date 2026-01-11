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
    <div style={{
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

const Card = ({ children, darkMode, style = {} }) => (
  <div style={{
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Left Column: Converter */}
      <Card darkMode={darkMode} style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            marginTop: 0, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            color: '#667eea',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            💱 Currency Converter
          </h2>
          <button
            onClick={handleSaveConversion}
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
            className="header-button"
          >
            💾 Save Conversion
          </button>
        </div>

        {/* Converter Input Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          gap: '20px',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          {/* From Currency */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: darkMode ? '#cbd5e1' : '#475569', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              From
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ 
                flex: 1,
                position: 'relative'
              }}>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: 'inherit',
                    fontSize: '16px',
                    fontWeight: '600',
                    appearance: 'none'
                  }}
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: darkMode ? '#94a3b8' : '#64748b'
                }}>
                  ▼
                </div>
              </div>
              {!favorites.includes(fromCurrency) ? (
                <button
                  onClick={() => handleAddToFavorites(fromCurrency)}
                  style={{
                    padding: '12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Add to favorites"
                >
                    ⭐
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveFromFavorites(fromCurrency)}
                  style={{
                    padding: '12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Remove from favorites"
                >
                    ★
                </button>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  paddingLeft: '60px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  color: 'inherit',
                  fontSize: '24px',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
                min="0"
                step="0.01"
              />
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#667eea',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {fromCurrency}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <button
              onClick={handleSwapCurrencies}
              disabled={isSwapping}
              style={{
                padding: '16px',
                background: darkMode ? '#334155' : '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '24px',
                transition: 'all 0.3s ease',
                transform: isSwapping ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
              title="Swap currencies"
            >
              🔄
            </button>
            <div style={{
              fontSize: '12px',
              color: darkMode ? '#94a3b8' : '#64748b',
              textAlign: 'center'
            }}>
              1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
            </div>
          </div>

          {/* To Currency */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: darkMode ? '#cbd5e1' : '#475569', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              To
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ 
                flex: 1,
                position: 'relative'
              }}>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: 'inherit',
                    fontSize: '16px',
                    fontWeight: '600',
                    appearance: 'none'
                  }}
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: darkMode ? '#94a3b8' : '#64748b'
                }}>
                  ▼
                </div>
              </div>
              {!favorites.includes(toCurrency) ? (
                <button
                  onClick={() => handleAddToFavorites(toCurrency)}
                  style={{
                    padding: '12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Add to favorites"
                >
                    ⭐
                </button>
              ) : (
                <button
                  onClick={() => handleRemoveFromFavorites(toCurrency)}
                  style={{
                    padding: '12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Remove from favorites"
                >
                    ★
                </button>
              )}
            </div>
            
            <div style={{ 
              position: 'relative',
              background: darkMode ? '#0f172a' : '#f8fafc',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '16px 20px',
              paddingLeft: '60px',
              fontSize: '24px',
              fontWeight: '700',
              color: '#10b981',
              minHeight: '64px'
            }}>
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {toCurrency}
              </div>
              {formatNumber(convertedAmount, 6)}
            </div>
          </div>
        </div>

        {/* Quick Amounts */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            color: darkMode ? '#cbd5e1' : '#475569', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Quick Amounts ({fromCurrency})
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px' 
          }}>
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => handleQuickAmount(quickAmount)}
                style={{
                  padding: '10px 20px',
                  background: amount === quickAmount 
                    ? '#667eea' 
                    : (darkMode ? '#334155' : '#f1f5f9'),
                  border: amount === quickAmount 
                    ? '2px solid #667eea' 
                    : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '20px',
                  color: amount === quickAmount ? 'white' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                className="quick-amount-button"
              >
                {quickAmount >= 1000 ? formatLargeNumber(quickAmount) : formatNumber(quickAmount)}
              </button>
            ))}
          </div>
        </div>

        {/* Exchange Rate Details */}
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '15px', 
            color: '#667eea', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📊 Exchange Rate Details
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>Current Rate</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>Inverse Rate</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                1 {toCurrency} = {inverseRate.toFixed(6)} {fromCurrency}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Column: Favorites & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Favorite Currencies */}
        <Card darkMode={darkMode}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '15px', 
            color: '#667eea', 
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⭐ Favorite Currencies
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '10px'
          }}>
            {favoriteCurrencies.map(currency => (
              <button
                key={currency.code}
                onClick={() => {
                  setFromCurrency(currency.code);
                  if (toCurrency === currency.code) {
                    // If trying to convert to same currency, switch to USD
                    setToCurrency('USD');
                  }
                }}
                style={{
                  padding: '12px',
                  background: fromCurrency === currency.code 
                    ? '#667eea' 
                    : (darkMode ? '#334155' : '#f1f5f9'),
                  border: fromCurrency === currency.code 
                    ? '2px solid #667eea' 
                    : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  color: fromCurrency === currency.code ? 'white' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                className="currency-button"
              >
                <div style={{ fontSize: '20px' }}>{currency.flag}</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{currency.code}</div>
                  <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {formatNumber(currency.rate, 4)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {favoriteCurrencies.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: darkMode ? '#94a3b8' : '#64748b' 
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }}>⭐</div>
              <p>No favorite currencies yet</p>
              <p style={{ fontSize: '12px' }}>Click the star button to add favorites</p>
            </div>
          )}
        </Card>

        {/* Quick Conversions */}
        <Card darkMode={darkMode}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '15px', 
            color: '#667eea', 
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚡ Quick Conversions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px'
          }}>
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
                  style={{
                    padding: '12px',
                    background: darkMode ? '#334155' : '#f1f5f9',
                    border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  className="quick-conversion-button"
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                      {pair.from} → {pair.to}
                    </span>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                      {rate.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: darkMode ? '#94a3b8' : '#64748b'
                  }}>
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
      <Card darkMode={darkMode}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '15px', 
          color: '#667eea', 
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📋 Recent Conversions
        </h3>
        {conversionHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: darkMode ? '#94a3b8' : '#64748b' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📊</div>
            <p style={{ fontSize: '14px' }}>No conversion history yet</p>
            <p style={{ fontSize: '12px' }}>Convert currencies to see history here</p>
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  position: 'sticky',
                  top: 0,
                  background: darkMode ? '#1e293b' : 'white'
                }}>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>Time</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>From</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>To</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>Amount</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'left', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {conversionHistory.map((conversion) => (
                  <tr 
                    key={conversion.id}
                    style={{ 
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      transition: 'background-color 0.2s'
                    }}
                    className="history-row"
                  >
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '11px', 
                      color: darkMode ? '#94a3b8' : '#64748b',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(conversion.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {currencies.find(c => c.code === conversion.from)?.flag}
                      {conversion.from}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {currencies.find(c => c.code === conversion.to)?.flag}
                      {conversion.to}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '12px'
                    }}>
                      {formatNumber(conversion.amount, 2)}
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '12px',
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
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
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              marginTop: '15px',
              transition: 'all 0.2s ease'
            }}
            className="clear-history-button"
          >
            🗑️ Clear History
          </button>
        )}
      </Card>
    </div>
  );
};

// =============== TRADING COMPONENTS (truncated for brevity) ===============
const CurrencyPairSelector = ({ selectedPair, onSelect, darkMode }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ 
      display: 'block', 
      marginBottom: '8px', 
      color: darkMode ? '#cbd5e1' : '#475569', 
      fontSize: '14px',
      fontWeight: '500'
    }}>
      Select Trading Pair
    </label>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
      gap: '10px' 
    }}>
      {TRADING_PAIRS.map(({ pair, spread }) => (
        <button
          key={pair}
          onClick={() => onSelect(pair)}
          style={{
            padding: '12px',
            background: selectedPair === pair 
              ? (darkMode ? '#667eea' : '#667eea')
              : (darkMode ? '#334155' : '#f1f5f9'),
            border: selectedPair === pair 
              ? '2px solid #667eea' 
              : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: selectedPair === pair ? 'white' : 'inherit',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          className="pair-button"
        >
          <span style={{ fontSize: '16px', fontWeight: '600' }}>{pair}</span>
          <span style={{ 
            fontSize: '12px', 
            color: selectedPair === pair ? 'rgba(255,255,255,0.8)' : '#94a3b8' 
          }}>
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
    <Card darkMode={darkMode}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '15px', 
        color: '#667eea',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        📊 Order Book - {pair}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Bids */}
        <div>
          <div style={{ 
            color: '#10b981', 
            fontSize: '12px', 
            fontWeight: '600',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <span>Bid (Buy)</span>
            <span>Volume</span>
          </div>
          {bids.map((bid, i) => (
            <div 
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: darkMode 
                  ? `linear-gradient(to left, rgba(16, 185, 129, 0.15) ${(bid.total / maxVolume) * 100}%, transparent 0%)`
                  : `linear-gradient(to left, rgba(16, 185, 129, 0.1) ${(bid.total / maxVolume) * 100}%, transparent 0%)`,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '12px',
                alignItems: 'center'
              }}
            >
              <span style={{ color: '#10b981', fontWeight: '500' }}>{bid.price.toFixed(5)}</span>
              <span style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>{bid.volume.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        {/* Asks */}
        <div>
          <div style={{ 
            color: '#ef4444', 
            fontSize: '12px', 
            fontWeight: '600',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <span>Ask (Sell)</span>
            <span>Volume</span>
          </div>
          {asks.map((ask, i) => (
            <div 
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                background: darkMode
                  ? `linear-gradient(to left, rgba(239, 68, 68, 0.15) ${(ask.total / maxVolume) * 100}%, transparent 0%)`
                  : `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${(ask.total / maxVolume) * 100}%, transparent 0%)`,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '12px',
                alignItems: 'center'
              }}
            >
              <span style={{ color: '#ef4444', fontWeight: '500' }}>{ask.price.toFixed(5)}</span>
              <span style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>{ask.volume.toFixed(2)}</span>
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
    <Card darkMode={darkMode}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ 
          marginTop: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          color: '#667eea',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          🚀 Advanced Trading
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
            Balance: ${formatNumber(portfolio.balance)}
          </span>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: '6px 12px',
              background: darkMode ? '#334155' : '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
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
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        background: darkMode ? '#0f172a' : '#f8fafc',
        borderRadius: '8px',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: darkMode ? '#cbd5e1' : '#475569', 
            fontSize: '14px' 
          }}>
            Current Rate:
          </span>
          <span style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#667eea'
          }}>
            {currentRate.toFixed(6)}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: darkMode ? '#94a3b8' : '#64748b'
        }}>
          <span>Spread: {(TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0).toFixed(4)}</span>
          <span>Min Trade: {TRADING_PAIRS.find(p => p.pair === pair)?.minTrade || 100}</span>
        </div>
      </div>
      
      {/* Trade Direction */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          color: darkMode ? '#cbd5e1' : '#475569', 
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Direction
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.BUY }))}
            style={{
              flex: 1,
              padding: '12px',
              background: tradeConfig.direction === TRADE_DIRECTION.BUY 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : (darkMode ? '#334155' : '#f1f5f9'),
              border: 'none',
              borderRadius: '8px',
              color: tradeConfig.direction === TRADE_DIRECTION.BUY ? 'white' : 'inherit',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            className="direction-button"
          >
            📈 BUY
          </button>
          <button
            onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.SELL }))}
            style={{
              flex: 1,
              padding: '12px',
              background: tradeConfig.direction === TRADE_DIRECTION.SELL 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : (darkMode ? '#334155' : '#f1f5f9'),
              border: 'none',
              borderRadius: '8px',
              color: tradeConfig.direction === TRADE_DIRECTION.SELL ? 'white' : 'inherit',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            className="direction-button"
          >
            📉 SELL
          </button>
        </div>
      </div>
      
      {/* Order Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          color: darkMode ? '#cbd5e1' : '#475569', 
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Order Type
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '8px' 
        }}>
          {ORDER_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setTradeConfig(prev => ({ ...prev, orderType: type.id }))}
              style={{
                padding: '12px',
                background: tradeConfig.orderType === type.id 
                  ? '#667eea' 
                  : (darkMode ? '#334155' : '#f1f5f9'),
                border: tradeConfig.orderType === type.id 
                  ? '2px solid #667eea' 
                  : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: tradeConfig.orderType === type.id ? 'white' : 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              className="order-type-button"
              title={type.description}
            >
              <span style={{ fontSize: '18px' }}>{type.icon}</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: '600' }}>{type.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Fee: {(type.fee * 100).toFixed(2)}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Amount Input */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '8px' 
        }}>
          <label style={{ 
            color: darkMode ? '#cbd5e1' : '#475569', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Amount ({pair.split('/')[0]})
          </label>
          <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#94a3b8' }}>
            Available: {formatNumber(portfolio.currencies[pair.split('/')[0]] || 0, 2)}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={tradeConfig.amount}
            onChange={(e) => setTradeConfig(prev => ({ 
              ...prev, 
              amount: Math.max(0, parseFloat(e.target.value) || 0) 
            }))}
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingLeft: '40px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: 'inherit',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            min="0"
            step="0.01"
          />
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#667eea',
            fontWeight: '600'
          }}>
            $
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginTop: '10px' 
        }}>
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setTradeConfig(prev => ({ ...prev, amount }))}
              style={{
                padding: '6px 12px',
                background: tradeConfig.amount === amount 
                  ? '#667eea' 
                  : (darkMode ? '#334155' : '#f1f5f9'),
                border: tradeConfig.amount === amount 
                  ? '2px solid #667eea' 
                  : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '20px',
                color: tradeConfig.amount === amount ? 'white' : 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              className="quick-amount-button"
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: darkMode ? '#cbd5e1' : '#475569', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Limit Price ({pair.split('/')[1]})
              </label>
              <input
                type="number"
                value={tradeConfig.limitPrice || ''}
                onChange={(e) => setTradeConfig(prev => ({ 
                  ...prev, 
                  limitPrice: parseFloat(e.target.value) || 0 
                }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  color: 'inherit',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter limit price"
                step="0.000001"
              />
            </div>
          )}
          
          {(tradeConfig.orderType === 'stop' || tradeConfig.orderType === 'stop_limit') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: darkMode ? '#cbd5e1' : '#475569', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Stop Price ({pair.split('/')[1]})
              </label>
              <input
                type="number"
                value={tradeConfig.stopPrice || ''}
                onChange={(e) => setTradeConfig(prev => ({ 
                  ...prev, 
                  stopPrice: parseFloat(e.target.value) || 0 
                }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  color: 'inherit',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Enter stop price"
                step="0.000001"
              />
            </div>
          )}
          
          {/* Risk Management */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: darkMode ? '#cbd5e1' : '#475569', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Risk Management
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ 
                  fontSize: '12px', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  marginBottom: '4px', 
                  display: 'block',
                  fontWeight: '500'
                }}>
                  Take Profit
                </label>
                <input
                  type="number"
                  value={tradeConfig.takeProfit || ''}
                  onChange={(e) => setTradeConfig(prev => ({ 
                    ...prev, 
                    takeProfit: parseFloat(e.target.value) || 0 
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: 'inherit',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="TP"
                  step="0.000001"
                />
              </div>
              <div>
                <label style={{ 
                  fontSize: '12px', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  marginBottom: '4px', 
                  display: 'block',
                  fontWeight: '500'
                }}>
                  Stop Loss
                </label>
                <input
                  type="number"
                  value={tradeConfig.stopLoss || ''}
                  onChange={(e) => setTradeConfig(prev => ({ 
                    ...prev, 
                    stopLoss: parseFloat(e.target.value) || 0 
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: 'inherit',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="SL"
                  step="0.000001"
                />
              </div>
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <label style={{ 
                fontSize: '12px', 
                color: darkMode ? '#94a3b8' : '#64748b', 
                marginBottom: '4px', 
                display: 'block',
                fontWeight: '500'
              }}>
                Risk Level
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {RISK_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setTradeConfig(prev => ({ ...prev, riskLevel: level.id }))}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: tradeConfig.riskLevel === level.id 
                        ? level.color 
                        : (darkMode ? '#334155' : '#f1f5f9'),
                      border: tradeConfig.riskLevel === level.id 
                        ? `2px solid ${level.color}` 
                        : `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      color: tradeConfig.riskLevel === level.id ? 'white' : 'inherit',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    className="risk-level-button"
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Leverage */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ 
                fontSize: '12px', 
                color: darkMode ? '#94a3b8' : '#64748b', 
                marginBottom: '4px', 
                display: 'block',
                fontWeight: '500'
              }}>
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
                style={{
                  width: '100%',
                  height: '6px',
                  background: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '3px',
                  outline: 'none'
                }}
                className="trade-slider"
              />
            </div>
          </div>
        </>
      )}
      
      {/* Trade Calculations */}
      {!isCalculating && calculations.entryPrice && (
        <div style={{
          background: darkMode ? '#0f172a' : '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${calculations.isValid ? '#10b981' : '#ef4444'}`
        }}>
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: '10px', 
            color: '#667eea', 
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Trade Summary
            {calculations.isValid && (
              <span style={{
                fontSize: '10px',
                background: '#10b981',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: '500'
              }}>
                Valid
              </span>
            )}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px', 
            fontSize: '12px' 
          }}>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Entry Price:</div>
              <div style={{ fontWeight: '600', color: '#667eea' }}>{calculations.entryPrice.toFixed(6)}</div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Position Size:</div>
              <div style={{ fontWeight: '600' }}>{calculations.positionSize.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Margin Required:</div>
              <div style={{ fontWeight: '600' }}>${calculations.margin.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Spread Cost:</div>
              <div style={{ fontWeight: '600', color: '#f59e0b' }}>${calculations.spreadCost.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Risk/Reward:</div>
              <div style={{ 
                fontWeight: '600',
                color: calculations.riskRewardRatio >= 2 ? '#10b981' : 
                       calculations.riskRewardRatio >= 1 ? '#f59e0b' : '#ef4444'
              }}>
                {calculations.riskRewardRatio.toFixed(2)}:1
              </div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Potential Profit:</div>
              <div style={{ 
                fontWeight: '600',
                color: calculations.potentialProfit >= 0 ? '#10b981' : '#ef4444'
              }}>
                ${calculations.potentialProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Potential Loss:</div>
              <div style={{ 
                fontWeight: '600',
                color: calculations.potentialLoss <= calculations.maxAllowedLoss ? '#10b981' : '#ef4444'
              }}>
                ${calculations.potentialLoss.toFixed(2)}
            </div>
            </div>
            <div>
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Risk Level:</div>
              <div style={{ 
                fontWeight: '600',
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
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ef4444'
        }}>
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            color: '#ef4444', 
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ Trade Validation Errors
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '12px', 
            color: '#ef4444',
            lineHeight: '1.5'
          }}>
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
        style={{
          width: '100%',
          padding: '16px',
          background: tradeConfig.direction === TRADE_DIRECTION.BUY
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: errors.length > 0 ? 'not-allowed' : 'pointer',
          opacity: errors.length > 0 ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="execute-button"
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
    <Card darkMode={darkMode}>
      <h2 style={{ 
        marginTop: 0, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: '#667eea',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        💼 Portfolio Dashboard
      </h2>
      
      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '15px',
          background: darkMode ? '#0f172a' : '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Total Value</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
            ${formatNumber(metrics.totalValue)}
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          background: darkMode ? '#0f172a' : '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Total P&L</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: metrics.totalPnL >= 0 ? '#10b981' : '#ef4444'
          }}>
            {metrics.totalPnL >= 0 ? '+' : ''}${formatNumber(metrics.totalPnL)}
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          background: darkMode ? '#0f172a' : '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Win Rate</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: metrics.winRate >= 50 ? '#10b981' : 
                   metrics.winRate >= 30 ? '#f59e0b' : '#ef4444'
          }}>
            {formatNumber(metrics.winRate, 1)}%
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          background: darkMode ? '#0f172a' : '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Daily P&L</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: metrics.dailyPnL >= 0 ? '#10b981' : '#ef4444'
          }}>
            {metrics.dailyPnL >= 0 ? '+' : ''}${formatNumber(metrics.dailyPnL)}
          </div>
        </div>
      </div>
      
      {/* Holdings */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: darkMode ? '#cbd5e1' : '#475569', 
          fontSize: '16px', 
          marginBottom: '15px',
          fontWeight: '600'
        }}>
          💰 Current Holdings
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px'
        }}>
          {Object.entries(portfolio.currencies)
            .filter(([, amount]) => amount > 0)
            .map(([currency, amount]) => {
              const currencyInfo = CURRENCIES.find(c => c.code === currency);
              const rate = currencyInfo?.rate || 1;
              const value = amount * rate;
              
              return (
                <div 
                  key={currency}
                  style={{
                    padding: '12px',
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${currencyInfo?.color || '#667eea'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="holding-item"
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#667eea' }}>
                      {currency}
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {currencyInfo?.name || 'Currency'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>
                      {formatNumber(amount)} {currency}
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      ${formatNumber(value)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '15px',
        borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        color: darkMode ? '#94a3b8' : '#64748b',
        fontSize: '12px'
      }}>
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
    <Card darkMode={darkMode}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ 
          marginTop: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          color: '#667eea',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          📋 Trade History
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: 'inherit',
              fontSize: '12px',
              minWidth: '200px'
            }}
          />
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: 'inherit',
              fontSize: '12px'
            }}
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
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: darkMode ? '#94a3b8' : '#94a3b8' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📊</div>
          <p style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '500' }}>No trades found</p>
          <p>Execute some trades to see your history here</p>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
                position: 'sticky', 
                top: 0, 
                background: darkMode ? '#1e293b' : 'white',
                backdropFilter: 'blur(10px)'
              }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Time</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Pair</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Type</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Status</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Amount</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Entry</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Exit</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>P&L</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: darkMode ? '#94a3b8' : '#64748b', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>Actions</th>
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
                    style={{ 
                      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      backgroundColor: isOpen 
                        ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                        : profit > 0
                          ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
                          : profit < 0
                            ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)')
                            : 'transparent',
                      transition: 'background-color 0.3s'
                    }}
                    className="trade-row"
                  >
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '12px', 
                      color: darkMode ? '#cbd5e1' : '#475569',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: trade.direction === TRADE_DIRECTION.BUY ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          minWidth: '40px',
                          textAlign: 'center'
                        }}>
                          {trade.direction === TRADE_DIRECTION.BUY ? 'BUY' : 'SELL'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          {trade.pair}
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '12px', 
                      color: darkMode ? '#94a3b8' : '#64748b' 
                    }}>
                      {ORDER_TYPES.find(ot => ot.id === trade.orderType)?.name || trade.orderType}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: isOpen ? '#3b82f6' : 
                                  isPending ? '#f59e0b' : 
                                  profit > 0 ? '#10b981' : '#ef4444',
                        color: 'white',
                        display: 'inline-block',
                        minWidth: '70px',
                        textAlign: 'center'
                      }}>
                        {isOpen ? 'OPEN' : 
                         isPending ? 'PENDING' : 
                         profit > 0 ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      {formatNumber(trade.amount)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '12px', 
                      color: darkMode ? '#94a3b8' : '#64748b' 
                    }}>
                      {trade.entryPrice?.toFixed(5) || '-'}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '12px', 
                      color: darkMode ? '#94a3b8' : '#64748b' 
                    }}>
                      {trade.exitPrice?.toFixed(5) || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {profit !== 0 ? (
                        <span style={{
                          color: profit > 0 ? '#10b981' : '#ef4444',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {profit > 0 ? '▲' : '▼'}
                          ${Math.abs(profit).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
                          -
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {isOpen ? (
                        <button
                          onClick={() => onCloseTrade(trade.id, trade.entryPrice * (1 + (Math.random() - 0.5) * 0.02))}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          className="action-button"
                        >
                          Close
                        </button>
                      ) : isPending ? (
                        <button
                          onClick={() => onCancelOrder(trade.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          className="action-button"
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        color: darkMode ? '#94a3b8' : '#64748b',
        fontSize: '12px'
      }}>
        <div>
          <div>Showing {filteredTrades.length} of {trades.length} trades</div>
          <div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div>
        </div>
        <div>
          <div>Total P&L: 
            <span style={{ 
              color: trades.reduce((sum, t) => sum + (t.profit || 0), 0) >= 0 ? '#10b981' : '#ef4444',
              fontWeight: '600',
              marginLeft: '5px'
            }}>
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

  return (
    <div style={{
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? '#ffffff' : '#1e293b',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              🚀 Advanced Forex Trading Platform
            </h1>
            <p style={{ 
              margin: '5px 0 0 0', 
              opacity: 0.9, 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>Professional trading with risk management & currency conversion</span>
              <span>•</span>
              <span>Live Market</span>
              <span>•</span>
              <span>Portfolio: ${formatNumber(portfolio.totalValue)}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              className="header-button"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
            <button
              onClick={resetPortfolio}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              className="header-button"
              title="Reset Portfolio"
            >
              🔄 Reset
            </button>
            <button
              onClick={exportTrades}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              className="header-button"
              title="Export Trades"
            >
              📥 Export
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
              style={{
                padding: '12px 24px',
                background: activeTab === id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              className="tab-button"
            >
              {icon} {label}
            </button>
          ))}
        </div>
        
        {/* Time Frame Selector */}
        <div style={{ marginTop: '15px' }}>
          <label style={{ 
            fontSize: '12px', 
            opacity: 0.8,
            marginRight: '10px'
          }}>
            Time Frame:
          </label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {TIME_FRAMES.map(tf => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeFrame(tf)}
                style={{
                  padding: '4px 12px',
                  background: selectedTimeFrame.label === tf.label 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
                className="timeframe-button"
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
      {activeTab === 'converter' && (
        <CurrencyConverter
          currencies={currencies}
          darkMode={darkMode}
        />
      )}
      
      {activeTab === 'trade' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 2fr)',
          gap: '20px',
          marginBottom: '20px'
        }}>
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
          <div style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '20px'
          }}>
            <Card darkMode={darkMode}>
              <h2 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#667eea',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                📈 {selectedPair} - Live Chart
              </h2>
              <div style={{ 
                width: '100%', 
                height: '300px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? '#94a3b8' : '#64748b',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Simplified chart simulation */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  {/* Grid lines */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={`h${i}`}
                      x1="0"
                      y1={(i + 1) * 60}
                      x2="100%"
                      y2={(i + 1) * 60}
                      stroke={darkMode ? '#334155' : '#e2e8f0'}
                      strokeWidth="1"
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
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="2"
                  />
                </svg>
                
                <div style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  left: '10px',
                  background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: '600', color: '#667eea' }}>
                    Current: {currentPairRate.toFixed(5)}
                  </div>
                  <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <PortfolioDashboard
            portfolio={portfolio}
            trades={trades}
            darkMode={darkMode}
          />
          
          {/* Risk Management Dashboard */}
          <Card darkMode={darkMode}>
            <h2 style={{ 
              marginTop: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: '#667eea',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              🛡️ Risk Management
            </h2>
            
            {/* Risk Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '15px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #10b981'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Max Drawdown</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  2.5%
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #f59e0b'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Sharpe Ratio</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                  1.8
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #3b82f6'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Volatility</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  15%
                </div>
              </div>
              
              <div style={{
                padding: '15px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #8b5cf6'
              }}>
                <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Value at Risk</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                  $250
                </div>
              </div>
            </div>
            
            {/* Risk Controls */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: darkMode ? '#cbd5e1' : '#475569', 
                fontSize: '16px', 
                marginBottom: '15px',
                fontWeight: '600'
              }}>
                ⚙️ Risk Controls
              </h3>
              <div style={{
                background: darkMode ? '#0f172a' : '#f8fafc',
                padding: '15px',
                borderRadius: '8px'
              }}>
                {RISK_LEVELS.map(level => (
                  <div 
                    key={level.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: darkMode ? '#1e293b' : '#f1f5f9',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      transition: 'transform 0.2s ease'
                    }}
                    className="risk-control-item"
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: level.color }}>{level.name}</div>
                      <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                        Max Position: {(level.maxPositionSize * 100).toFixed(1)}% • Max Loss: {(level.maxLossPerTrade * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: level.color,
                      border: `2px solid ${darkMode ? '#0f172a' : 'white'}`
                    }} />
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
        }
        
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        
        /* Custom Classes for Hover Effects */
        .notification-close-button:hover {
          opacity: 1 !important;
        }
        
        .header-button:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.1) !important;
        }
        
        .tab-button:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: translateY(-2px) !important;
        }
        
        .timeframe-button:hover {
          background: rgba(255,255,255,0.2) !important;
        }
        
        .pair-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .currency-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .quick-conversion-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .clear-history-button:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          transform: translateY(-1px);
        }
        
        .history-row:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }
        
        .direction-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .order-type-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.1);
        }
        
        .quick-amount-button:hover {
          transform: translateY(-1px);
          boxShadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .risk-level-button:hover {
          transform: translateY(-1px);
        }
        
        .trade-slider::-webkit-slider-thumb {
          appearance: none;
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
        
        .execute-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
        
        .execute-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        
        .execute-button:hover::after:not(:disabled) {
          transform: translateX(100%);
        }
        
        .holding-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .risk-control-item:hover {
          transform: translateX(5px);
        }
        
        .trade-row:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .toggle-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          
          .responsive-flex {
            flex-direction: column;
          }
          
          .trade-panel-grid {
            grid-template-columns: 1fr !important;
          }
          
          .converter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}
    </style>
    <footer style={{
      textAlign: 'center',
      padding: '20px',
      fontSize: '12px',
      color: '#94a3b8'
    }}>
      © <span>{new Date().getFullYear()}</span> ASAP~PRICE. All rights reserved.
      <br/>
      <span>Powered By Royzeenet</span>
    </footer>
  </>
);

export default LiveCurrencySimulator;