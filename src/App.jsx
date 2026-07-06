// import React, { useState, useEffect, useMemo } from 'react';
// import './App.css';
// import { CURRENCIES } from './config/constants';
// import { TRADE_DIRECTION, TRADE_STATUS, TRADING_PAIRS, RISK_LEVELS } from './config/constants';
// import { TradingEngine } from './utils/TradingEngine';
// import { useLiveCurrencyData } from './hooks/useLiveCurrencyData';
// import { useLocalStorage } from './hooks/useLocalStorage';
// import { useOnlineStatus } from './hooks/useOnlineStatus';
// import { useAutoSave } from './hooks/useAutoSave';
// import { formatNumber } from './utils/formatters';

// // UI Components
// import { Notification, ConfirmModal, Tooltip, Loader, LoadingOverlay, OfflineBanner, TourOverlay } from './components/ui';

// // Feature Components
// import { MarketTicker } from './components/features/MarketTicker';
// import { CurrencyConverter } from './components/features/CurrencyConverter/CurrencyConverter';
// import { AdvancedTradePanel } from './components/features/Trading/AdvancedTradePanel';
// import { OrderBook } from './components/features/Trading/OrderBook';
// import { PortfolioDashboard } from './components/features/PortfolioDashboard';
// import { TradeHistory } from './components/features/TradeHistory';

// const LiveCurrencySimulator = () => {
//   // State Management
//   const liveData = useLiveCurrencyData();
//   const [currencies, setCurrencies] = useState(CURRENCIES);
//   const [portfolio, setPortfolio] = useState(() => {
//     try {
//       const saved = localStorage.getItem('forex-portfolio');
//       return saved ? JSON.parse(saved) : getDefaultPortfolio();
//     } catch (e) {
//       return getDefaultPortfolio();
//     }
//   });
  
//   const [trades, setTrades] = useLocalStorage('forex-trades', []);
//   const [isLoading, setIsLoading] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [darkMode, setDarkMode] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem('darkMode')) ?? true;
//     } catch {
//       return true;
//     }
//   });
  
//   const [activeTab, setActiveTab] = useState('converter');
//   const [selectedPair, setSelectedPair] = useState(
//     () => localStorage.getItem('selectedPair') || 'USD/EUR'
//   );
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [confirmReset, setConfirmReset] = useState(false);
//   const [showTour, setShowTour] = useState(
//     () => !localStorage.getItem('tour-completed')
//   );
  
//   const isOnline = useOnlineStatus();

//   // Auto-save functionality
//   useAutoSave(portfolio, 'forex-portfolio', 30000);
//   useAutoSave(trades, 'forex-trades', 30000);

//   // Effects
//   useEffect(() => {
//     if (liveData.currencies) {
//       setCurrencies(liveData.currencies);
//       setLastUpdate(liveData.lastUpdate);
//     }
//   }, [liveData.currencies, liveData.lastUpdate]);

//   useEffect(() => {
//     localStorage.setItem('darkMode', JSON.stringify(darkMode));
//   }, [darkMode]);

//   useEffect(() => {
//     localStorage.setItem('selectedPair', selectedPair);
//   }, [selectedPair]);

//   useEffect(() => {
//     showNotification(
//       isOnline ? 'Back online! Refreshing data...' : 'You are offline. Using cached data if available.',
//       isOnline ? 'success' : 'warning'
//     );
//     if (isOnline) liveData.refresh();
//   }, [isOnline]);

//   // Helper Functions
//   const getDefaultPortfolio = () => ({
//     balance: 10000,
//     initialBalance: 10000,
//     currencies: { USD: 10000, EUR: 0, GBP: 0, JPY: 0, NGN: 0, GHS: 0 },
//     totalValue: 10000,
//     dailyPnL: 0,
//     totalPnL: 0,
//     winRate: 0,
//     maxDrawdown: 0,
//     sharpeRatio: 0
//   });

//   const showNotification = (message, type = 'info') => {
//     const id = Date.now();
//     setNotifications(prev => [...prev, { id, message, type }]);
//     setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
//   };

//   // Trade Handlers
//   const handleExecuteTrade = (tradeData) => {
//     setIsLoading(true);
//     setTimeout(() => {
//       try {
//         const [from, to] = tradeData.pair.split('/');
//         const spread = TRADING_PAIRS.find(p => p.pair === tradeData.pair)?.spread || 0.0001;
//         const slippage = Math.random() * 0.001;
//         const executionPrice = tradeData.orderType === 'market' 
//           ? tradeData.calculations.entryPrice * (1 + (Math.random() > 0.5 ? slippage : -slippage))
//           : tradeData.limitPrice || tradeData.calculations.entryPrice;
//         const spreadCost = tradeData.amount * spread;
        
//         setPortfolio(prev => {
//           const np = { ...prev };
//           if (tradeData.direction === TRADE_DIRECTION.BUY) {
//             np.balance -= (tradeData.calculations.margin + spreadCost);
//             np.currencies[to] = (np.currencies[to] || 0) + tradeData.amount;
//           } else {
//             np.currencies[from] -= tradeData.amount;
//             np.balance += tradeData.calculations.margin - spreadCost;
//           }
//           return np;
//         });
        
