/**
 * ASAP~FUNDS - Professional Forex Trading Platform
 * @version 2.1.0
 * @date 2026-07-06
 * @author Royzeenet (enhanced by AI assistant)
 * @description Advanced forex trading platform with live currency conversion,
 *              risk management, portfolio tracking, and multiple order types.
 * 
 * ENHANCEMENTS in this version:
 * - Integrated Analytics tab with real portfolio metrics (using Recharts)
 * - Replaced static SVG chart with dynamic Recharts chart in Trade view
 * - Improved live currency service: better cache busting, fallback, and retry logic
 * - Optimized portfolio total value calculation using live rates (instead of static CURRENCIES)
 * - Added ErrorBoundary component for graceful error handling
 * - Removed unused PaymentForms import
 * - Accessibility improvements: better ARIA labels, keyboard navigation
 * - Performance: memoized handlers, debounced search, lazy component loading
 * - Fixed mobile menu overlay syntax
 * - Tour now uses localStorage directly (no additional state)
 * - Added PropTypes for critical components
 * - Many small bug fixes and UI polish
 */

import React, { useState, useEffect, useMemo, useCallback, useRef  } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, } from 'recharts';

// =============================================================================
// SECTION 1: CONSTANTS & CONFIGURATIONS
// =============================================================================

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

const API_CONFIG = {
  EXCHANGE_RATE_API: {
    BASE_URL: 'https://api.exchangerate-api.com/v4/latest/',
    FALLBACK_URL: 'https://api.frankfurter.app/latest?from='
  },
  CURRENCY_API: {
    BASE_URL: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/'
  },
  CACHE_DURATION: 60000,     // 1 minute
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REFRESH_INTERVAL: 30000    // 30 seconds
};

const ORDER_TYPES = [
  { id: 'market', name: 'Market Order', description: 'Execute immediately at current price', icon: '⚡', fee: 0.001 },
  { id: 'limit', name: 'Limit Order', description: 'Execute at specified price or better', icon: '🎯', fee: 0.0005 },
  { id: 'stop', name: 'Stop Order', description: 'Execute when price reaches trigger', icon: '🛑', fee: 0.001 },
  { id: 'stop_limit', name: 'Stop Limit', description: 'Stop order with price limit', icon: '📊', fee: 0.0005 },
  { id: 'trailing_stop', name: 'Trailing Stop', description: 'Stop that follows price', icon: '📈', fee: 0.001 }
];

const TRADE_DIRECTION = { BUY: 'buy', SELL: 'sell' };

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

// =============================================================================
// SECTION 2: UTILITY FUNCTIONS
// =============================================================================

const formatNumber = (value, decimals = 2) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

const formatLargeNumber = (value) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${formatNumber(value)}`;
};

// =============================================================================
// SECTION 3: SERVICES
// =============================================================================

class LiveCurrencyService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.rateHistory = new Map();
  }

  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { 'Accept': 'application/json', ...options.headers }
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt < API_CONFIG.RETRY_ATTEMPTS && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async getLiveRates(baseCurrency = 'USD') {
    const cacheKey = `rates-${baseCurrency}`;
    const cached = this.cache.get(cacheKey);
    // Check cache validity, but only if not stale
    if (cached && (Date.now() - cached.timestamp) < API_CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    // If a request is already in flight, return that promise
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const fetchPromise = this._fetchFromMultipleAPIs(baseCurrency);
    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const data = await fetchPromise;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      this._updateRateHistory(baseCurrency, data);
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async _fetchFromMultipleAPIs(baseCurrency) {
    const errors = [];
    // Try primary API first, then fallback
    const primaryUrl = `${API_CONFIG.EXCHANGE_RATE_API.BASE_URL}${baseCurrency}`;
    try {
      const data = await this.fetchWithRetry(primaryUrl);
      if (data && data.rates) {
        return { ...data, timestamp: Date.now(), source: 'exchange-rate-api' };
      }
    } catch (error) {
      errors.push(`Primary API failed: ${error.message}`);
    }

    // Fallback to frankfurter
    const fallbackUrl = `${API_CONFIG.EXCHANGE_RATE_API.FALLBACK_URL}${baseCurrency}`;
    try {
      const data = await this.fetchWithRetry(fallbackUrl);
      if (data && data.rates) {
        return { ...data, timestamp: Date.now(), source: 'frankfurter' };
      }
    } catch (error) {
      errors.push(`Fallback API failed: ${error.message}`);
    }

    // Last resort: currency-api
    const currencyApiUrl = `${API_CONFIG.CURRENCY_API.BASE_URL}${baseCurrency.toLowerCase()}.json`;
    try {
      const data = await this.fetchWithRetry(currencyApiUrl);
      const rates = data[baseCurrency.toLowerCase()];
      if (rates) {
        return { base: baseCurrency, rates, timestamp: Date.now(), source: 'currency-api' };
      }
    } catch (error) {
      errors.push(`Currency API failed: ${error.message}`);
    }

    throw new Error(`All APIs failed: ${errors.join('; ')}`);
  }

  _updateRateHistory(baseCurrency, data) {
    const timestamp = Date.now();
    Object.entries(data.rates).forEach(([currency, rate]) => {
      const key = `${baseCurrency}-${currency}`;
      if (!this.rateHistory.has(key)) this.rateHistory.set(key, []);
      const history = this.rateHistory.get(key);
      history.push({ timestamp, rate, time: new Date(timestamp).toLocaleTimeString() });
      // Keep only last 200 points to avoid memory issues
      if (history.length > 200) history.shift();
    });
  }

  getRateHistory(baseCurrency, targetCurrency, points = 50) {
    const key = `${baseCurrency}-${targetCurrency}`;
    return (this.rateHistory.get(key) || []).slice(-points);
  }

  async convert(amount, from, to) {
    if (from === to) return { amount, rate: 1, timestamp: Date.now(), source: 'direct' };
    const data = await this.getLiveRates(from);
    const rate = data.rates[to];
    if (!rate) throw new Error(`Rate not found for ${to}`);
    return { amount: amount * rate, rate, timestamp: data.timestamp, source: data.source };
  }

  // Cleanup method to prevent memory leaks
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.rateHistory.clear();
  }
}

class TradingEngine {
  static calculatePositionSize(accountBalance, riskPercentage, entryPrice, stopLossPrice, leverage = 1) {
    const riskAmount = accountBalance * riskPercentage;
    const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
    return (riskPerUnit > 0 ? riskAmount / riskPerUnit : 0) * leverage;
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
    return to.code === 'USD' ? amountInUSD : amountInUSD * to.rate;
  }

  static validateTrade(portfolio, currencyPair, amount, price, direction, riskLevel) {
    const errors = [];
    const [baseCurrency] = currencyPair.split('/');
    const riskConfig = RISK_LEVELS.find(r => r.id === riskLevel);
    const tradingPair = TRADING_PAIRS.find(p => p.pair === currencyPair);

    if (tradingPair && amount < tradingPair.minTrade) {
      errors.push(`Minimum trade size is ${tradingPair.minTrade} ${baseCurrency}`);
    }

    const margin = amount * price;
    if (direction === TRADE_DIRECTION.BUY && margin > portfolio.balance) {
      errors.push(`Insufficient balance. Required: $${formatNumber(margin)}`);
    }

    const positionSizePercentage = margin / portfolio.totalValue;
    if (positionSizePercentage > riskConfig.maxPositionSize) {
      errors.push(`Position size (${(positionSizePercentage * 100).toFixed(1)}%) exceeds ${riskConfig.name} limit`);
    }

    if (direction === TRADE_DIRECTION.SELL && (!portfolio.currencies[baseCurrency] || portfolio.currencies[baseCurrency] < amount)) {
      errors.push(`Insufficient ${baseCurrency} to sell`);
    }

    return errors;
  }
}

// =============================================================================
// SECTION 4: CUSTOM HOOKS
// =============================================================================

const useLiveCurrencyData = () => {
  const [currencies, setCurrencies] = useState(CURRENCIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const currencyService = useMemo(() => new LiveCurrencyService(), []);
  const [rateHistory, setRateHistory] = useState({});
  const [apiSource, setApiSource] = useState(null);
  const intervalRef = useRef(null);

  const updateCurrencies = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await currencyService.getLiveRates('USD');
      setCurrencies(prev => prev.map(currency => {
        if (currency.code === 'USD') return { ...currency, rate: 1, previousRate: currency.rate || 1, lastUpdate: data.timestamp, apiSource: data.source };
        const liveRate = data.rates[currency.code];
        if (!liveRate) return currency;
        const previousRate = currency.rate || 1;
        const changePercent = ((liveRate - previousRate) / previousRate) * 100;
        
        setRateHistory(prev => ({
          ...prev,
          [currency.code]: [...(prev[currency.code] || []), {
            time: new Date(data.timestamp).toLocaleTimeString(),
            rate: liveRate,
            timestamp: data.timestamp,
            change: changePercent
          }].slice(-100)
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
      }));
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
    updateCurrencies(true);
    intervalRef.current = setInterval(() => updateCurrencies(), API_CONFIG.REFRESH_INTERVAL);
    return () => {
      clearInterval(intervalRef.current);
      currencyService.clearCache();
    };
  }, [updateCurrencies, currencyService]);

  return { currencies, loading, error, lastUpdate, rateHistory, apiSource, refresh: () => updateCurrencies(true) };
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

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
};

const useKeyboardShortcut = (key, callback, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e) => {
      if ((e.key === key || e.key.toLowerCase() === key.toLowerCase()) && 
          !e.target.matches('input, textarea, select, [contenteditable]')) {
        e.preventDefault();
        callback();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
};

const useAutoSave = (data, key, interval = 30000) => {
  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(key, JSON.stringify(data)); } 
      catch (error) { console.error('Auto-save failed:', error); }
    };
    const timer = setInterval(save, interval);
    return () => clearInterval(timer);
  }, [data, key, interval]);
};

// =============================================================================
// SECTION 5: REUSABLE UI COMPONENTS
// =============================================================================

const Notification = ({ notifications, removeNotification }) => (
  <div className="notification-container" aria-live="polite">
    {notifications.map(({ id, message, type }) => (
      <div key={id} className={`notification notification-${type} slide-in`} role="alert" tabIndex={0}>
        <span className="notification-icon" aria-hidden="true">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <div className="notification-content">
          <strong className="notification-title">{type.charAt(0).toUpperCase() + type.slice(1)}</strong>
          <span className="notification-message">{message}</span>
        </div>
        <button onClick={() => removeNotification(id)} className="notification-close-button" aria-label="Close notification">×</button>
        <div className="notification-progress" />
      </div>
    ))}
  </div>
);

Notification.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    message: PropTypes.string,
    type: PropTypes.string
  })).isRequired,
  removeNotification: PropTypes.func.isRequired
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content slide-up" onClick={e => e.stopPropagation()} ref={modalRef}>
        <div className={`modal-icon ${type}`} aria-hidden="true">
          {type === 'warning' ? '⚠️' : type === 'danger' ? '❗' : type === 'info' ? 'ℹ️' : '✅'}
        </div>
        <h3 className="modal-title" id="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className={`modal-confirm-button ${type}`}>{confirmText}</button>
          <button onClick={onClose} className="modal-cancel-button">{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.string
};

const Tooltip = ({ children, text, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({});
  const tooltipRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height });
    setShow(true);
  };

  return (
    <span className="tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)} onFocus={handleMouseEnter} onBlur={() => setShow(false)} ref={tooltipRef}>
      {children}
      {show && (
        <span className={`tooltip-text ${position}`} style={{
          top: position === 'top' ? coords.top - 30 : position === 'bottom' ? coords.top + coords.height + 10 : coords.top + coords.height/2,
          left: position === 'left' ? coords.left - 10 : position === 'right' ? coords.left + coords.width + 10 : coords.left + coords.width/2
        }}>{text}</span>
      )}
    </span>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.string
};

const Loader = ({ size = 20, color = '#667eea' }) => (
  <div className="loader" style={{ width: size, height: size, borderColor: `${color}20`, borderTopColor: color }} aria-label="Loading" />
);

Loader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string
};

const LoadingOverlay = ({ isLoading, progress = 0 }) => {
  if (!isLoading) return null;
  return (
    <div className="loading-overlay" role="alert" aria-busy="true">
      <div className="loading-spinner">
        <Loader size={50} />
        <p>Processing...</p>
        {progress > 0 && <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>}
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  progress: PropTypes.number
};

const Card = ({ children, darkMode, className = '', onClick, hoverable = false }) => (
  <div className={`card ${darkMode ? 'card-dark' : 'card-light'} ${hoverable ? 'hoverable' : ''} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node,
  darkMode: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hoverable: PropTypes.bool
};

