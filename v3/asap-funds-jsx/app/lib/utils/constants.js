export const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.006, flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', favorite: true, color: '#ff7e5f', trend: 'up', volatility: 0.0045, flag: '🇬🇭' },
  { code: 'USD', name: 'US Dollar', favorite: true, color: '#667eea', trend: 'neutral', volatility: 0.001, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', favorite: true, color: '#764ba2', trend: 'down', volatility: 0.0025, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', favorite: true, color: '#f093fb', trend: 'up', volatility: 0.003, flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', favorite: false, color: '#f5576c', trend: 'down', volatility: 0.0035, flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', favorite: false, color: '#4facfe', trend: 'up', volatility: 0.0028, flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', favorite: false, color: '#00f2fe', trend: 'down', volatility: 0.0032, flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', favorite: false, color: '#43e97b', trend: 'neutral', volatility: 0.002, flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', favorite: false, color: '#fa709a', trend: 'up', volatility: 0.0015, flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', favorite: false, color: '#ffee00', trend: 'down', volatility: 0.0018, flag: '🇮🇳' },
  { code: 'ZAR', name: 'South African Rand', favorite: false, color: '#F97316', trend: 'down', volatility: 0.0045, flag: '🇿🇦' },
]

export const ORDER_TYPES = [
  { id: 'market', name: 'Market Order', description: 'Execute immediately at current price', icon: '⚡', fee: 0.001 },
  { id: 'limit', name: 'Limit Order', description: 'Execute at specified price or better', icon: '🎯', fee: 0.0005 },
  { id: 'stop', name: 'Stop Order', description: 'Execute when price reaches trigger', icon: '🛑', fee: 0.001 },
]

export const RISK_LEVELS = [
  { id: 'low', name: 'Low Risk', maxPositionSize: 0.02, maxLossPerTrade: 0.01, color: '#10b981' },
  { id: 'medium', name: 'Medium Risk', maxPositionSize: 0.05, maxLossPerTrade: 0.02, color: '#f59e0b' },
  { id: 'high', name: 'High Risk', maxPositionSize: 0.1, maxLossPerTrade: 0.05, color: '#ef4444' },
]

export const TRADING_PAIRS = [
  { pair: 'USD/EUR', base: 'USD', quote: 'EUR', spread: 0.0001, minTrade: 100 },
  { pair: 'USD/GBP', base: 'USD', quote: 'GBP', spread: 0.0002, minTrade: 100 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', spread: 0.00015, minTrade: 100 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', spread: 0.01, minTrade: 100 },
  { pair: 'NGN/USD', base: 'NGN', quote: 'USD', spread: 0.5, minTrade: 1000 },
  { pair: 'GHS/USD', base: 'GHS', quote: 'USD', spread: 0.02, minTrade: 100 },
]