//         setTrades(prev => [{
//           ...tradeData,
//           entryPrice: executionPrice,
//           spreadCost,
//           status: tradeData.orderType === 'market' ? TRADE_STATUS.FILLED : TRADE_STATUS.PENDING,
//           profit: 0,
//           margin: tradeData.calculations.margin
//         }, ...prev]);
        
//         showNotification(
//           `${tradeData.orderType === 'market' ? 'Market' : 'Limit'} ${tradeData.direction} order ${tradeData.orderType === 'market' ? 'executed' : 'placed'} for ${tradeData.pair}`,
//           'success'
//         );
//       } catch (error) {
//         showNotification('Trade execution failed', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     }, 500);
//   };

//   const handleCloseTrade = (tradeId, exitPrice) => {
//     setTrades(prev => prev.map(trade => {
//       if (trade.id !== tradeId || trade.status !== TRADE_STATUS.FILLED || trade.exitPrice) return trade;
      
//       const profit = TradingEngine.calculateProfitLoss(
//         trade.amount, 
//         trade.entryPrice, 
//         exitPrice, 
//         trade.direction
//       );
      
//       setPortfolio(prev => {
//         const np = { ...prev };
//         const [, to] = trade.pair.split('/');
//         if (trade.direction === TRADE_DIRECTION.BUY) {
//           np.currencies[to] -= trade.amount;
//           np.balance += trade.margin + profit;
//         } else {
//           np.balance += profit;
//         }
//         return np;
//       });
      
//       showNotification(
//         `Trade closed. ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)}`,
//         profit >= 0 ? 'success' : 'error'
//       );
      
//       return {
//         ...trade,
//         exitPrice,
//         profit,
//         status: TRADE_STATUS.FILLED,
//         closedAt: new Date().toISOString()
//       };
//     }));
//   };

//   const handleCancelOrder = (tradeId) => {
//     setTrades(prev => prev.map(trade => {
//       if (trade.id !== tradeId || trade.status !== TRADE_STATUS.PENDING) return trade;
      
//       setPortfolio(prev => ({
//         ...prev,
//         balance: prev.balance + trade.margin
//       }));
      
//       showNotification('Order cancelled successfully', 'info');
      
//       return {
//         ...trade,
//         status: TRADE_STATUS.CANCELLED,
//         cancelledAt: new Date().toISOString()
//       };
//     }));
//   };

//   const resetPortfolio = () => {
//     setPortfolio(getDefaultPortfolio());
//     setTrades([]);
//     setConfirmReset(false);
//     showNotification('Portfolio reset successfully', 'info');
//   };

//   const exportTrades = () => {
//     const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = `forex-trades-${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//     URL.revokeObjectURL(link.href);
//     showNotification('Trades exported successfully', 'success');
//   };

//   const currentPairRate = useMemo(() => {
//     const [base, quote] = selectedPair.split('/');
//     return TradingEngine.calculatePairRate(base, quote, currencies);
//   }, [selectedPair, currencies]);

//   const tabs = [
//     { id: 'converter', label: '💱 Converter' },
//     { id: 'trade', label: '🚀 Trade' },
//     { id: 'portfolio', label: '💼 Portfolio' },
//     { id: 'history', label: '📋 History' },
//     { id: 'orders', label: '📊 Order Book' },
//     { id: 'analytics', label: '📈 Analytics' },
//   ];

//   return (
//     <div className={`app-shell ${darkMode ? 'dark-theme' : 'light-theme'}`}>
//       <LoadingOverlay isLoading={isLoading || liveData.loading} />
//       {!isOnline && <OfflineBanner />}
      
//       {showTour && (
//         <TourOverlay
//           onComplete={() => {
//             setShowTour(false);
//             localStorage.setItem('tour-completed', 'true');
//           }}
//           onSkip={() => {
//             setShowTour(false);
//             localStorage.setItem('tour-completed', 'true');
//           }}
//         />
//       )}
      
//       <ConfirmModal
//         isOpen={confirmReset}
//         onClose={() => setConfirmReset(false)}
//         onConfirm={resetPortfolio}
//         title="Reset Portfolio"
//         message="Are you sure you want to reset your portfolio? All trades will be cleared and your balance will return to $10,000."
//         type="danger"
//         confirmText="Yes, Reset"
//         cancelText="Cancel"
//       />

//       <MarketTicker 
//         currencies={currencies} 
//         onSelectPair={setSelectedPair} 
//       />

