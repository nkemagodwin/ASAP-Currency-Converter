import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './App.css';
// UX Improvement: Added Recharts for better data visualization
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// =============== CONSTANTS & CONFIGURATIONS ===============
const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.0060, flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.0045, flag: '🇬🇭' },
  { code: 'USD', name: 'US Dollar', favorite: true, color: '#667eea', trend: 'neutral', volatility: 0.0010, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', favorite: true, color: '#764ba2', trend: 'down', volatility: 0.0025, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', favorite: true, color: '#f093fb', trend: 'up', volatility: 0.0030, flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', favorite: false, color: '#f5576c', trend: 'down', volatility: 0.0035, flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', favorite: false, color: '#4facfe', trend: 'up', volatility: 0.0028, flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', favorite: false, color: '#00f2fe', trend: 'down', volatility: 0.0032, flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', favorite: false, color: '#43e97b', trend: 'neutral', volatility: 0.0020, flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', favorite: false, color: '#fa709a', trend: 'up', volatility: 0.0015, flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', favorite: false, color: '#ffee00', trend: 'down', volatility: 0.0018, flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', favorite: false, color: '#00b09b', trend: 'up', volatility: 0.0040, flag: '🇧🇷' },
  { code: 'RUB', name: 'Russian Ruble', favorite: false, color: '#96c93d', trend: 'down', volatility: 0.0050, flag: '🇷🇺' },
  { code: 'MXN', name: 'Mexican Peso', favorite: false, color: '#ff5e62', trend: 'up', volatility: 0.0035, flag: '🇲🇽' },
  { code: 'KRW', name: 'South Korean Won', favorite: false, color: '#4F46E5', trend: 'neutral', volatility: 0.0022, flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', favorite: false, color: '#8B5CF6', trend: 'up', volatility: 0.0018, flag: '🇸🇬' },
  { code: 'ZAR', name: 'South African Rand', favorite: false, color: '#F97316', trend: 'down', volatility: 0.0045, flag: '🇿🇦' },
];

// API Configuration
const API_CONFIG = {
  EXCHANGE_RATE_API: {
    BASE_URL: 'https://api.exchangerate-api.com/v4/latest/',
    FALLBACK_URL: 'https://api.frankfurter.app/latest?from='
  },
  CURRENCY_API: {
    BASE_URL: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/'
  },
  CACHE_DURATION: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

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

// =============== LIVE CURRENCY SERVICE ===============
class LiveCurrencyService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.rateHistory = new Map();
    this.apiPriority = ['exchange-rate-api', 'currency-api', 'frankfurter'];
  }

  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async getLiveRates(baseCurrency = 'USD') {
    const cacheKey = `rates-${baseCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < API_CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this.fetchFromMultipleAPIs(baseCurrency);
    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const data = await fetchPromise;
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      this.updateRateHistory(baseCurrency, data);
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async fetchFromMultipleAPIs(baseCurrency) {
    const errors = [];

    try {
      const data = await this.fetchWithRetry(
        `${API_CONFIG.EXCHANGE_RATE_API.BASE_URL}${baseCurrency}`
      );
      if (data && data.rates) {
        return {
          base: data.base,
          rates: data.rates,
          timestamp: Date.now(),
          source: 'exchange-rate-api'
        };
      }
    } catch (error) {
      errors.push(`Exchange Rate API failed: ${error.message}`);
    }

    try {
      const data = await this.fetchWithRetry(
        `${API_CONFIG.EXCHANGE_RATE_API.FALLBACK_URL}${baseCurrency}`
      );
      if (data && data.rates) {
        return {
          base: data.base,
          rates: data.rates,
          timestamp: Date.now(),
          source: 'frankfurter'
        };
      }
    } catch (error) {
      errors.push(`Frankfurter API failed: ${error.message}`);
    }

    try {
      const data = await this.fetchWithRetry(
        `${API_CONFIG.CURRENCY_API.BASE_URL}${baseCurrency.toLowerCase()}.json`
      );
      if (data && data[baseCurrency.toLowerCase()]) {
        return {
          base: baseCurrency,
          rates: data[baseCurrency.toLowerCase()],
          timestamp: Date.now(),
          source: 'currency-api'
        };
      }
    } catch (error) {
      errors.push(`Currency API failed: ${error.message}`);
    }

    throw new Error(`All APIs failed: ${errors.join('; ')}`);
  }

  updateRateHistory(baseCurrency, data) {
    const timestamp = Date.now();
    Object.entries(data.rates).forEach(([currency, rate]) => {
      const key = `${baseCurrency}-${currency}`;
      if (!this.rateHistory.has(key)) {
        this.rateHistory.set(key, []);
      }
      const history = this.rateHistory.get(key);
      history.push({
        timestamp,
        rate,
        time: new Date(timestamp).toLocaleTimeString()
      });
      
      if (history.length > 100) {
        history.shift();
      }
    });
  }

  getRateHistory(baseCurrency, targetCurrency, points = 50) {
    const key = `${baseCurrency}-${targetCurrency}`;
    const history = this.rateHistory.get(key) || [];
    return history.slice(-points);
  }

  async convert(amount, from, to) {
    if (from === to) return amount;
    
    const data = await this.getLiveRates(from);
    const rate = data.rates[to];
    
    if (!rate) {
      throw new Error(`Rate not found for ${to}`);
    }
    
    return {
      amount: amount * rate,
      rate,
      timestamp: data.timestamp,
      source: data.source
    };
  }

  async getMultipleRates(baseCurrency, targets) {
    const data = await this.getLiveRates(baseCurrency);
    const rates = {};
    
    targets.forEach(target => {
      rates[target] = data.rates[target] || null;
    });
    
    return {
      base: baseCurrency,
      rates,
      timestamp: data.timestamp,
      source: data.source
    };
  }
}

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
    const baseToUSD = base.code === 'USD' ? 1 : base.rate;
    const quoteToUSD = quote.code === 'USD' ? 1 : quote.rate;
    return baseToUSD / quoteToUSD;
  }

  static convertCurrency(amount, fromCurrency, toCurrency, currencies) {
    if (fromCurrency === toCurrency) return amount;
    const from = currencies.find(c => c.code === fromCurrency);
    const to = currencies.find(c => c.code === toCurrency);
    if (!from || !to) return 0;
    const amountInUSD = from.code === 'USD' ? amount : amount / from.rate;
    const convertedAmount = to.code === 'USD' ? amountInUSD : amountInUSD * to.rate;
    return convertedAmount;
  }

  static validateTrade(portfolio, currencyPair, amount, price, direction, orderType, riskLevel) {
    const errors = [];
    const [baseCurrency, quoteCurrency] = currencyPair.split('/');
    const riskConfig = RISK_LEVELS.find(r => r.id === riskLevel);
    const tradingPair = TRADING_PAIRS.find(p => p.pair === currencyPair);

    if (tradingPair && amount < tradingPair.minTrade) {
      errors.push(`Minimum trade size is ${tradingPair.minTrade} ${baseCurrency}`);
    }

    const margin = amount * price;
    if (direction === TRADE_DIRECTION.BUY) {
      const requiredBalance = margin;
      if (requiredBalance > portfolio.balance) {
        errors.push(`Insufficient balance. Required: $${formatNumber(requiredBalance)}`);
      }
    }

    const positionSizePercentage = margin / portfolio.totalValue;
    if (positionSizePercentage > riskConfig.maxPositionSize) {
      errors.push(`Position size (${(positionSizePercentage * 100).toFixed(1)}%) exceeds ${(riskConfig.maxPositionSize * 100).toFixed(0)}% limit`);
    }

    if (direction === TRADE_DIRECTION.SELL) {
      if (!portfolio.currencies[baseCurrency] || portfolio.currencies[baseCurrency] < amount) {
        errors.push(`Insufficient ${baseCurrency} to sell`);
      }
    }

    return errors;
  }
}

// =============== CUSTOM HOOKS ===============
const useLiveCurrencyData = () => {
  const [currencies, setCurrencies] = useState(CURRENCIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const currencyService = useMemo(() => new LiveCurrencyService(), []);
  const [rateHistory, setRateHistory] = useState({});
  const [apiSource, setApiSource] = useState(null);

  const updateCurrencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await currencyService.getLiveRates('USD');
      
      setCurrencies(prevCurrencies => 
        prevCurrencies.map(currency => {
          if (currency.code === 'USD') {
            return {
              ...currency,
              rate: 1,
              previousRate: currency.rate || 1,
              lastUpdate: data.timestamp,
              apiSource: data.source
            };
          }
          
          const liveRate = data.rates[currency.code];
          if (liveRate) {
            const previousRate = currency.rate || 1;
            const changePercent = ((liveRate - previousRate) / previousRate) * 100;
            
            setRateHistory(prev => ({
              ...prev,
              [currency.code]: [
                ...(prev[currency.code] || []),
                {
                  time: new Date(data.timestamp).toLocaleTimeString(),
                  rate: liveRate,
                  timestamp: data.timestamp,
                  change: changePercent
                }
              ].slice(-100)
            }));

            return {
              ...currency,
              rate: liveRate,
              previousRate,
              change: parseFloat(changePercent.toFixed(4)),
              trend: changePercent > 0.01 ? 'up' : changePercent < -0.01 ? 'down' : 'neutral',
              lastUpdate: data.timestamp,
              apiSource: data.source
            };
          }
          
          return currency;
        })
      );
      
      setApiSource(data.source);
      setLastUpdate(new Date(data.timestamp));
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch live rates:', err);
    } finally {
      setLoading(false);
    }
  }, [currencyService]);

  useEffect(() => {
    updateCurrencies();
    const interval = setInterval(updateCurrencies, 30000);
    return () => clearInterval(interval);
  }, [updateCurrencies]);

  return { currencies, loading, error, lastUpdate, rateHistory, apiSource, refresh: updateCurrencies };
};

const useMarketData = (currencies, setCurrencies, setRateHistory, setLastUpdate, timeFrame) => {
  useEffect(() => {
    const updateLiveRates = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      setCurrencies(prev => prev.map(currency => {
        if (currency.code === 'USD') return currency;
        const isMarketOpen = day >= 1 && day <= 5 && hour >= 1 && hour < 23;
        const marketActivity = isMarketOpen ? 1 : 0.1;
        const randomChange = (Math.random() - 0.5) * currency.volatility * marketActivity;
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
          ].slice(-100)
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
// UX Improvement: Enhanced Notification with animations and stacking
const Notification = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container" aria-live="assertive">
      {notifications.map(({ id, message, type }) => (
        <div 
          key={id} 
          className={`notification notification-${type} slide-in`} 
          role="alert"
        >
          <span className="notification-icon">
            {type === 'success' && '✅'}
            {type === 'error' && '❌'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
          </span>
          <div className="notification-content">
            <strong className="notification-title">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </strong>
            <span className="notification-message">{message}</span>
          </div>
          <button
            onClick={() => removeNotification(id)}
            className="notification-close-button"
            aria-label="Close notification"
          >
            ×
          </button>
          <div className="notification-progress"></div>
        </div>
      ))}
    </div>
  );
};

// UX Improvement: Enhanced Confirm Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content slide-up" onClick={e => e.stopPropagation()}>
        <div className={`modal-icon ${type}`}>
          {type === 'warning' && '⚠️'}
          {type === 'danger' && '❗'}
          {type === 'info' && 'ℹ️'}
          {type === 'success' && '✅'}
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button 
            onClick={onConfirm} 
            className={`modal-confirm-button ${type}`}
          >
            {confirmText}
          </button>
          <button onClick={onClose} className="modal-cancel-button">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

// UX Improvement: Tooltip component with better positioning
const Tooltip = ({ children, text, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({});
  const tooltipRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
    setShow(true);
  };

  return (
    <span 
      className="tooltip-container" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      ref={tooltipRef}
    >
      {children}
      {show && (
        <span 
          className={`tooltip-text ${position}`}
          style={{
            top: position === 'top' ? coords.top - 30 : position === 'bottom' ? coords.top + coords.height + 10 : coords.top + coords.height/2,
            left: position === 'left' ? coords.left - 10 : position === 'right' ? coords.left + coords.width + 10 : coords.left + coords.width/2
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

const Loader = ({ size = 20, color = '#667eea' }) => (
  <div
    className="loader"
    style={{
      width: size,
      height: size,
      borderColor: `${color}20`,
      borderTopColor: color
    }}
    aria-label="Loading"
  />
);

// UX Improvement: Full-screen loading overlay with progress
const LoadingOverlay = ({ isLoading, progress = 0 }) => {
  if (!isLoading) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <Loader size={50} />
        <p>Processing...</p>
        {progress > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ children, darkMode, className = '', onClick, hoverable = false }) => (
  <div 
    className={`card ${darkMode ? 'card-dark' : 'card-light'} ${hoverable ? 'hoverable' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// UX Improvement: Empty State Component
const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-subtitle">{subtitle}</p>
    {action}
  </div>
);

// UX Improvement: Skeleton Loader
const SkeletonLoader = ({ type = 'text', width = '100%', height = '20px' }) => (
  <div className={`skeleton-loader ${type}`} style={{ width, height }}>
    <div className="skeleton-shimmer"></div>
  </div>
);

// =============== ENHANCED CURRENCY CONVERTER COMPONENT WITH LIVE API ===============
const CurrencyConverter = ({ currencies, darkMode, liveData, onRefresh }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(100);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [inverseRate, setInverseRate] = useState(0);
  const [favorites, setFavorites] = useLocalStorage('favorite-currencies', ['USD', 'EUR', 'GBP', 'JPY', 'NGN', 'GHS']);
  const [conversionHistory, setConversionHistory] = useLocalStorage('conversion-history', []);
  const [isSwapping, setIsSwapping] = useState(false);
  const [liveConversion, setLiveConversion] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showRateChart, setShowRateChart] = useState(false);
  const [rateHistory, setRateHistory] = useState([]);
  const currencyService = useMemo(() => new LiveCurrencyService(), []);

  useEffect(() => {
    calculateConversion();
  }, [fromCurrency, toCurrency, amount, currencies]);

  useEffect(() => {
    if (liveData?.rates) {
      calculateConversion();
    }
  }, [liveData]);

  const calculateConversion = useCallback(async () => {
    if (!amount || amount <= 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      setInverseRate(0);
      return;
    }

    setIsConverting(true);
    try {
      const liveResult = await currencyService.convert(amount, fromCurrency, toCurrency);
      setLiveConversion(liveResult);
      setConvertedAmount(liveResult.amount);
      setExchangeRate(liveResult.rate);
      setInverseRate(1 / liveResult.rate);
      
      const history = currencyService.getRateHistory(fromCurrency, toCurrency, 20);
      setRateHistory(history);
    } catch (error) {
      console.warn('Live conversion failed, using calculated rates:', error);
      const rate = TradingEngine.calculatePairRate(fromCurrency, toCurrency, currencies);
      const converted = TradingEngine.convertCurrency(amount, fromCurrency, toCurrency, currencies);
      setExchangeRate(rate);
      setInverseRate(1 / rate);
      setConvertedAmount(converted);
    } finally {
      setIsConverting(false);
    }
  }, [amount, fromCurrency, toCurrency, currencies, currencyService]);

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
      rate: exchangeRate,
      liveRate: liveConversion?.rate,
      apiSource: liveConversion?.source
    };
    setConversionHistory([newConversion, ...conversionHistory.slice(0, 9)]);
  };

  const favoriteCurrencies = currencies.filter(currency => favorites.includes(currency.code));
  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000, 10000];

  return (
    <div className="converter-grid">
      <Card darkMode={darkMode} className="converter-main">
        <div className="converter-header">
          <div>
            <h2 className="section-title">💱 Currency Converter</h2>
            {liveConversion?.source && (
              <span className="api-source-badge pulse">
                Live rates from: {liveConversion.source}
              </span>
            )}
          </div>
          <div className="converter-actions">
            <Tooltip text="Refresh rates">
              <button
                onClick={onRefresh}
                className="header-button refresh-button"
                aria-label="Refresh rates"
                disabled={isConverting}
              >
                {isConverting ? <Loader size={16} /> : '🔄'}
              </button>
            </Tooltip>
            <Tooltip text="Save conversion">
              <button
                onClick={handleSaveConversion}
                className="header-button save-conversion-button"
                aria-label="Save conversion"
              >
                💾
              </button>
            </Tooltip>
            <Tooltip text="Toggle rate chart">
              <button
                onClick={() => setShowRateChart(!showRateChart)}
                className={`header-button chart-button ${showRateChart ? 'active' : ''}`}
                aria-label="Toggle rate chart"
              >
                📊
              </button>
            </Tooltip>
          </div>
        </div>

        {showRateChart && rateHistory.length > 0 && (
          <div className="rate-chart-container slide-down">
            <h4 className="chart-title">Rate History (20 updates)</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={rateHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke={darkMode ? '#667eea' : '#4a5568'} 
                  dot={false} 
                  strokeWidth={2}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="converter-input-section">
          <div className="converter-from">
            <label htmlFor="from-currency" className="input-label">
              From <Tooltip text="Source currency">ⓘ</Tooltip>
            </label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <select
                  id="from-currency"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="currency-select"
                  aria-label="Select source currency"
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                      {currency.change ? ` (${currency.change > 0 ? '+' : ''}${currency.change}%)` : ''}
                    </option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
              </div>
              <Tooltip text={favorites.includes(fromCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
                <button
                  onClick={() => favorites.includes(fromCurrency) ? handleRemoveFromFavorites(fromCurrency) : handleAddToFavorites(fromCurrency)}
                  className={`favorite-button ${favorites.includes(fromCurrency) ? 'active' : ''}`}
                  aria-label={favorites.includes(fromCurrency) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(fromCurrency) ? '★' : '⭐'}
                </button>
              </Tooltip>
            </div>

            <div className="amount-input-wrapper">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="amount-input"
                min="0"
                step="0.01"
                id="amount"
                aria-label="Amount"
                placeholder="Enter amount"
              />
              <span className="currency-code">{fromCurrency}</span>
            </div>
          </div>

          <div className="swap-section">
            <Tooltip text="Swap currencies">
              <button
                onClick={handleSwapCurrencies}
                disabled={isSwapping}
                className={`swap-button ${isSwapping ? 'swapping' : ''}`}
                aria-label="Swap currencies"
              >
                🔄
              </button>
            </Tooltip>
            <div className="rate-display">
              1 {fromCurrency} = <span className="rate-value-highlight">{exchangeRate.toFixed(6)}</span> {toCurrency}
              {liveConversion?.rate && (
                <Tooltip text="Live rate">
                  <span className="live-indicator" title="Live rate">🔴</span>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="converter-to">
            <label htmlFor="to-currency" className="input-label">To</label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <select
                  id="to-currency"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="currency-select"
                  aria-label="Select target currency"
                >
                  <option value="">Select Currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                      {currency.change ? ` (${currency.change > 0 ? '+' : ''}${currency.change}%)` : ''}
                    </option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
              </div>
              <Tooltip text={favorites.includes(toCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
                <button
                  onClick={() => favorites.includes(toCurrency) ? handleRemoveFromFavorites(toCurrency) : handleAddToFavorites(toCurrency)}
                  className={`favorite-button ${favorites.includes(toCurrency) ? 'active' : ''}`}
                  aria-label={favorites.includes(toCurrency) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(toCurrency) ? '★' : '⭐'}
                </button>
              </Tooltip>
            </div>

            <div className="converted-amount-display">
              <span className="currency-code">{toCurrency}</span>
              <span className="converted-amount">
                {isConverting ? <Loader size={20} /> : formatNumber(convertedAmount, 6)}
              </span>
            </div>
          </div>
        </div>

        <div className="quick-amounts-section">
          <label className="input-label">Quick Amounts ({fromCurrency})</label>
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

        <div className="rate-details">
          <h3 className="rate-details-title">📊 Exchange Rate Details</h3>
          <div className="rate-details-grid">
            <div>
              <div className="rate-label">Current Rate</div>
              <div className="rate-value">
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                {liveConversion?.rate && (
                  <span className="rate-source">({liveConversion.source})</span>
                )}
              </div>
            </div>
            <div>
              <div className="rate-label">Inverse Rate</div>
              <div className="rate-value inverse">
                1 {toCurrency} = {inverseRate.toFixed(6)} {fromCurrency}
              </div>
            </div>
            {liveConversion?.timestamp && (
              <div>
                <div className="rate-label">Last Update</div>
                <div className="rate-value">
                  {new Date(liveConversion.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="converter-sidebar">
        <Card darkMode={darkMode} className="favorites-card">
          <h3 className="section-subtitle">⭐ Favorite Currencies</h3>
          <div className="favorites-grid">
            {favoriteCurrencies.length > 0 ? (
              favoriteCurrencies.map(currency => (
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
                  <span className="currency-flag">{currency.flag}</span>
                  <div>
                    <div className="currency-code-text">{currency.code}</div>
                    <div className="currency-rate">{formatNumber(currency.rate, 4)}</div>
                    {currency.change && (
                      <div className={`currency-change ${currency.change > 0 ? 'positive' : 'negative'}`}>
                        {currency.change > 0 ? '▲' : '▼'} {Math.abs(currency.change)}%
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                icon="⭐"
                title="No favorite currencies"
                subtitle="Click the star button to add favorites"
              />
            )}
          </div>
        </Card>

        <Card darkMode={darkMode} className="quick-conversions-card">
          <h3 className="section-subtitle">⚡ Quick Conversions</h3>
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
                    <span className="conversion-pair">{pair.from} → {pair.to}</span>
                    <span className="conversion-rate">{rate.toFixed(4)}</span>
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

      <Card darkMode={darkMode} className="history-card">
        <h3 className="section-subtitle">📋 Recent Conversions</h3>
        {conversionHistory.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No conversion history"
            subtitle="Convert currencies to see history here"
          />
        ) : (
          <>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="table-header">Time</th>
                    <th className="table-header">From</th>
                    <th className="table-header">To</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Result</th>
                    <th className="table-header">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionHistory.map((conversion) => (
                    <tr key={conversion.id} className="history-row">
                      <td className="history-time">
                        {new Date(conversion.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="history-currency">
                        {currencies.find(c => c.code === conversion.from)?.flag}{conversion.from}
                      </td>
                      <td className="history-currency">
                        {currencies.find(c => c.code === conversion.to)?.flag}{conversion.to}
                      </td>
                      <td className="history-amount">{formatNumber(conversion.amount, 2)}</td>
                      <td className="history-result">{formatNumber(conversion.convertedAmount, 2)}</td>
                      <td className="history-source">
                        {conversion.apiSource && (
                          <span className="source-badge">{conversion.apiSource}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setConversionHistory([])} className="clear-history-button">
              🗑️ Clear History
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

// =============== TRADING COMPONENTS ===============
const CurrencyPairSelector = ({ selectedPair, onSelect, darkMode }) => (
  <div className="pair-selector">
    <label className="input-label">Select Trading Pair</label>
    <div className="pairs-grid">
      {TRADING_PAIRS.map(({ pair, spread }) => (
        <button
          key={pair}
          onClick={() => onSelect(pair)}
          className={`pair-button ${selectedPair === pair ? 'active' : ''}`}
        >
          <span className="pair-name">{pair}</span>
          <span className="pair-spread">Spread: {spread.toFixed(4)}</span>
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
      <h3 className="section-subtitle">📊 Order Book - {pair}</h3>
      <div className="order-book-grid">
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
  const [fieldErrors, setFieldErrors] = useState({});

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

      const newFieldErrors = {};
      if (tradeConfig.amount <= 0) newFieldErrors.amount = 'Amount must be greater than 0';
      if (tradeConfig.orderType !== 'market' && tradeConfig.limitPrice <= 0) newFieldErrors.limitPrice = 'Limit price is required';
      if (tradeConfig.stopLoss && tradeConfig.stopLoss >= entryPrice && tradeConfig.direction === TRADE_DIRECTION.BUY) {
        newFieldErrors.stopLoss = 'Stop loss must be below entry price for buy';
      }
      if (tradeConfig.takeProfit && tradeConfig.takeProfit <= entryPrice && tradeConfig.direction === TRADE_DIRECTION.BUY) {
        newFieldErrors.takeProfit = 'Take profit must be above entry price for buy';
      }
      setFieldErrors(newFieldErrors);

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
        isValid: validationErrors.length === 0 && Object.keys(newFieldErrors).length === 0
      });

      setIsCalculating(false);
    }, 200);
  }, [tradeConfig, portfolio, pair, currentRate]);

  useEffect(() => {
    calculateTrade();
  }, [tradeConfig, currentRate, calculateTrade]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecuteTrade();
    }
  };

  const handleExecuteTrade = () => {
    if (errors.length > 0 || Object.keys(fieldErrors).length > 0 || isCalculating) return;

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
    <Card darkMode={darkMode} className="trade-panel-card" onKeyDown={handleKeyDown}>
      <div className="trade-panel-header">
        <h2 className="section-title">🚀 Advanced Trading</h2>
        <div className="trade-panel-actions">
          <span className="balance-display">Balance: ${formatNumber(portfolio.balance)}</span>
          <Tooltip text={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="toggle-button">
              {showAdvanced ? '▲' : '▼'} {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </Tooltip>
        </div>
      </div>

      <CurrencyPairSelector selectedPair={pair} onSelect={onPairChange} darkMode={darkMode} />

      <div className="current-rate-display">
        <div className="rate-header">
          <span className="rate-label">Current Rate:</span>
          <span className="rate-value-large">{currentRate.toFixed(6)}</span>
        </div>
        <div className="rate-details">
          <span>Spread: {(TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0).toFixed(4)}</span>
          <span>Min Trade: {TRADING_PAIRS.find(p => p.pair === pair)?.minTrade || 100}</span>
        </div>
      </div>

      <div className="trade-direction-section">
        <label className="input-label">Direction</label>
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

      <div className="order-type-section">
        <label className="input-label">Order Type</label>
        <div className="order-type-grid">
          {ORDER_TYPES.map(type => (
            <Tooltip key={type.id} text={type.description} position="top">
              <button
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
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="amount-section">
        <div className="amount-header">
          <label className="input-label">Amount ({pair.split('/')[0]})</label>
          <span className="available-amount">Available: {formatNumber(portfolio.currencies[pair.split('/')[0]] || 0, 2)}</span>
        </div>
        <div className="amount-input-wrapper">
          <input
            type="number"
            value={tradeConfig.amount}
            onChange={(e) => setTradeConfig(prev => ({
              ...prev,
              amount: Math.max(0, parseFloat(e.target.value) || 0)
            }))}
            className={`trade-amount-input ${fieldErrors.amount ? 'error' : ''}`}
            min="0"
            step="0.01"
            aria-label="Trade amount"
            placeholder="Enter amount"
          />
          <span className="amount-currency">$</span>
        </div>
        {fieldErrors.amount && <span className="field-error">{fieldErrors.amount}</span>}
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

      {showAdvanced && (
        <div className="advanced-settings slide-down">
          {(tradeConfig.orderType === 'limit' || tradeConfig.orderType === 'stop_limit') && (
            <div className="advanced-setting">
              <label className="input-label">
                Limit Price ({pair.split('/')[1]}) <Tooltip text="Price at which your order will execute">ⓘ</Tooltip>
              </label>
              <input
                type="number"
                value={tradeConfig.limitPrice || ''}
                onChange={(e) => setTradeConfig(prev => ({
                  ...prev,
                  limitPrice: parseFloat(e.target.value) || 0
                }))}
                className={`advanced-input ${fieldErrors.limitPrice ? 'error' : ''}`}
                placeholder="Enter limit price"
                step="0.000001"
                aria-label="Limit price"
              />
              {fieldErrors.limitPrice && <span className="field-error">{fieldErrors.limitPrice}</span>}
            </div>
          )}

          {(tradeConfig.orderType === 'stop' || tradeConfig.orderType === 'stop_limit') && (
            <div className="advanced-setting">
              <label className="input-label">Stop Price ({pair.split('/')[1]})</label>
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
                aria-label="Stop price"
              />
            </div>
          )}

          <div className="risk-management-section">
            <label className="input-label">Risk Management</label>
            <div className="risk-inputs-grid">
              <div>
                <label className="risk-label">Take Profit <Tooltip text="Price at which you want to take profit">ⓘ</Tooltip></label>
                <input
                  type="number"
                  value={tradeConfig.takeProfit || ''}
                  onChange={(e) => setTradeConfig(prev => ({
                    ...prev,
                    takeProfit: parseFloat(e.target.value) || 0
                  }))}
                  className={`risk-input ${fieldErrors.takeProfit ? 'error' : ''}`}
                  placeholder="TP"
                  step="0.000001"
                  aria-label="Take profit"
                />
                {fieldErrors.takeProfit && <span className="field-error">{fieldErrors.takeProfit}</span>}
              </div>
              <div>
                <label className="risk-label">Stop Loss <Tooltip text="Price at which you want to cut losses">ⓘ</Tooltip></label>
                <input
                  type="number"
                  value={tradeConfig.stopLoss || ''}
                  onChange={(e) => setTradeConfig(prev => ({
                    ...prev,
                    stopLoss: parseFloat(e.target.value) || 0
                  }))}
                  className={`risk-input ${fieldErrors.stopLoss ? 'error' : ''}`}
                  placeholder="SL"
                  step="0.000001"
                  aria-label="Stop loss"
                />
                {fieldErrors.stopLoss && <span className="field-error">{fieldErrors.stopLoss}</span>}
              </div>
            </div>

            <div className="risk-level-section">
              <label className="risk-label">Risk Level</label>
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

            <div className="leverage-section">
              <label className="risk-label">Leverage (1:{tradeConfig.leverage})</label>
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
                aria-label="Leverage"
              />
            </div>
          </div>
        </div>
      )}

      {!isCalculating && calculations.entryPrice && (
        <div className={`trade-summary ${calculations.isValid ? 'valid' : 'invalid'}`}>
          <h4 className="summary-title">
            📊 Trade Summary
            {calculations.isValid && <span className="valid-badge">Valid</span>}
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
              <div className={`summary-value ${calculations.potentialProfit >= 0 ? 'success' : 'error'}`}>
                ${calculations.potentialProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="summary-label">Potential Loss:</div>
              <div className={`summary-value ${calculations.potentialLoss <= calculations.maxAllowedLoss ? 'success' : 'error'}`}>
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

      {errors.length > 0 && (
        <div className="error-messages">
          <h4 className="error-title">⚠️ Trade Validation Errors</h4>
          <ul className="error-list">
            {errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}

      <button
        onClick={handleExecuteTrade}
        disabled={errors.length > 0 || Object.keys(fieldErrors).length > 0 || isCalculating}
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
      <div className="keyboard-hint">Press Ctrl+Enter to execute</div>
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

  const chartData = useMemo(() => {
    const data = [];
    let currentValue = portfolio.initialBalance;
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      currentValue = currentValue * (1 + (Math.random() - 0.5) * 0.02);
      data.push({
        date: new Date(timestamp).toLocaleDateString(),
        value: currentValue
      });
    }
    return data;
  }, [portfolio.initialBalance]);

  return (
    <Card darkMode={darkMode} className="portfolio-card">
      <h2 className="section-title">💼 Portfolio Dashboard</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Value</div>
          <div className="metric-value primary">${formatNumber(metrics.totalValue)}</div>
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
            metrics.winRate >= 50 ? 'success' : metrics.winRate >= 30 ? 'warning' : 'error'
          }`}>{formatNumber(metrics.winRate, 1)}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Daily P&L</div>
          <div className={`metric-value ${metrics.dailyPnL >= 0 ? 'success' : 'error'}`}>
            {metrics.dailyPnL >= 0 ? '+' : ''}${formatNumber(metrics.dailyPnL)}
          </div>
        </div>
      </div>

      <div className="portfolio-chart">
        <h3 className="section-subtitle">📈 Performance (30 days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
            <RechartsTooltip />
            <Line type="monotone" dataKey="value" stroke="#667eea" dot={false} animationDuration={500} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="holdings-section">
        <h3 className="section-subtitle">💰 Current Holdings</h3>
        <div className="holdings-grid">
          {Object.entries(portfolio.currencies)
            .filter(([, amount]) => amount > 0)
            .map(([currency, amount]) => {
              const currencyInfo = CURRENCIES.find(c => c.code === currency);
              const rate = currencyInfo?.rate || 1;
              const value = amount * rate;

              return (
                <div key={currency} className="holding-item" style={{ borderLeftColor: currencyInfo?.color || '#667eea' }}>
                  <div>
                    <div className="holding-currency">{currency}</div>
                    <div className="holding-name">{currencyInfo?.name || 'Currency'}</div>
                  </div>
                  <div className="holding-details">
                    <div className="holding-amount">{formatNumber(amount)} {currency}</div>
                    <div className="holding-value">${formatNumber(value)}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="portfolio-stats">
        <div>
          <div>Total Trades: {trades.length}</div>
          <div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div>
        </div>
        <div>
          <div>Avg. Profit: ${(trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) /
            (trades.filter(t => t.profit > 0).length || 1)).toFixed(2)}</div>
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

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
      default:
        break;
    }

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
        <h2 className="section-title">📋 Trade History</h2>
        <div className="trade-history-controls">
          <input
            type="text"
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="trade-search"
            aria-label="Search trades"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="trade-filter"
            aria-label="Filter trades"
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
        <EmptyState
          icon="📊"
          title="No trades found"
          subtitle="Execute some trades to see your history here"
        />
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
                  <tr key={trade.id} className={`trade-row ${isOpen ? 'open' : profit > 0 ? 'profit' : profit < 0 ? 'loss' : ''}`}>
                    <td className="trade-time">
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <div className="trade-date">{new Date(trade.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="trade-pair">
                      <div className="trade-direction-indicator">
                        <span className={`direction-badge ${trade.direction === TRADE_DIRECTION.BUY ? 'buy' : 'sell'}`}>
                          {trade.direction === TRADE_DIRECTION.BUY ? 'BUY' : 'SELL'}
                        </span>
                        <span className="pair-name">{trade.pair}</span>
                      </div>
                    </td>
                    <td className="trade-type">{ORDER_TYPES.find(ot => ot.id === trade.orderType)?.name || trade.orderType}</td>
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
                    <td className="trade-amount">{formatNumber(trade.amount)}</td>
                    <td className="trade-price">{trade.entryPrice?.toFixed(5) || '-'}</td>
                    <td className="trade-price">{trade.exitPrice?.toFixed(5) || '-'}</td>
                    <td className="trade-pnl">
                      {profit !== 0 ? (
                        <span className={`pnl-value ${profit > 0 ? 'profit' : 'loss'}`}>
                          {profit > 0 ? '▲' : '▼'}${Math.abs(profit).toFixed(2)}
                        </span>
                      ) : (
                        <span className="pnl-neutral">-</span>
                      )}
                    </td>
                    <td className="trade-actions">
                      {isOpen ? (
                        <button onClick={() => onCloseTrade(trade.id, trade.entryPrice * (1 + (Math.random() - 0.5) * 0.02))} className="action-button close">Close</button>
                      ) : isPending ? (
                        <button onClick={() => onCancelOrder(trade.id)} className="action-button cancel">Cancel</button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
            (trades.filter(t => t.profit !== 0).length || 1) * 100 || 0),
            1
          )}%</div>
        </div>
      </div>
    </Card>
  );
};

// =============== MAIN COMPONENT ===============
const LiveCurrencySimulator = () => {
  const liveData = useLiveCurrencyData();
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
  const [notifications, setNotifications] = useState([]);
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
  const [activeTab, setActiveTab] = useState('converter');
  const [selectedPair, setSelectedPair] = useState(() => {
    try {
      return localStorage.getItem('selectedPair') || 'USD/EUR';
    } catch {
      return 'USD/EUR';
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (liveData.currencies) {
      setCurrencies(liveData.currencies);
      setLastUpdate(liveData.lastUpdate);
    }
  }, [liveData.currencies, liveData.lastUpdate]);

  useEffect(() => {
    try {
      localStorage.setItem('forex-portfolio', JSON.stringify(portfolio));
    } catch (e) {
      console.error('Error saving portfolio:', e);
    }
  }, [portfolio]);

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (e) {
      console.error('Error saving dark mode:', e);
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('selectedPair', selectedPair);
    } catch (e) {
      console.error('Error saving selected pair:', e);
    }
  }, [selectedPair]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleExecuteTrade = (tradeData) => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        const [fromCurrency, toCurrency] = tradeData.pair.split('/');
        const spread = TRADING_PAIRS.find(p => p.pair === tradeData.pair)?.spread || 0.0001;

        const slippage = Math.random() * 0.001;
        const executionPrice = tradeData.orderType === 'market'
          ? tradeData.calculations.entryPrice * (1 + (Math.random() > 0.5 ? slippage : -slippage))
          : tradeData.limitPrice || tradeData.calculations.entryPrice;

        const spreadCost = tradeData.amount * spread;

        setPortfolio(prev => {
          const newPortfolio = { ...prev };
          const margin = tradeData.calculations.margin;

          if (tradeData.direction === TRADE_DIRECTION.BUY) {
            newPortfolio.balance -= (margin + spreadCost);
            newPortfolio.currencies[toCurrency] =
              (newPortfolio.currencies[toCurrency] || 0) + tradeData.amount;
          } else {
            newPortfolio.currencies[fromCurrency] -= tradeData.amount;
            newPortfolio.balance += margin - spreadCost;
          }

          return newPortfolio;
        });

        const newTrade = {
          ...tradeData,
          entryPrice: executionPrice,
          spreadCost,
          status: tradeData.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
          profit: 0,
          margin: tradeData.calculations.margin
        };

        setTrades(prev => [newTrade, ...prev]);

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

          setPortfolio(prevPortfolio => {
            const newPortfolio = { ...prevPortfolio };
            const [fromCurrency, toCurrency] = trade.pair.split('/');

            if (trade.direction === TRADE_DIRECTION.BUY) {
              newPortfolio.currencies[toCurrency] -= trade.amount;
              newPortfolio.balance += trade.margin + profit;
            } else {
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
    } finally {
      setConfirmReset(false);
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
      <LoadingOverlay isLoading={isLoading || liveData.loading} />

      <ConfirmModal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetPortfolio}
        title="Reset Portfolio"
        message="Are you sure you want to reset your portfolio? All trades will be cleared."
        type="warning"
      />

      {liveData.error && (
        <div className="api-error-banner">
          <span>⚠️ Live rates unavailable: {liveData.error}</span>
          <button onClick={liveData.refresh} className="retry-button">Retry</button>
        </div>
      )}

      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menu"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu slide-up">
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

      <div className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">🚀 ASAP~FUNDS</h1>
            <p className="app-subtitle">
              <span>Professional trading with risk management & currency conversion</span>
              <span className="subtitle-separator">•</span>
              <span>Live Market</span>
              {liveData.apiSource && (
                <>
                  <span className="subtitle-separator">•</span>
                  <span className="live-indicator">🔴 Live: {liveData.apiSource}</span>
                </>
              )}
              <span className="subtitle-separator">•</span>
              <span>Portfolio: ${formatNumber(portfolio.totalValue)}</span>
            </p>
          </div>
          <div className="header-actions">
            <Tooltip text={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="header-button theme-toggle"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
            </Tooltip>
            <Tooltip text="Reset Portfolio">
              <button onClick={() => setConfirmReset(true)} className="header-button reset-button" aria-label="Reset Portfolio">🔄 Reset</button>
            </Tooltip>
            <Tooltip text="Export Trades">
              <button onClick={exportTrades} className="header-button export-button" aria-label="Export Trades">📥 Export</button>
            </Tooltip>
          </div>
        </div>

        <div className="tabs-container">
          {[
            { id: 'converter', label: '💱 Converter', icon: '💱' },
            { id: 'trade', label: '🚀 Trade', icon: '🚀' },
            { id: 'portfolio', label: '💼 Portfolio', icon: '💼' },
            { id: 'history', label: '📋 History', icon: '📋' },
            { id: 'orders', label: '📊 Order Book', icon: '📊' }
          ].map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`tab-button ${activeTab === id ? 'active' : ''}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="timeframe-selector">
          <label className="timeframe-label">Time Frame:</label>
          <div className="timeframe-buttons">
            {TIME_FRAMES.map(tf => (
              <button key={tf.label} onClick={() => setSelectedTimeFrame(tf)} className={`timeframe-button ${selectedTimeFrame.label === tf.label ? 'active' : ''}`}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Notification notifications={notifications} removeNotification={removeNotification} />

      <div className="main-content">
        {activeTab === 'converter' && (
          <CurrencyConverter 
            currencies={currencies} 
            darkMode={darkMode} 
            liveData={liveData}
            onRefresh={liveData.refresh}
          />
        )}

        {activeTab === 'trade' && (
          <div className="trade-panel-grid">
            <AdvancedTradePanel
              portfolio={portfolio}
              currencies={currencies}
              onExecuteTrade={handleExecuteTrade}
              darkMode={darkMode}
              pair={selectedPair}
              onPairChange={setSelectedPair}
            />

            <div className="chart-section">
              <Card darkMode={darkMode} className="chart-card">
                <h2 className="section-title">📈 {selectedPair} - Live Chart</h2>
                <div className="chart-container">
                  <svg width="100%" height="100%" className="chart-svg">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={(i + 1) * 60} x2="100%" y2={(i + 1) * 60} className="chart-grid-line" />
                    ))}
                    <path d={(() => {
                      const points = Array.from({ length: 50 }, (_, i) => {
                        const x = (i / 49) * 100;
                        const y = 50 + Math.sin(i * 0.5) * 40 + Math.random() * 20;
                        return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
                      }).join(' ');
                      return points;
                    })()} className="chart-line" />
                  </svg>

                  <div className="chart-info">
                    <div className="current-price">Current: {currentPairRate.toFixed(5)}</div>
                    <div className="chart-update-time">Last update: {lastUpdate.toLocaleTimeString()}</div>
                  </div>
                </div>
              </Card>

              <OrderBook pair={selectedPair} currencies={currencies} darkMode={darkMode} />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-grid">
            <PortfolioDashboard portfolio={portfolio} trades={trades} darkMode={darkMode} />

            <Card darkMode={darkMode} className="risk-dashboard-card">
              <h2 className="section-title">🛡️ Risk Management</h2>

              <div className="risk-metrics-grid">
                <div className="risk-metric-card" style={{ borderColor: '#10b981' }}>
                  <div className="risk-metric-label">Max Drawdown</div>
                  <div className="risk-metric-value" style={{ color: '#10b981' }}>2.5%</div>
                </div>
                <div className="risk-metric-card" style={{ borderColor: '#f59e0b' }}>
                  <div className="risk-metric-label">Sharpe Ratio</div>
                  <div className="risk-metric-value" style={{ color: '#f59e0b' }}>1.8</div>
                </div>
                <div className="risk-metric-card" style={{ borderColor: '#3b82f6' }}>
                  <div className="risk-metric-label">Volatility</div>
                  <div className="risk-metric-value" style={{ color: '#3b82f6' }}>15%</div>
                </div>
                <div className="risk-metric-card" style={{ borderColor: '#8b5cf6' }}>
                  <div className="risk-metric-label">Value at Risk</div>
                  <div className="risk-metric-value" style={{ color: '#8b5cf6' }}>$250</div>
                </div>
              </div>

              <div className="risk-controls-section">
                <h3 className="section-subtitle">⚙️ Risk Controls</h3>
                <div className="risk-controls-list">
                  {RISK_LEVELS.map(level => (
                    <div key={level.id} className="risk-control-item">
                      <div>
                        <div className="risk-control-name" style={{ color: level.color }}>{level.name}</div>
                        <div className="risk-control-details">
                          Max Position: {(level.maxPositionSize * 100).toFixed(1)}% • Max Loss: {(level.maxLossPerTrade * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="risk-control-indicator" style={{ backgroundColor: level.color }} />
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
          <OrderBook pair={selectedPair} currencies={currencies} darkMode={darkMode} />
        )}
      </div>

      <footer className="app-footer">
        © {new Date().getFullYear()} ASAP~FUNDS . All rights reserved.
        <br />
        <span>Powered By Royzeenet</span>
      </footer>
    </div>
  );
};

export default LiveCurrencySimulator;
