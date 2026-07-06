import React from 'react';
import { Tooltip, Loader } from '../../ui';
import { formatNumber } from '../../../utils/formatters';

export const ConverterForm = ({
  fromCurrency,
  toCurrency,
  amount,
  convertedAmount,
  exchangeRate,
  inverseRate,
  isConverting,
  isSwapping,
  liveConversion,
  currencies,
  favorites,
  fromSearch,
  toSearch,
  copied,
  showRateChart,
  setFromCurrency,
  setToCurrency,
  setAmount,
  setFromSearch,
  setToSearch,
  onSwap,
  onCopyResult,
  onToggleChart,
  onToggleFavorite,
  onRefresh
}) => {
  const filteredFromCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(fromSearch.toLowerCase()) || 
    c.name.toLowerCase().includes(fromSearch.toLowerCase())
  );
  
  const filteredToCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(toSearch.toLowerCase()) || 
    c.name.toLowerCase().includes(toSearch.toLowerCase())
  );

  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000, 10000];

  return (
    <div className="converter-main">
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
          <Tooltip text="Refresh rates (R)">
            <button 
              onClick={onRefresh} 
              className="header-button refresh-button" 
              aria-label="Refresh rates" 
              disabled={isConverting}
            >
              {isConverting ? <Loader size={16} /> : '🔄'}
            </button>
          </Tooltip>
          <Tooltip text="Save conversion (S)">
            <button className="header-button save-conversion-button" aria-label="Save conversion">
              💾
            </button>
          </Tooltip>
          <Tooltip text={copied ? "Copied!" : "Copy result"}>
            <button 
              onClick={onCopyResult} 
              className={`header-button copy-button ${copied ? 'copied' : ''}`} 
              aria-label="Copy result"
            >
              {copied ? '✅' : '📋'}
            </button>
          </Tooltip>
          <Tooltip text="Toggle rate chart">
            <button 
              onClick={onToggleChart} 
              className={`header-button chart-button ${showRateChart ? 'active' : ''}`} 
              aria-label="Toggle rate chart"
            >
              📊
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="converter-input-section">
        <div className="converter-from">
          <label htmlFor="from-currency" className="input-label">
            From <Tooltip text="Source currency">ⓘ</Tooltip>
          </label>
          <div className="currency-select-row">
            <div className="select-wrapper">
              <input 
                type="text" 
                placeholder="Search currency..." 
                value={fromSearch} 
                onChange={e => setFromSearch(e.target.value)} 
                className="currency-search-input" 
                aria-label="Search source currency" 
              />
              <select 
                id="from-currency" 
                value={fromCurrency} 
                onChange={e => { setFromCurrency(e.target.value); setFromSearch(''); }} 
                className="currency-select" 
                aria-label="Select source currency"
              >
                {filteredFromCurrencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                    {c.change ? ` (${c.change > 0 ? '+' : ''}${c.change}%)` : ''}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            <Tooltip text={favorites.includes(fromCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
              <button 
                onClick={() => onToggleFavorite(fromCurrency)} 
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
              onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))} 
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
              onClick={onSwap} 
              disabled={isSwapping} 
              className={`swap-button ${isSwapping ? 'swapping' : ''}`} 
              aria-label="Swap currencies"
            >
              {isSwapping ? <Loader size={16} /> : '🔄'}
            </button>
          </Tooltip>
          <div className="rate-display">
            1 {fromCurrency} = <span className="rate-value-highlight">{exchangeRate.toFixed(6)}</span> {toCurrency}
            {liveConversion?.rate && (
              <Tooltip text="Live rate">
                <span className="live-indicator">🔴</span>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="converter-to">
          <label htmlFor="to-currency" className="input-label">To</label>
          <div className="currency-select-row">
            <div className="select-wrapper">
              <input 
                type="text" 
                placeholder="Search currency..." 
                value={toSearch} 
                onChange={e => setToSearch(e.target.value)} 
                className="currency-search-input" 
                aria-label="Search target currency" 
              />
              <select 
                id="to-currency" 
                value={toCurrency} 
                onChange={e => { setToCurrency(e.target.value); setToSearch(''); }} 
                className="currency-select" 
                aria-label="Select target currency"
              >
                {filteredToCurrencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                    {c.change ? ` (${c.change > 0 ? '+' : ''}${c.change}%)` : ''}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            <Tooltip text={favorites.includes(toCurrency) ? 'Remove from favorites' : 'Add to favorites'}>
              <button 
                onClick={() => onToggleFavorite(toCurrency)} 
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
          {quickAmounts.map(qa => (
            <button 
              key={qa} 
              onClick={() => setAmount(qa)} 
              className={`quick-amount-button ${amount === qa ? 'active' : ''}`}
            >
              {formatNumber(qa)}
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
              {liveConversion?.rate && <span className="rate-source">({liveConversion.source})</span>}
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
      <div className="converter-shortcuts">
        <small>💡 Shortcuts: Press S to save • Press R to refresh</small>
      </div>
    </div>
  );
};