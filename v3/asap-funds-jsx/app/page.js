'use client'

import { useState, useCallback } from 'react'
import { useTrading } from './context/TradingContext'
import { useCurrencyData } from './hooks/useCurrencyData'
import { CurrencyConverter } from './components/trading/CurrencyConverter'
import { AdvancedTradePanel } from './components/trading/AdvancedTradePanel'
import { PortfolioDashboard } from './components/trading/PortfolioDashboard'
import { TradeHistory } from './components/trading/TradeHistory'
import { OrderBook } from './components/trading/OrderBook'
import { Button } from './components/ui/Button'
import { Tooltip } from './components/ui/Tooltip'
import { TradingEngine } from './lib/trading/engine'

const TABS = [
  { id: 'converter', label: '💱 Converter' },
  { id: 'trade', label: '🚀 Trade' },
  { id: 'portfolio', label: '💼 Portfolio' },
  { id: 'history', label: '📋 History' },
  { id: 'orders', label: '📊 Orders' },
]

export default function Home() {
  const { state, dispatch } = useTrading()
  const { currencies, loading, refresh, error } = useCurrencyData()
  const [activeTab, setActiveTab] = useState('converter')
  const [confirmReset, setConfirmReset] = useState(false)

  const handleExecuteTrade = useCallback(
    async (tradeData) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tradeData),
        })
        if (!res.ok) throw new Error('Trade failed')
        const { trade } = await res.json()
        dispatch({ type: 'ADD_TRADE', payload: trade })
        if (trade.direction === 'buy') {
          dispatch({ type: 'UPDATE_BALANCE', payload: state.portfolio.balance - trade.margin })
        }
      } catch (err) {
        console.error(err)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [dispatch, state.portfolio.balance]
  )

  const handleCloseTrade = useCallback(
    async (tradeId, exitPrice) => {
      const trade = state.trades.find((t) => t.id === tradeId)
      if (!trade) return
      const profit = TradingEngine.calculateProfitLoss(trade.amount, trade.entryPrice, exitPrice, trade.direction)
      dispatch({ type: 'UPDATE_TRADE', payload: { id: tradeId, updates: { status: 'filled', exitPrice, profit } } })
      dispatch({ type: 'UPDATE_BALANCE', payload: state.portfolio.balance + profit })
    },
    [dispatch, state.trades, state.portfolio.balance]
  )

  const handleCancelOrder = useCallback(
    (tradeId) => {
      dispatch({ type: 'UPDATE_TRADE', payload: { id: tradeId, updates: { status: 'cancelled' } } })
    },
    [dispatch]
  )

  const exportTrades = () => {
    const blob = new Blob([JSON.stringify(state.trades, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`min-h-screen ${state.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-background text-foreground">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 text-center">
            {error}
            <button onClick={refresh} className="ml-4 underline">Retry</button>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">🚀 ASAP~FUNDS</h1>
              <p className="text-muted-foreground">Professional Trading Platform</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Tooltip content={state.darkMode ? 'Light mode' : 'Dark mode'}>
                <Button variant="outline" onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}>
                  {state.darkMode ? '☀️' : '🌙'}
                </Button>
              </Tooltip>
              <Button variant="outline" onClick={() => setConfirmReset(true)}>🔄 Reset</Button>
              <Button variant="outline" onClick={exportTrades}>📥 Export</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="animate-fade-in">
            {activeTab === 'converter' && <CurrencyConverter currencies={currencies} onRefresh={refresh} />}
            {activeTab === 'trade' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvancedTradePanel
                  currencies={currencies}
                  portfolio={state.portfolio}
                  selectedPair={state.selectedPair}
                  onPairChange={(p) => dispatch({ type: 'SET_SELECTED_PAIR', payload: p })}
                  onExecuteTrade={handleExecuteTrade}
                />
                <OrderBook pair={state.selectedPair} currencies={currencies} />
              </div>
            )}
            {activeTab === 'portfolio' && <PortfolioDashboard portfolio={state.portfolio} trades={state.trades} />}
            {activeTab === 'history' && (
              <TradeHistory trades={state.trades} onCloseTrade={handleCloseTrade} onCancelOrder={handleCancelOrder} />
            )}
            {activeTab === 'orders' && <OrderBook pair={state.selectedPair} currencies={currencies} />}
          </div>

          {/* Footer */}
          <footer className="mt-12 py-6 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ASAP~FUNDS. Powered By Royzeenet
          </footer>
        </div>

        {/* Reset Modal */}
        {confirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmReset(false)}>
            <div className="card max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold mb-2">Reset Portfolio?</h3>
                <p className="text-muted-foreground mb-6">This will clear all trades and reset your balance.</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="buy"
                    onClick={() => {
                      dispatch({ type: 'RESET_PORTFOLIO' })
                      setConfirmReset(false)
                    }}
                  >
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}