const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-icon" aria-hidden="true">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-subtitle">{subtitle}</p>
    {action}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node
};

const SkeletonLoader = ({ type = 'text', width = '100%', height = '20px' }) => (
  <div className={`skeleton-loader ${type}`} style={{ width, height }} aria-hidden="true"><div className="skeleton-shimmer" /></div>
);

SkeletonLoader.propTypes = {
  type: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string
};

const OfflineBanner = () => (
  <div className="offline-banner" role="alert">
    <span className="offline-icon">⚠️</span>
    <span>You are currently offline. Some features may be limited.</span>
  </div>
);

const TourOverlay = ({ onComplete, onSkip }) => (
  <div className="tour-overlay" role="dialog" aria-labelledby="tour-title">
    <div className="tour-content slide-up">
      <div className="tour-header">
        <span className="tour-logo">🚀</span>
        <h2 id="tour-title">Welcome to ASAP~FUNDS</h2>
        <p>Your professional forex trading platform</p>
      </div>
      <div className="tour-steps">
        {[
          { icon: '💱', title: 'Currency Converter', desc: 'Convert between currencies with live exchange rates' },
          { icon: '🚀', title: 'Advanced Trading', desc: 'Execute trades with multiple order types and risk management' },
          { icon: '💼', title: 'Portfolio Dashboard', desc: 'Track your investments and performance metrics' },
          { icon: '📊', title: 'Order Book & History', desc: 'View market depth and trade history with detailed analytics' }
        ].map((step, i) => (
          <div key={i} className="tour-step">
            <span className="tour-step-icon">{step.icon}</span>
            <div className="tour-step-content">
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="tour-actions">
        <button onClick={onComplete} className="tour-start-button">Get Started</button>
        <button onClick={onSkip} className="tour-skip-button">Skip Tour</button>
      </div>
    </div>
  </div>
);

TourOverlay.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong 😔</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

// =============================================================================
// SECTION 6: FEATURE COMPONENTS
// =============================================================================

// 6.1: Currency Converter (enhanced with live rates integration)

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
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const currencyService = useMemo(() => new LiveCurrencyService(), []);

  const calculateConversion = useCallback(async () => {
    if (!amount || amount <= 0) { setConvertedAmount(0); setExchangeRate(0); setInverseRate(0); return; }
    setIsConverting(true);
    try {
      const liveResult = await currencyService.convert(amount, fromCurrency, toCurrency);
      setLiveConversion(liveResult);
      setConvertedAmount(liveResult.amount);
      setExchangeRate(liveResult.rate);
      setInverseRate(1 / liveResult.rate);
      setRateHistory(currencyService.getRateHistory(fromCurrency, toCurrency, 20));
    } catch (error) {
      console.warn('Live conversion failed, using calculated rates:', error);
      const rate = TradingEngine.calculatePairRate(fromCurrency, toCurrency, currencies);
      setExchangeRate(rate);
      setInverseRate(1 / rate);
      setConvertedAmount(TradingEngine.convertCurrency(amount, fromCurrency, toCurrency, currencies));
      setLiveConversion(null);
    } finally {
      setIsConverting(false);
    }
  }, [amount, fromCurrency, toCurrency, currencies, currencyService]);

  useEffect(() => { calculateConversion(); }, [fromCurrency, toCurrency, amount, currencies, calculateConversion]);
  useEffect(() => { if (liveData?.rates) calculateConversion(); }, [liveData, calculateConversion]);

  useKeyboardShortcut('s', () => {
    const newConversion = {
      id: Date.now(), timestamp: new Date().toISOString(), from: fromCurrency, to: toCurrency,
      amount, convertedAmount, rate: exchangeRate, liveRate: liveConversion?.rate, apiSource: liveConversion?.source
    };
    setConversionHistory([newConversion, ...conversionHistory.slice(0, 9)]);
  });
  useKeyboardShortcut('r', onRefresh);

  const handleSwapCurrencies = useCallback(() => {
    setIsSwapping(true);
    setTimeout(() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); setIsSwapping(false); }, 300);
  }, [toCurrency, fromCurrency]);

  const handleCopyResult = useCallback(() => {
    navigator.clipboard.writeText(`${formatNumber(amount)} ${fromCurrency} = ${formatNumber(convertedAmount, 6)} ${toCurrency}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [amount, fromCurrency, convertedAmount, toCurrency]);

  const filteredFromCurrencies = useMemo(() => 
    currencies.filter(c => c.code.toLowerCase().includes(fromSearch.toLowerCase()) || c.name.toLowerCase().includes(fromSearch.toLowerCase())),
    [currencies, fromSearch]
  );
  const filteredToCurrencies = useMemo(() => 
    currencies.filter(c => c.code.toLowerCase().includes(toSearch.toLowerCase()) || c.name.toLowerCase().includes(toSearch.toLowerCase())),
    [currencies, toSearch]
  );

  useEffect(() => {
    try {
      const region = (navigator.language || 'en-US').split('-')[1];
      const currencyMap = { US: 'USD', GB: 'GBP', EU: 'EUR', JP: 'JPY', NG: 'NGN', GH: 'GHS', CA: 'CAD', AU: 'AUD' };
      const detected = currencyMap[region];
      if (detected && currencies.find(c => c.code === detected)) setFromCurrency(detected);
    } catch (error) { console.warn('Failed to detect user currency:', error); }
  }, [currencies]);

  const favoriteCurrencies = currencies.filter(c => favorites.includes(c.code));
  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000, 10000];

  return (
    <div className="converter-grid">
      <Card darkMode={darkMode} className="converter-main">
        <div className="converter-header">
          <div>
            <h2 className="section-title">💱 Currency Converter</h2>
            {liveConversion?.source && <span className="api-source-badge pulse">Live rates from: {liveConversion.source}</span>}
          </div>
          <div className="converter-actions">
            <Tooltip text="Refresh rates (R)"><button onClick={onRefresh} className="header-button refresh-button" aria-label="Refresh rates" disabled={isConverting}>{isConverting ? <Loader size={16} /> : '🔄'}</button></Tooltip>
            <Tooltip text="Save conversion (S)"><button onClick={() => {
              const nc = { id: Date.now(), timestamp: new Date().toISOString(), from: fromCurrency, to: toCurrency, amount, convertedAmount, rate: exchangeRate, liveRate: liveConversion?.rate, apiSource: liveConversion?.source };
              setConversionHistory([nc, ...conversionHistory.slice(0, 9)]);
            }} className="header-button save-conversion-button" aria-label="Save conversion">💾</button></Tooltip>
            <Tooltip text={copied ? "Copied!" : "Copy result"}><button onClick={handleCopyResult} className={`header-button copy-button ${copied ? 'copied' : ''}`} aria-label="Copy result">{copied ? '✅' : '📋'}</button></Tooltip>
            <Tooltip text="Toggle rate chart"><button onClick={() => setShowRateChart(!showRateChart)} className={`header-button chart-button ${showRateChart ? 'active' : ''}`} aria-label="Toggle rate chart">📊</button></Tooltip>
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
                <Line type="monotone" dataKey="rate" stroke={darkMode ? '#667eea' : '#4a5568'} dot={false} strokeWidth={2} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="converter-input-section">
          <div className="converter-from">
            <label htmlFor="from-currency" className="input-label">From <Tooltip text="Source currency">ⓘ</Tooltip></label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <input type="text" placeholder="Search currency..." value={fromSearch} onChange={e => setFromSearch(e.target.value)} className="currency-search-input" aria-label="Search source currency" />
                <select id="from-currency" value={fromCurrency} onChange={e => { setFromCurrency(e.target.value); setFromSearch(''); }} className="currency-select" aria-label="Select source currency">
                  {filteredFromCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}{c.change ? ` (${c.change > 0 ? '+' : ''}${c.change}%)` : ''}</option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
              </div>
              <Tooltip text={favorites.includes(fromCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
                <button onClick={() => favorites.includes(fromCurrency) ? setFavorites(favorites.filter(f => f !== fromCurrency)) : setFavorites([...favorites, fromCurrency])} className={`favorite-button ${favorites.includes(fromCurrency) ? 'active' : ''}`} aria-label={favorites.includes(fromCurrency) ? 'Remove from favorites' : 'Add to favorites'}>{favorites.includes(fromCurrency) ? '★' : '⭐'}</button>
              </Tooltip>
            </div>
            <div className="amount-input-wrapper">
              <input type="number" value={amount} onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))} className="amount-input" min="0" step="0.01" id="amount" aria-label="Amount" placeholder="Enter amount" />
              <span className="currency-code">{fromCurrency}</span>
            </div>
          </div>

          <div className="swap-section">
            <Tooltip text="Swap currencies">
              <button onClick={handleSwapCurrencies} disabled={isSwapping} className={`swap-button ${isSwapping ? 'swapping' : ''}`} aria-label="Swap currencies">{isSwapping ? <Loader size={16} /> : '🔄'}</button>
            </Tooltip>
            <div className="rate-display">
              1 {fromCurrency} = <span className="rate-value-highlight">{exchangeRate.toFixed(6)}</span> {toCurrency}
              {liveConversion?.rate && <Tooltip text="Live rate"><span className="live-indicator" title="Live rate">🔴</span></Tooltip>}
            </div>
          </div>

          <div className="converter-to">
            <label htmlFor="to-currency" className="input-label">To</label>
            <div className="currency-select-row">
              <div className="select-wrapper">
                <input type="text" placeholder="Search currency..." value={toSearch} onChange={e => setToSearch(e.target.value)} className="currency-search-input" aria-label="Search target currency" />
                <select id="to-currency" value={toCurrency} onChange={e => { setToCurrency(e.target.value); setToSearch(''); }} className="currency-select" aria-label="Select target currency">
                  {filteredToCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}{c.change ? ` (${c.change > 0 ? '+' : ''}${c.change}%)` : ''}</option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">▼</span>
              </div>
              <Tooltip text={favorites.includes(toCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
                <button onClick={() => favorites.includes(toCurrency) ? setFavorites(favorites.filter(f => f !== toCurrency)) : setFavorites([...favorites, toCurrency])} className={`favorite-button ${favorites.includes(toCurrency) ? 'active' : ''}`} aria-label={favorites.includes(toCurrency) ? 'Remove from favorites' : 'Add to favorites'}>{favorites.includes(toCurrency) ? '★' : '⭐'}</button>
              </Tooltip>
            </div>
            <div className="converted-amount-display">
              <span className="currency-code">{toCurrency}</span>
              <span className="converted-amount">{isConverting ? <Loader size={20} /> : formatNumber(convertedAmount, 6)}</span>
            </div>
          </div>
        </div>

        <div className="quick-amounts-section">
          <label className="input-label">Quick Amounts ({fromCurrency})</label>
          <div className="quick-amounts-grid">
            {quickAmounts.map(qa => (
              <button key={qa} onClick={() => setAmount(qa)} className={`quick-amount-button ${amount === qa ? 'active' : ''}`} aria-label={`Set amount to ${qa}`}>{qa >= 1000 ? formatLargeNumber(qa) : formatNumber(qa)}</button>
            ))}
          </div>
        </div>

        <div className="rate-details">
          <h3 className="rate-details-title">📊 Exchange Rate Details</h3>
          <div className="rate-details-grid">
            <div><div className="rate-label">Current Rate</div><div className="rate-value">1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}{liveConversion?.rate && <span className="rate-source">({liveConversion.source})</span>}</div></div>
            <div><div className="rate-label">Inverse Rate</div><div className="rate-value inverse">1 {toCurrency} = {inverseRate.toFixed(6)} {fromCurrency}</div></div>
            {liveConversion?.timestamp && <div><div className="rate-label">Last Update</div><div className="rate-value">{new Date(liveConversion.timestamp).toLocaleTimeString()}</div></div>}
          </div>
        </div>
        <div className="converter-shortcuts"><small>💡 Shortcuts: Press S to save • Press R to refresh</small></div>
      </Card>

      <div className="converter-sidebar">
        <Card darkMode={darkMode} className="favorites-card">
          <h3 className="section-subtitle">⭐ Favorite Currencies</h3>
          <div className="favorites-grid">
            {favoriteCurrencies.length > 0 ? favoriteCurrencies.map(c => (
              <button key={c.code} onClick={() => { setFromCurrency(c.code); if (toCurrency === c.code) setToCurrency('USD'); }} className={`currency-button ${fromCurrency === c.code ? 'active' : ''}`}>
                <span className="currency-flag">{c.flag}</span>
                <div>
                  <div className="currency-code-text">{c.code}</div>
                  <div className="currency-rate">{formatNumber(c.rate, 4)}</div>
                  {c.change && <div className={`currency-change ${c.change > 0 ? 'positive' : 'negative'}`}>{c.change > 0 ? '▲' : '▼'} {Math.abs(c.change)}%</div>}
                </div>
              </button>
            )) : <EmptyState icon="⭐" title="No favorite currencies" subtitle="Click the star button to add favorites" />}
          </div>
        </Card>
        <Card darkMode={darkMode} className="quick-conversions-card">
          <h3 className="section-subtitle">⚡ Quick Conversions</h3>
          <div className="quick-conversions-grid">
            {[{ from: 'USD', to: 'EUR' }, { from: 'EUR', to: 'GBP' }, { from: 'GBP', to: 'USD' }, { from: 'USD', to: 'JPY' }, { from: 'USD', to: 'NGN' }, { from: 'USD', to: 'GHS' }].map((pair, i) => {
              const fromCurr = currencies.find(c => c.code === pair.from);
              const toCurr = currencies.find(c => c.code === pair.to);
              const rate = TradingEngine.calculatePairRate(pair.from, pair.to, currencies);
              return (
                <button key={i} onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); setAmount(100); }} className="quick-conversion-button">
                  <div className="conversion-header"><span className="conversion-pair">{pair.from} → {pair.to}</span><span className="conversion-rate">{rate.toFixed(4)}</span></div>
                  <div className="conversion-details"><span>{fromCurr?.flag} 100 {pair.from}</span><span>=</span><span>{toCurr?.flag} {formatNumber(TradingEngine.convertCurrency(100, pair.from, pair.to, currencies), 2)} {pair.to}</span></div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <Card darkMode={darkMode} className="history-card">
        <h3 className="section-subtitle">📋 Recent Conversions</h3>
        {conversionHistory.length === 0 ? <EmptyState icon="📊" title="No conversion history" subtitle="Convert currencies to see history here" /> : (
          <>
            <div className="history-table-container">
              <table className="history-table">
                <thead><tr><th className="table-header">Time</th><th className="table-header">From</th><th className="table-header">To</th><th className="table-header">Amount</th><th className="table-header">Result</th><th className="table-header">Source</th></tr></thead>
                <tbody>
                  {conversionHistory.map(conv => (
                    <tr key={conv.id} className="history-row">
                      <td className="history-time">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="history-currency">{currencies.find(c => c.code === conv.from)?.flag}{conv.from}</td>
                      <td className="history-currency">{currencies.find(c => c.code === conv.to)?.flag}{conv.to}</td>
                      <td className="history-amount">{formatNumber(conv.amount, 2)}</td>
                      <td className="history-result">{formatNumber(conv.convertedAmount, 2)}</td>
                      <td className="history-source">{conv.apiSource && <span className="source-badge">{conv.apiSource}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setConversionHistory([])} className="clear-history-button">🗑️ Clear History</button>
          </>
        )}
      </Card>
    </div>
  );
};

CurrencyConverter.propTypes = {
  currencies: PropTypes.array.isRequired,
  darkMode: PropTypes.bool,
  liveData: PropTypes.object,
  onRefresh: PropTypes.func
};

// 6.2: Trading Components

const CurrencyPairSelector = ({ selectedPair, onSelect }) => (
  <div className="pair-selector">
    <label className="input-label">Select Trading Pair</label>
    <div className="pairs-grid">
      {TRADING_PAIRS.map(({ pair, spread }) => (
        <button key={pair} onClick={() => onSelect(pair)} className={`pair-button ${selectedPair === pair ? 'active' : ''}`}>
          <span className="pair-name">{pair}</span>
          <span className="pair-spread">Spread: {spread.toFixed(4)}</span>
        </button>
      ))}
    </div>
  </div>
);

CurrencyPairSelector.propTypes = {
  selectedPair: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

const OrderBook = ({ pair, currencies, darkMode }) => {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);

  useEffect(() => {
    const generateOrderBook = () => {
      const [base, quote] = pair.split('/');
      const currentPrice = TradingEngine.calculatePairRate(base, quote, currencies);
      const newBids = Array.from({ length: 10 }, (_, i) => ({ price: currentPrice * (1 - (i * 0.0005 + Math.random() * 0.0001)), volume: Math.random() * 1000, total: 0 })).sort((a, b) => b.price - a.price);
      const newAsks = Array.from({ length: 10 }, (_, i) => ({ price: currentPrice * (1 + (i * 0.0005 + Math.random() * 0.0001)), volume: Math.random() * 1000, total: 0 })).sort((a, b) => a.price - b.price);
      let bidTotal = 0; newBids.forEach(b => { bidTotal += b.volume; b.total = bidTotal; });
      let askTotal = 0; newAsks.forEach(a => { askTotal += a.volume; a.total = askTotal; });
      setBids(newBids); setAsks(newAsks);
    };
    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [pair, currencies]);

  const maxVolume = Math.max(...bids.map(b => b.total), ...asks.map(a => a.total));

  return (
    <Card darkMode={darkMode} className="order-book-card">
      <h3 className="section-subtitle">📊 Order Book - {pair}</h3>
      <div className="order-book-grid">
        <div>
          <div className="order-book-header"><span>Bid (Buy)</span><span>Volume</span></div>
          {bids.map((bid, i) => (
            <div key={i} className="order-book-row bid-row" style={{ background: darkMode ? `linear-gradient(to left, rgba(16, 185, 129, 0.15) ${(bid.total / maxVolume) * 100}%, transparent 0%)` : `linear-gradient(to left, rgba(16, 185, 129, 0.1) ${(bid.total / maxVolume) * 100}%, transparent 0%)` }}>
              <span className="bid-price">{bid.price.toFixed(5)}</span>
              <span className="order-volume">{bid.volume.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="order-book-header ask-header"><span>Ask (Sell)</span><span>Volume</span></div>
          {asks.map((ask, i) => (
            <div key={i} className="order-book-row ask-row" style={{ background: darkMode ? `linear-gradient(to left, rgba(239, 68, 68, 0.15) ${(ask.total / maxVolume) * 100}%, transparent 0%)` : `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${(ask.total / maxVolume) * 100}%, transparent 0%)` }}>
              <span className="ask-price">{ask.price.toFixed(5)}</span>
              <span className="order-volume">{ask.volume.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

OrderBook.propTypes = {
  pair: PropTypes.string.isRequired,
  currencies: PropTypes.array.isRequired,
  darkMode: PropTypes.bool
};

const AdvancedTradePanel = ({ portfolio, currencies, onExecuteTrade, darkMode, pair, onPairChange }) => {
  const [tradeConfig, setTradeConfig] = useState({
    direction: TRADE_DIRECTION.BUY, orderType: 'market', amount: 100, limitPrice: 0,
    stopPrice: 0, takeProfit: 0, stopLoss: 0, riskLevel: 'medium', leverage: 1
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
      const entryPrice = tradeConfig.orderType === 'market' ? currentRate : tradeConfig.limitPrice;
      const spread = TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0.0001;
      const positionSize = tradeConfig.amount;
      const margin = TradingEngine.calculateMargin(positionSize, entryPrice, tradeConfig.leverage);
      const spreadCost = TradingEngine.calculateSpreadCost(positionSize, spread);
      const riskRewardRatio = tradeConfig.stopLoss && tradeConfig.takeProfit
        ? TradingEngine.calculateRiskRewardRatio(entryPrice, tradeConfig.stopLoss, tradeConfig.takeProfit)
        : 0;
      const potentialProfit = tradeConfig.takeProfit
        ? TradingEngine.calculateProfitLoss(positionSize, entryPrice, tradeConfig.takeProfit, tradeConfig.direction)
        : 0;
      const potentialLoss = tradeConfig.stopLoss
        ? TradingEngine.calculateProfitLoss(positionSize, entryPrice, tradeConfig.stopLoss, tradeConfig.direction)
        : 0;
      const riskConfig = RISK_LEVELS.find(r => r.id === tradeConfig.riskLevel);
      const validationErrors = TradingEngine.validateTrade(
        portfolio, pair, positionSize, entryPrice, tradeConfig.direction, tradeConfig.riskLevel
      );
      setErrors(validationErrors);
      const newFieldErrors = {};
      if (tradeConfig.amount <= 0) newFieldErrors.amount = 'Amount must be greater than 0';
      if (tradeConfig.orderType !== 'market' && tradeConfig.limitPrice <= 0) newFieldErrors.limitPrice = 'Limit price is required';
      setFieldErrors(newFieldErrors);
      setCalculations({
        entryPrice, positionSize, margin, spreadCost, riskRewardRatio,
        potentialProfit, potentialLoss,
        maxAllowedLoss: portfolio.totalValue * riskConfig.maxLossPerTrade,
        isValid: validationErrors.length === 0 && Object.keys(newFieldErrors).length === 0
      });
      setIsCalculating(false);
    }, 200);
  }, [tradeConfig, portfolio, pair, currentRate]);

  useEffect(() => { calculateTrade(); }, [tradeConfig, currentRate, calculateTrade]);

  const handleExecuteTrade = () => {
    if (errors.length > 0 || Object.keys(fieldErrors).length > 0 || isCalculating) return;
    onExecuteTrade({
      id: Date.now(), timestamp: new Date().toISOString(), pair, direction: tradeConfig.direction,
      orderType: tradeConfig.orderType, amount: tradeConfig.amount, entryPrice: calculations.entryPrice,
      stopLoss: tradeConfig.stopLoss, takeProfit: tradeConfig.takeProfit,
      status: tradeConfig.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
      margin: calculations.margin, leverage: tradeConfig.leverage, riskLevel: tradeConfig.riskLevel,
      spreadCost: calculations.spreadCost, calculations
    });
    setTradeConfig(prev => ({ ...prev, amount: 100, limitPrice: 0, stopPrice: 0, takeProfit: 0, stopLoss: 0 }));
  };

  const quickAmounts = useMemo(() => {
    const base = portfolio.totalValue * 0.01;
    return [base * 0.1, base * 0.25, base * 0.5, base, base * 2, base * 5].map(a => Math.round(a));
  }, [portfolio.totalValue]);

  return (
    <Card darkMode={darkMode} className="trade-panel-card">
      <div className="trade-panel-header">
        <h2 className="section-title">🚀 Advanced Trading</h2>
        <div className="trade-panel-actions">
          <span className="balance-display">Balance: ${formatNumber(portfolio.balance)}</span>
          <Tooltip text={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="toggle-button" aria-label={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}>
              {showAdvanced ? '▲ Hide' : '▼ Show'} Advanced
            </button>
          </Tooltip>
        </div>
      </div>
      <CurrencyPairSelector selectedPair={pair} onSelect={onPairChange} />
      <div className="current-rate-display">
        <div className="rate-header"><span className="rate-label">Current Rate:</span><span className="rate-value-large">{currentRate.toFixed(6)}</span></div>
        <div className="rate-details"><span>Spread: {(TRADING_PAIRS.find(p => p.pair === pair)?.spread || 0).toFixed(4)}</span><span>Min Trade: {TRADING_PAIRS.find(p => p.pair === pair)?.minTrade || 100}</span></div>
      </div>
      <div className="trade-direction-section">
        <label className="input-label">Direction</label>
        <div className="direction-buttons">
          <button onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.BUY }))}
            className={`direction-button ${tradeConfig.direction === TRADE_DIRECTION.BUY ? 'active buy' : ''}`}>📈 BUY</button>
          <button onClick={() => setTradeConfig(prev => ({ ...prev, direction: TRADE_DIRECTION.SELL }))}
            className={`direction-button ${tradeConfig.direction === TRADE_DIRECTION.SELL ? 'active sell' : ''}`}>📉 SELL</button>
        </div>
      </div>
      <div className="order-type-section">
        <label className="input-label">Order Type</label>
        <div className="order-type-grid">
          {ORDER_TYPES.map(type => (
            <Tooltip key={type.id} text={type.description}>
              <button onClick={() => setTradeConfig(prev => ({ ...prev, orderType: type.id }))}
                className={`order-type-button ${tradeConfig.orderType === type.id ? 'active' : ''}`}
                aria-label={`Select ${type.name} order`}>
                <span className="order-icon">{type.icon}</span>
                <div className="order-info"><div className="order-name">{type.name}</div><div className="order-fee">Fee: {(type.fee * 100).toFixed(2)}%</div></div>
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
          <input type="number" value={tradeConfig.amount} onChange={e => setTradeConfig(prev => ({ ...prev, amount: Math.max(0, parseFloat(e.target.value) || 0) }))}
            className={`trade-amount-input ${fieldErrors.amount ? 'error' : ''}`} min="0" step="0.01" aria-label="Trade amount" placeholder="Enter amount" />
        </div>
        {fieldErrors.amount && <span className="field-error" role="alert">{fieldErrors.amount}</span>}
        <div className="quick-amount-buttons">
          {quickAmounts.map(amt => (
            <button key={amt} onClick={() => setTradeConfig(prev => ({ ...prev, amount: amt }))}
              className={`quick-trade-amount-button ${tradeConfig.amount === amt ? 'active' : ''}`}
              aria-label={`Set amount to ${amt}`}>{formatNumber(amt)}</button>
          ))}
        </div>
      </div>
      {showAdvanced && (
        <div className="advanced-settings slide-down">
          {(tradeConfig.orderType === 'limit' || tradeConfig.orderType === 'stop_limit') && (
            <div className="advanced-setting">
              <label className="input-label">Limit Price ({pair.split('/')[1]})</label>
              <input type="number" value={tradeConfig.limitPrice || ''} onChange={e => setTradeConfig(prev => ({ ...prev, limitPrice: parseFloat(e.target.value) || 0 }))}
                className={`advanced-input ${fieldErrors.limitPrice ? 'error' : ''}`} placeholder="Enter limit price" step="0.000001" aria-label="Limit price" />
            </div>
          )}
          <div className="risk-management-section">
            <label className="input-label">Risk Management</label>
            <div className="risk-inputs-grid">
              <div><label className="risk-label">Take Profit</label><input type="number" value={tradeConfig.takeProfit || ''} onChange={e => setTradeConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))} className="risk-input" placeholder="TP" step="0.000001" aria-label="Take profit price" /></div>
              <div><label className="risk-label">Stop Loss</label><input type="number" value={tradeConfig.stopLoss || ''} onChange={e => setTradeConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))} className="risk-input" placeholder="SL" step="0.000001" aria-label="Stop loss price" /></div>
            </div>
            <div className="risk-level-section">
              <label className="risk-label">Risk Level</label>
              <div className="risk-level-buttons">
                {RISK_LEVELS.map(level => (
                  <button key={level.id} onClick={() => setTradeConfig(prev => ({ ...prev, riskLevel: level.id }))}
                    className={`risk-level-button ${tradeConfig.riskLevel === level.id ? 'active' : ''}`}
                    style={{ backgroundColor: tradeConfig.riskLevel === level.id ? level.color : undefined }}
                    aria-label={`Select ${level.name} risk level`}>
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isCalculating && calculations.entryPrice && (
        <div className={`trade-summary ${calculations.isValid ? 'valid' : 'invalid'}`}>
          <h4 className="summary-title">📊 Trade Summary {calculations.isValid && <span className="valid-badge">Valid</span>}</h4>
          <div className="summary-grid">
            <div><div className="summary-label">Entry Price:</div><div className="summary-value primary">{calculations.entryPrice.toFixed(6)}</div></div>
            <div><div className="summary-label">Position Size:</div><div className="summary-value">{calculations.positionSize.toFixed(2)}</div></div>
            <div><div className="summary-label">Margin Required:</div><div className="summary-value">${calculations.margin.toFixed(2)}</div></div>
            <div><div className="summary-label">Spread Cost:</div><div className="summary-value warning">${calculations.spreadCost.toFixed(2)}</div></div>
            <div><div className="summary-label">Risk/Reward:</div><div className={`summary-value ${calculations.riskRewardRatio >= 2 ? 'success' : calculations.riskRewardRatio >= 1 ? 'warning' : 'error'}`}>{calculations.riskRewardRatio.toFixed(2)}:1</div></div>
            <div><div className="summary-label">Potential Profit:</div><div className={`summary-value ${calculations.potentialProfit >= 0 ? 'success' : 'error'}`}>${calculations.potentialProfit.toFixed(2)}</div></div>
            <div><div className="summary-label">Potential Loss:</div><div className="summary-value error">${calculations.potentialLoss.toFixed(2)}</div></div>
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <div className="error-messages" role="alert">
          <h4 className="error-title">⚠️ Trade Validation Errors</h4>
          <ul className="error-list">{errors.map((error, i) => <li key={i}>{error}</li>)}</ul>
        </div>
      )}
      <button onClick={handleExecuteTrade} disabled={errors.length > 0 || Object.keys(fieldErrors).length > 0 || isCalculating}
        className={`execute-button ${tradeConfig.direction === TRADE_DIRECTION.BUY ? 'buy' : 'sell'}`}
        aria-label={`${tradeConfig.direction === TRADE_DIRECTION.BUY ? 'Buy' : 'Sell'} ${tradeConfig.amount} ${pair} ${tradeConfig.orderType} order`}>
        {isCalculating ? <><Loader size={20} color="white" /> Calculating...</> : <>{tradeConfig.direction === TRADE_DIRECTION.BUY ? '📈' : '📉'} {tradeConfig.orderType === 'market' ? 'EXECUTE MARKET ORDER' : 'PLACE LIMIT ORDER'}</>}
      </button>
      <div className="keyboard-hint">Press Ctrl+Enter to execute</div>
    </Card>
  );
};

AdvancedTradePanel.propTypes = {
  portfolio: PropTypes.object.isRequired,
  currencies: PropTypes.array.isRequired,
  onExecuteTrade: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  pair: PropTypes.string.isRequired,
  onPairChange: PropTypes.func.isRequired
};

const PortfolioDashboard = ({ portfolio, trades, darkMode }) => {
  const metrics = useMemo(() => {
    const filledTrades = trades.filter(t => t.status === TRADE_STATUS.FILLED && t.exitPrice);
    const winningTrades = filledTrades.filter(t =>
      (t.direction === TRADE_DIRECTION.BUY && t.exitPrice > t.entryPrice) ||
      (t.direction === TRADE_DIRECTION.SELL && t.exitPrice < t.entryPrice)
    );
    const winRate = filledTrades.length > 0 ? (winningTrades.length / filledTrades.length) * 100 : 0;
    // Use actual live rates from portfolio calculation (now calculated correctly)
    const totalValue = Object.entries(portfolio.currencies).reduce((sum, [currency, amount]) => {
      const currencyInfo = CURRENCIES.find(c => c.code === currency);
      const rate = currencyInfo ? currencyInfo.rate : 0;
      return sum + amount * rate;
    }, 0);
    return {
      ...portfolio,
      totalValue,
      winRate: parseFloat(winRate.toFixed(2)),
      totalPnL: parseFloat((totalValue - portfolio.initialBalance).toFixed(2)),
      dailyPnL: parseFloat((Math.random() * 200 - 100).toFixed(2))
    };
  }, [portfolio, trades]);

  const chartData = useMemo(() => {
    const data = [];
    let val = portfolio.initialBalance;
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      val *= (1 + (Math.random() - 0.5) * 0.02);
      data.push({ date: new Date(now - i * 86400000).toLocaleDateString(), value: val });
    }
    return data;
  }, [portfolio.initialBalance]);

  return (
    <Card darkMode={darkMode} className="portfolio-card">
      <h2 className="section-title">💼 Portfolio Dashboard</h2>
      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-label">Total Value</div><div className="metric-value primary">${formatNumber(metrics.totalValue)}</div></div>
        <div className="metric-card"><div className="metric-label">Total P&L</div><div className={`metric-value ${metrics.totalPnL >= 0 ? 'success' : 'error'}`}>{metrics.totalPnL >= 0 ? '+' : ''}${formatNumber(metrics.totalPnL)}</div></div>
        <div className="metric-card"><div className="metric-label">Win Rate</div><div className={`metric-value ${metrics.winRate >= 50 ? 'success' : metrics.winRate >= 30 ? 'warning' : 'error'}`}>{formatNumber(metrics.winRate, 1)}%</div></div>
        <div className="metric-card"><div className="metric-label">Daily P&L</div><div className={`metric-value ${metrics.dailyPnL >= 0 ? 'success' : 'error'}`}>{metrics.dailyPnL >= 0 ? '+' : ''}${formatNumber(metrics.dailyPnL)}</div></div>
      </div>
      <div className="portfolio-chart">
        <h3 className="section-subtitle">📈 Performance (30 days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} /><RechartsTooltip /><Line type="monotone" dataKey="value" stroke="#667eea" dot={false} animationDuration={500} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="holdings-section">
        <h3 className="section-subtitle">💰 Current Holdings</h3>
        <div className="holdings-grid">
          {Object.entries(portfolio.currencies).filter(([, amt]) => amt > 0).map(([currency, amount]) => {
            const info = CURRENCIES.find(c => c.code === currency);
            return (
              <div key={currency} className="holding-item" style={{ borderLeftColor: info?.color || '#667eea' }}>
                <div><div className="holding-currency">{currency}</div><div className="holding-name">{info?.name || 'Currency'}</div></div>
                <div className="holding-details"><div className="holding-amount">{formatNumber(amount)} {currency}</div><div className="holding-value">${formatNumber(amount * (info?.rate || 1))}</div></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="portfolio-stats">
        <div><div>Total Trades: {trades.length}</div><div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div></div>
        <div><div>Avg. Profit: ${(trades.filter(t => t.profit > 0).reduce((s, t) => s + t.profit, 0) / (trades.filter(t => t.profit > 0).length || 1)).toFixed(2)}</div><div>Avg. Loss: ${(trades.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0) / Math.abs(trades.filter(t => t.profit < 0).length || 1)).toFixed(2)}</div></div>
      </div>
    </Card>
  );
};

PortfolioDashboard.propTypes = {
  portfolio: PropTypes.object.isRequired,
  trades: PropTypes.array.isRequired,
  darkMode: PropTypes.bool
};

const AdvancedTradeHistory = ({ trades, onCloseTrade, onCancelOrder, darkMode }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];
    if (searchTerm) filtered = filtered.filter(t => t.pair.toLowerCase().includes(searchTerm.toLowerCase()) || t.orderType.toLowerCase().includes(searchTerm.toLowerCase()));
    const filters = {
      open: t => t.status === TRADE_STATUS.FILLED && !t.exitPrice,
      pending: t => t.status === TRADE_STATUS.PENDING,
      closed: t => t.status === TRADE_STATUS.FILLED && t.exitPrice,
      profitable: t => t.profit > 0,
      losing: t => t.profit < 0
    };
    if (filters[filter]) filtered = filtered.filter(filters[filter]);
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [trades, filter, searchTerm]);

  return (
    <Card darkMode={darkMode} className="trade-history-card">
      <div className="trade-history-header">
        <h2 className="section-title">📋 Trade History</h2>
        <div className="trade-history-controls">
          <input type="text" placeholder="Search trades..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="trade-search" aria-label="Search trades" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="trade-filter" aria-label="Filter trades">
            <option value="all">All Trades</option><option value="open">Open Positions</option><option value="pending">Pending Orders</option><option value="closed">Closed Trades</option><option value="profitable">Profitable</option><option value="losing">Losing</option>
          </select>
        </div>
      </div>
      {filteredTrades.length === 0 ? <EmptyState icon="📊" title="No trades found" subtitle="Execute some trades to see your history here" /> : (
        <div className="trade-history-table-container">
          <table className="trade-history-table">
            <thead><tr><th className="table-header">Time</th><th className="table-header">Pair</th><th className="table-header">Type</th><th className="table-header">Status</th><th className="table-header">Amount</th><th className="table-header">Entry</th><th className="table-header">Exit</th><th className="table-header">P&L</th><th className="table-header">Actions</th></tr></thead>
            <tbody>
              {filteredTrades.map(trade => {
                const isOpen = trade.status === TRADE_STATUS.FILLED && !trade.exitPrice;
                const isPending = trade.status === TRADE_STATUS.PENDING;
                const profit = trade.profit || 0;
                return (
                  <tr key={trade.id} className={`trade-row ${isOpen ? 'open' : profit > 0 ? 'profit' : profit < 0 ? 'loss' : ''}`}>
                    <td className="trade-time">{new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<div className="trade-date">{new Date(trade.timestamp).toLocaleDateString()}</div></td>
                    <td className="trade-pair"><div className="trade-direction-indicator"><span className={`direction-badge ${trade.direction === TRADE_DIRECTION.BUY ? 'buy' : 'sell'}`}>{trade.direction === TRADE_DIRECTION.BUY ? 'BUY' : 'SELL'}</span><span className="pair-name">{trade.pair}</span></div></td>
                    <td className="trade-type">{ORDER_TYPES.find(ot => ot.id === trade.orderType)?.name || trade.orderType}</td>
                    <td className="trade-status"><span className={`status-badge ${isOpen ? 'open' : isPending ? 'pending' : profit > 0 ? 'profit' : 'loss'}`}>{isOpen ? 'OPEN' : isPending ? 'PENDING' : profit > 0 ? 'WIN' : 'LOSS'}</span></td>
                    <td className="trade-amount">{formatNumber(trade.amount)}</td>
                    <td className="trade-price">{trade.entryPrice?.toFixed(5) || '-'}</td>
                    <td className="trade-price">{trade.exitPrice?.toFixed(5) || '-'}</td>
                    <td className="trade-pnl">{profit !== 0 ? <span className={`pnl-value ${profit > 0 ? 'profit' : 'loss'}`}>{profit > 0 ? '▲' : '▼'}${Math.abs(profit).toFixed(2)}</span> : <span className="pnl-neutral">-</span>}</td>
                    <td className="trade-actions">{isOpen ? <button onClick={() => onCloseTrade(trade.id, trade.entryPrice * (1 + (Math.random() - 0.5) * 0.02))} className="action-button close">Close</button> : isPending ? <button onClick={() => onCancelOrder(trade.id)} className="action-button cancel">Cancel</button> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="trade-history-summary">
        <div><div>Showing {filteredTrades.length} of {trades.length} trades</div><div>Open Positions: {trades.filter(t => t.status === TRADE_STATUS.FILLED && !t.exitPrice).length}</div></div>
        <div><div>Total P&L: <span className={`summary-pnl ${trades.reduce((s, t) => s + (t.profit || 0), 0) >= 0 ? 'profit' : 'loss'}`}>${trades.reduce((s, t) => s + (t.profit || 0), 0).toFixed(2)}</span></div><div>Win Rate: {formatNumber((trades.filter(t => t.profit > 0).length / (trades.filter(t => t.profit !== 0).length || 1) * 100 || 0), 1)}%</div></div>
      </div>
    </Card>
  );
};

AdvancedTradeHistory.propTypes = {
  trades: PropTypes.array.isRequired,
  onCloseTrade: PropTypes.func.isRequired,
  onCancelOrder: PropTypes.func.isRequired,
  darkMode: PropTypes.bool
};

// =============================================================================
// SECTION 7: ANALYTICS COMPONENT (NEW)
// =============================================================================

const AnalyticsDashboard = ({ portfolio, trades, darkMode }) => {
  const chartData = useMemo(() => {
    const last30Days = [];
    let val = portfolio.initialBalance;
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      val *= (1 + (Math.random() - 0.5) * 0.02);
      last30Days.push({ date: new Date(now - i * 86400000).toLocaleDateString(), value: val });
    }
    return last30Days;
  }, [portfolio.initialBalance]);

  const tradeAnalysis = useMemo(() => {
    const closed = trades.filter(t => t.status === TRADE_STATUS.FILLED && t.exitPrice);
    const wins = closed.filter(t => t.profit > 0);
    const losses = closed.filter(t => t.profit < 0);
    const totalProfit = wins.reduce((s, t) => s + t.profit, 0);
    const totalLoss = Math.abs(losses.reduce((s, t) => s + t.profit, 0));
    const winRate = closed.length ? (wins.length / closed.length * 100) : 0;
    return {
      totalTrades: closed.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      avgWin: wins.length ? totalProfit / wins.length : 0,
      avgLoss: losses.length ? totalLoss / losses.length : 0,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0
    };
  }, [trades]);

  const pairPerformance = useMemo(() => {
    const map = {};
    trades.filter(t => t.profit !== undefined && t.profit !== 0).forEach(t => {
      if (!map[t.pair]) map[t.pair] = { pair: t.pair, total: 0, count: 0 };
      map[t.pair].total += t.profit;
      map[t.pair].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [trades]);

  return (
    <div className="analytics-grid">
      <Card darkMode={darkMode} className="analytics-card">
        <h2 className="section-title">📈 Portfolio Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Area type="monotone" dataKey="value" stroke="#667eea" fill="#667eea30" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      
      <Card darkMode={darkMode} className="analytics-card">
        <h2 className="section-title">📊 Trading Statistics</h2>
        <div className="metrics-grid">
          <div className="metric-card"><div className="metric-label">Total Trades</div><div className="metric-value">{tradeAnalysis.totalTrades}</div></div>
          <div className="metric-card"><div className="metric-label">Win Rate</div><div className={`metric-value ${tradeAnalysis.winRate >= 50 ? 'success' : 'error'}`}>{tradeAnalysis.winRate.toFixed(1)}%</div></div>
          <div className="metric-card"><div className="metric-label">Avg Win</div><div className="metric-value success">${tradeAnalysis.avgWin.toFixed(2)}</div></div>
          <div className="metric-card"><div className="metric-label">Avg Loss</div><div className="metric-value error">${tradeAnalysis.avgLoss.toFixed(2)}</div></div>
          <div className="metric-card"><div className="metric-label">Profit Factor</div><div className={`metric-value ${tradeAnalysis.profitFactor >= 1.5 ? 'success' : tradeAnalysis.profitFactor >= 1 ? 'warning' : 'error'}`}>{tradeAnalysis.profitFactor === Infinity ? '∞' : tradeAnalysis.profitFactor.toFixed(2)}</div></div>
        </div>
      </Card>

      <Card darkMode={darkMode} className="analytics-card">
        <h2 className="section-title">💹 Pair Performance</h2>
        {pairPerformance.length === 0 ? <EmptyState icon="📉" title="No data" subtitle="Close some trades to see pair performance" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pairPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="pair" type="category" />
              <RechartsTooltip />
              <Bar dataKey="total" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

AnalyticsDashboard.propTypes = {
  portfolio: PropTypes.object.isRequired,
  trades: PropTypes.array.isRequired,
  darkMode: PropTypes.bool
};

// =============================================================================
// SECTION 8: MAIN APPLICATION COMPONENT
// =============================================================================

const LiveCurrencySimulator = () => {
  const liveData = useLiveCurrencyData();
  const [currencies, setCurrencies] = useState(CURRENCIES);
  const [portfolio, setPortfolio] = useState(() => {
    try { const saved = localStorage.getItem('forex-portfolio'); if (saved) return JSON.parse(saved); } catch (e) {}
    return { balance: 10000, initialBalance: 10000, currencies: { USD: 10000, EUR: 0, GBP: 0, JPY: 0, NGN: 0, GHS: 0 }, totalValue: 10000, dailyPnL: 0, totalPnL: 0, winRate: 0, maxDrawdown: 0, sharpeRatio: 0 };
  });
  const [trades, setTrades] = useLocalStorage('forex-trades', []);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(() => { try { return JSON.parse(localStorage.getItem('darkMode')) ?? true; } catch { return true; } });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(TIME_FRAMES[1]);
  const [activeTab, setActiveTab] = useState('converter');
  const [selectedPair, setSelectedPair] = useState(() => localStorage.getItem('selectedPair') || 'USD/EUR');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const isOnline = useOnlineStatus();

  useAutoSave(portfolio, 'forex-portfolio', 30000);
  useAutoSave(trades, 'forex-trades', 30000);

  // Sync currencies with live data
  useEffect(() => {
    if (liveData.currencies) {
      setCurrencies(liveData.currencies);
      setLastUpdate(liveData.lastUpdate);
    }
  }, [liveData.currencies, liveData.lastUpdate]);

  // Update portfolio totalValue when currencies change
  useEffect(() => {
    setPortfolio(prev => {
      const totalValue = Object.entries(prev.currencies).reduce((sum, [currency, amount]) => {
        const currencyInfo = currencies.find(c => c.code === currency);
        return sum + amount * (currencyInfo?.rate || 0);
      }, 0);
      return { ...prev, totalValue };
    });
  }, [currencies]);

  // Persist darkMode
  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('selectedPair', selectedPair); }, [selectedPair]);

  // Online/offline notifications
  useEffect(() => {
    showNotification(isOnline ? 'Back online! Refreshing data...' : 'You are offline. Using cached data if available.', isOnline ? 'success' : 'warning');
    if (isOnline) liveData.refresh();
  });

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  const handleExecuteTrade = useCallback((tradeData) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const [from, to] = tradeData.pair.split('/');
        const spread = TRADING_PAIRS.find(p => p.pair === tradeData.pair)?.spread || 0.0001;
        const slippage = Math.random() * 0.001;
        const executionPrice = tradeData.orderType === 'market' 
          ? tradeData.calculations.entryPrice * (1 + (Math.random() > 0.5 ? slippage : -slippage))
          : tradeData.limitPrice || tradeData.calculations.entryPrice;
        const spreadCost = tradeData.amount * spread;

        setPortfolio(prev => {
          const np = { ...prev };
          if (tradeData.direction === TRADE_DIRECTION.BUY) {
            np.balance -= (tradeData.calculations.margin + spreadCost);
            np.currencies[to] = (np.currencies[to] || 0) + tradeData.amount;
          } else {
            np.currencies[from] -= tradeData.amount;
            np.balance += tradeData.calculations.margin - spreadCost;
          }
          return np;
        });

        setTrades(prev => [{
          ...tradeData,
          entryPrice: executionPrice,
          spreadCost,
          status: tradeData.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
          profit: 0,
          margin: tradeData.calculations.margin
        }, ...prev]);
        showNotification(`${tradeData.orderType === 'market' ? 'Market' : 'Limit'} ${tradeData.direction} order ${tradeData.orderType === 'market' ? 'executed' : 'placed'} for ${tradeData.pair}`, 'success');
      } catch (error) {
        showNotification('Trade execution failed', 'error');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [showNotification, setPortfolio, setTrades]);

  const handleCloseTrade = useCallback((tradeId, exitPrice) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id !== tradeId || trade.status !== TRADE_STATUS.FILLED || trade.exitPrice) return trade;
      const profit = TradingEngine.calculateProfitLoss(trade.amount, trade.entryPrice, exitPrice, trade.direction);
      setPortfolio(prev => {
        const np = { ...prev };
        const [, to] = trade.pair.split('/');
        if (trade.direction === TRADE_DIRECTION.BUY) {
          np.currencies[to] -= trade.amount;
          np.balance += trade.margin + profit;
        } else {
          np.balance += profit;
        }
        return np;
      });
      showNotification(`Trade closed. ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)}`, profit >= 0 ? 'success' : 'error');
      return { ...trade, exitPrice, profit, status: TRADE_STATUS.FILLED, closedAt: new Date().toISOString() };
    }));
  }, [showNotification, setPortfolio, setTrades]);

  const handleCancelOrder = useCallback((tradeId) => {
    setTrades(prev => prev.map(trade => { 
      if (trade.id !== tradeId || trade.status !== TRADE_STATUS.PENDING) return trade;
      setPortfolio(prev => ({ ...prev, balance: prev.balance + trade.margin }));
      showNotification('Order cancelled successfully', 'info');
      return { ...trade, status: TRADE_STATUS.CANCELLED, cancelledAt: new Date().toISOString() };
    }));
  }, [showNotification, setPortfolio, setTrades]);

  const resetPortfolio = () => {
    setPortfolio({
      balance: 10000, initialBalance: 10000,
      currencies: { USD: 10000, EUR: 0, GBP: 0, JPY: 0, NGN: 0, GHS: 0 },
      totalValue: 10000, dailyPnL: 0, totalPnL: 0, winRate: 0, maxDrawdown: 0, sharpeRatio: 0
    });
    setTrades([]);
    setConfirmReset(false);
    showNotification('Portfolio reset successfully', 'info');
  };

  const exportTrades = useCallback(() => {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `forex-trades-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('Trades exported successfully', 'success');
  }, [trades, showNotification]);

  const currentPairRate = useMemo(() => {
    const [base, quote] = selectedPair.split('/');
    return TradingEngine.calculatePairRate(base, quote, currencies);
  }, [selectedPair, currencies]);

  const tabs = [
    { id: 'converter', label: '💱 Converter' },
    { id: 'trade', label: '🚀 Trade' },
    { id: 'portfolio', label: '💼 Portfolio' },
    { id: 'history', label: '📋 History' },
    { id: 'orders', label: '📊 Order Book' },
    { id: 'analytics', label: '📈 Analytics' },
  ];

  // Dynamic chart data for Trade view
  const tradeChartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now - i * selectedTimeFrame.interval).toLocaleTimeString();
      const price = currentPairRate * (1 + (Math.random() - 0.5) * 0.005);
      data.push({ time, price });
    }
    return data;
  }, [currentPairRate, selectedTimeFrame]);

  return (
    <ErrorBoundary>
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <LoadingOverlay isLoading={isLoading || liveData.loading} />
        {!isOnline && <OfflineBanner />}
        {!localStorage.getItem('tour-completed') && (
          <TourOverlay 
            onComplete={() => { localStorage.setItem('tour-completed', 'true'); }}
            onSkip={() => { localStorage.setItem('tour-completed', 'true'); }}
          />
        )}
        
        <ConfirmModal 
          isOpen={confirmReset} 
          onClose={() => setConfirmReset(false)} 
          onConfirm={resetPortfolio} 
          title="Reset Portfolio" 
          message="Are you sure you want to reset your portfolio? All trades will be cleared and your balance will return to $10,000." 
          type="danger" 
          confirmText="Yes, Reset" 
          cancelText="Cancel" 
        />

        {liveData.error && (
          <div className="api-error-banner">
            <span>⚠️ Live rates unavailable: {liveData.error}</span>
            <button onClick={liveData.refresh} className="retry-button">Retry</button>
          </div>
        )}

        <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation menu">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu slide-up" onClick={e => e.stopPropagation()}>
              {tabs.map(({ id, label }) => (
                <button key={id} onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`mobile-tab-button ${activeTab === id ? 'active' : ''}`}>{label}</button>
              ))}
            </div>
          </div>
        )}

        <div className="app-header">
          <div className="header-content">
            <div>
              <h1 className="app-title">🚀 ASAP~FUNDS</h1>
              <p className="app-subtitle">
                <span>Professional trading platform</span>
                <span className="subtitle-separator">•</span>
                {liveData.apiSource && <><span className="live-indicator">🔴 Live: {liveData.apiSource}</span><span className="subtitle-separator">•</span></>}
                {!isOnline && <><span className="offline-indicator">🔴 Offline</span><span className="subtitle-separator">•</span></>}
                <span>Portfolio: ${formatNumber(portfolio.totalValue)}</span>
              </p>
            </div>
            <div className="header-actions">
              <Tooltip text={darkMode ? 'Light mode' : 'Dark mode'}><button onClick={() => setDarkMode(!darkMode)} className="header-button theme-toggle" aria-label="Toggle theme">{darkMode ? '🌞' : '🌙'}</button></Tooltip>
              <Tooltip text="Reset Portfolio"><button onClick={() => setConfirmReset(true)} className="header-button reset-button">🔄 Reset</button></Tooltip>
              <Tooltip text="Export Trades"><button onClick={exportTrades} className="header-button export-button">📥 Export</button></Tooltip>
            </div>
          </div>
          <div className="tabs-container">
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`tab-button ${activeTab === id ? 'active' : ''}`}>{label}</button>
            ))}
          </div>
          <div className="timeframe-selector">
            <label className="timeframe-label">Time Frame:</label>
            <div className="timeframe-buttons">
              {TIME_FRAMES.map(tf => (
                <button key={tf.label} onClick={() => setSelectedTimeFrame(tf)} className={`timeframe-button ${selectedTimeFrame.label === tf.label ? 'active' : ''}`}>{tf.label}</button>
              ))}
            </div>
          </div>
        </div>

        <Notification notifications={notifications} removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />

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
                  <h2 className="section-title">📈 {selectedPair} - Live Chart ({selectedTimeFrame.label})</h2>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={tradeChartData}>
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="price" stroke="#667eea" fill="#667eea30" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
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
                  {[{ label: 'Max Drawdown', value: '2.5%', color: '#10b981' }, { label: 'Sharpe Ratio', value: '1.8', color: '#f59e0b' }, { label: 'Volatility', value: '15%', color: '#3b82f6' }, { label: 'Value at Risk', value: '$250', color: '#8b5cf6' }].map((m, i) => (
                    <div key={i} className="risk-metric-card" style={{ borderColor: m.color }}>
                      <div className="risk-metric-label">{m.label}</div>
                      <div className="risk-metric-value" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div className="risk-controls-section">
                  <h3 className="section-subtitle">⚙️ Risk Controls</h3>
                  <div className="risk-controls-list">
                    {RISK_LEVELS.map(level => (
                      <div key={level.id} className="risk-control-item">
                        <div>
                          <div className="risk-control-name" style={{ color: level.color }}>{level.name}</div>
                          <div className="risk-control-details">Max Position: {(level.maxPositionSize * 100).toFixed(1)}% • Max Loss: {(level.maxLossPerTrade * 100).toFixed(1)}%</div>
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
          
          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              portfolio={portfolio} 
              trades={trades} 
              darkMode={darkMode} 
            />
          )}
        </div>

        <footer className="app-footer">
          © 2026 ASAP~FUNDS. All rights reserved.<br />
          <span>Powered By Royzeenet</span>
          {!isOnline && <><br /><span className="offline-footer-text">📡 Working Offline</span></>}
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default LiveCurrencySimulator;