//       <header className="app-header glass">
//         <div className="header-content">
//           <div className="brand">
//             <h1 className="app-title">🚀 ASAP~FUNDS</h1>
//             <p className="app-subtitle">
//               Professional trading platform
//               {liveData.apiSource && (
//                 <span className="live-badge">🔴 Live: {liveData.apiSource}</span>
//               )}
//               {!isOnline && <span className="offline-badge">🔴 Offline</span>}
//             </p>
//           </div>
//           <div className="header-actions">
//             <Tooltip text={darkMode ? 'Light mode' : 'Dark mode'}>
//               <button 
//                 onClick={() => setDarkMode(!darkMode)} 
//                 className="icon-btn" 
//                 aria-label="Toggle theme"
//               >
//                 {darkMode ? '☀️' : '🌙'}
//               </button>
//             </Tooltip>
//             <Tooltip text="Reset Portfolio">
//               <button onClick={() => setConfirmReset(true)} className="icon-btn">
//                 🔄 Reset
//               </button>
//             </Tooltip>
//             <Tooltip text="Export Trades">
//               <button onClick={exportTrades} className="icon-btn">
//                 📥 Export
//               </button>
//             </Tooltip>
//           </div>
//         </div>
//       </header>

//       <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
//         <div className="sidebar-header">
//           <h2 className="sidebar-title">ASAP~FUNDS</h2>
//           <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}>
//             ✕
//           </button>
//         </div>
//         {tabs.map(({ id, label }) => (
//           <button
//             key={id}
//             onClick={() => {
//               setActiveTab(id);
//               setIsMobileMenuOpen(false);
//             }}
//             className={`sidebar-link ${activeTab === id ? 'active' : ''}`}
//           >
//             <span className="tab-icon">{label.split(' ')[0]}</span>
//             <span>{label.split(' ').slice(1).join(' ')}</span>
//           </button>
//         ))}
//         <div className="sidebar-footer">
//           <span>© 2026 Royzeenet</span>
//         </div>
//       </nav>

//       <main className="main-area">
//         <Notification
//           notifications={notifications}
//           removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
//         />

//         {activeTab === 'converter' && (
//           <CurrencyConverter
//             currencies={currencies}
//             darkMode={darkMode}
//             liveData={liveData}
//             onRefresh={liveData.refresh}
//           />
//         )}

//         {activeTab === 'trade' && (
//           <div className="trade-layout">
//             <AdvancedTradePanel
//               portfolio={portfolio}
//               currencies={currencies}
//               onExecuteTrade={handleExecuteTrade}
//               darkMode={darkMode}
//               pair={selectedPair}
//               onPairChange={setSelectedPair}
//             />
//             <div className="chart-and-orderbook">
//               <Card darkMode={darkMode} className="chart-card" glass={false}>
//                 <h2 className="section-title">📈 {selectedPair} Live Chart</h2>
//                 <div className="chart-placeholder">
//                   <svg viewBox="0 0 300 100" className="mini-chart">
//                     <path
//                       d="M0,50 L50,20 L100,80 L150,30 L200,70 L250,10 L300,50"
//                       fill="none"
//                       stroke={darkMode ? '#667eea' : '#4a5568'}
//                       strokeWidth="2"
//                     />
//                   </svg>
//                   <div className="chart-price">
//                     Current: {currentPairRate.toFixed(5)}
//                   </div>
//                 </div>
//               </Card>
//               <OrderBook
//                 pair={selectedPair}
//                 currencies={currencies}
//                 darkMode={darkMode}
//               />
//             </div>
//           </div>
//         )}

//         {activeTab === 'portfolio' && (
//           <div className="dashboard-grid">
//             <PortfolioDashboard
//               portfolio={portfolio}
//               trades={trades}
//               darkMode={darkMode}
//             />
//             <Card darkMode={darkMode} className="risk-card" glass={false}>
//               <h2 className="section-title">🛡️ Risk Management</h2>
//               <div className="risk-metrics-grid">
//                 {[
//                   { label: 'Max Drawdown', value: '2.5%', color: '#10b981' },
//                   { label: 'Sharpe Ratio', value: '1.8', color: '#f59e0b' },
//                   { label: 'Volatility', value: '15%', color: '#3b82f6' },
//                   { label: 'Value at Risk', value: '$250', color: '#8b5cf6' }
//                 ].map((m, i) => (
//                   <div
//                     key={i}
//                     className="risk-metric-card"
//                     style={{ borderColor: m.color }}
//                   >
//                     <div className="risk-metric-label">{m.label}</div>
//                     <div className="risk-metric-value" style={{ color: m.color }}>
//                       {m.value}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
//         )}

//         {activeTab === 'history' && (
//           <TradeHistory
//             trades={trades}
//             onCloseTrade={handleCloseTrade}
//             onCancelOrder={handleCancelOrder}
//             darkMode={darkMode}
//           />
//         )}

//         {activeTab === 'orders' && (
//           <OrderBook
//             pair={selectedPair}
//             currencies={currencies}
//             darkMode={darkMode}
//           />
//         )}
//       </main>

//       <footer className="app-footer">
//         © 2026 ASAP~FUNDS | Powered by Royzeenet
//         {!isOnline && <span className="offline-dot">🔴 Offline</span>}
//       </footer>

//       <button
//         className="mobile-menu-btn"
//         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//       >
//         {isMobileMenuOpen ? '✕' : '☰'}
//       </button>
//     </div>
//   );
// };

// export default LiveCurrencySimulator;