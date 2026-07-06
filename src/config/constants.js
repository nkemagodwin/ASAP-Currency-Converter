export const CURRENCIES = [
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

export const API_CONFIG = {
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

export const ORDER_TYPES = [
  { id: 'market', name: 'Market Order', description: 'Execute immediately at current price', icon: '⚡', fee: 0.001 },
  { id: 'limit', name: 'Limit Order', description: 'Execute at specified price or better', icon: '🎯', fee: 0.0005 },
  { id: 'stop', name: 'Stop Order', description: 'Execute when price reaches trigger', icon: '🛑', fee: 0.001 },
  { id: 'stop_limit', name: 'Stop Limit', description: 'Stop order with price limit', icon: '📊', fee: 0.0005 },
  { id: 'trailing_stop', name: 'Trailing Stop', description: 'Stop that follows price', icon: '📈', fee: 0.001 }
];

export const TRADE_DIRECTION = { BUY: 'buy', SELL: 'sell' };

export const TRADE_STATUS = {
  PENDING: 'pending',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const RISK_LEVELS = [
  { id: 'low', name: 'Low Risk', maxPositionSize: 0.02, maxLossPerTrade: 0.01, color: '#10b981' },
  { id: 'medium', name: 'Medium Risk', maxPositionSize: 0.05, maxLossPerTrade: 0.02, color: '#f59e0b' },
  { id: 'high', name: 'High Risk', maxPositionSize: 0.10, maxLossPerTrade: 0.05, color: '#ef4444' }
];

export const TIME_FRAMES = [
  { label: '1m', value: 1, interval: 2000 },
  { label: '5m', value: 5, interval: 10000 },
  { label: '15m', value: 15, interval: 30000 },
  { label: '1h', value: 60, interval: 120000 },
  { label: '4h', value: 240, interval: 480000 }
];

export const TRADING_PAIRS = [
  { pair: 'USD/EUR', base: 'USD', quote: 'EUR', spread: 0.0001, minTrade: 100 },
  { pair: 'USD/GBP', base: 'USD', quote: 'GBP', spread: 0.0002, minTrade: 100 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', spread: 0.00015, minTrade: 100 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', spread: 0.01, minTrade: 100 },
  { pair: 'NGN/USD', base: 'NGN', quote: 'USD', spread: 0.5, minTrade: 1000 },
  { pair: 'GHS/USD', base: 'GHS', quote: 'USD', spread: 0.02, minTrade: 100 },
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', spread: 0.02, minTrade: 100 },
  { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', spread: 0.025, minTrade: 100 }
];