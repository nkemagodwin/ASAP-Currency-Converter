'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, BarChart3, Bell, ChevronDown, CreditCard, FileText, LayoutDashboard, Moon, Plus, RefreshCw, Settings, Sparkles, Sun, Wallet, X } from 'lucide-react'
import { useTrading } from './context/TradingContext'
import { useCurrencyData } from './hooks/useCurrencyData'
import { CurrencyConverter } from './components/trading/CurrencyConverter'
import { AdvancedTradePanel } from './components/trading/AdvancedTradePanel'
import { PortfolioDashboard } from './components/trading/PortfolioDashboard'
import { TradeHistory } from './components/trading/TradeHistory'
import { OrderBook } from './components/trading/OrderBook'
import { Button } from './components/ui/Button'
import { TradingEngine } from './lib/trading/engine'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'converter', label: 'Convert', icon: RefreshCw },
  { id: 'trade', label: 'Trade', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'history', label: 'Activity', icon: FileText },
]

export default function Home() {
  const { state, dispatch } = useTrading()
  const { currencies, loading, refresh, error } = useCurrencyData()
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleExecuteTrade = useCallback(async (tradeData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tradeData) })
      if (!res.ok) throw new Error('Trade failed')
      const { trade } = await res.json()
      dispatch({ type: 'ADD_TRADE', payload: trade })
      if (trade.direction === 'buy') dispatch({ type: 'UPDATE_BALANCE', payload: state.portfolio.balance - trade.margin })
    } catch (err) { console.error(err) } finally { dispatch({ type: 'SET_LOADING', payload: false }) }
  }, [dispatch, state.portfolio.balance])

  const handleCloseTrade = useCallback((tradeId, exitPrice) => {
    const trade = state.trades.find((t) => t.id === tradeId)
    if (!trade) return
    const profit = TradingEngine.calculateProfitLoss(trade.amount, trade.entryPrice, exitPrice, trade.direction)
    dispatch({ type: 'UPDATE_TRADE', payload: { id: tradeId, updates: { status: 'filled', exitPrice, profit } } })
    dispatch({ type: 'UPDATE_BALANCE', payload: state.portfolio.balance + profit })
  }, [dispatch, state.trades, state.portfolio.balance])

  const totalPnL = state.trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
  const completedTrades = state.trades.filter((trade) => trade.status === 'filled').length

  return (
    <div className={`min-h-screen ${state.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-background text-foreground">
        {loading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}
        {error && <div className="border-b border-destructive/20 bg-destructive/10 px-6 py-3 text-center text-sm text-destructive">{error}<button onClick={refresh} className="ml-3 underline">Retry</button></div>}
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-card/40 px-4 py-6 lg:flex lg:flex-col">
            <div className="mb-10 flex items-center gap-3 px-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground">A</div><div><div className="font-semibold tracking-tight">ASAP Funds</div><div className="text-xs text-muted-foreground">Workspace</div></div></div>
            <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</div>
            <nav className="space-y-1">{NAV.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${activeTab === id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={17} />{label}</button>)}</nav>
            <div className="mt-auto rounded-2xl border border-primary/20 bg-primary/10 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} className="text-primary" /> Pro plan</div><p className="mb-3 text-xs leading-5 text-muted-foreground">Unlock unlimited conversions and advanced analytics.</p><button onClick={() => setShowUpgrade(true)} className="flex items-center gap-1 text-xs font-semibold text-primary">Upgrade <ArrowRight size={13} /></button></div>
            <button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Settings size={17} /> Settings</button>
          </aside>
          <main className="min-w-0 flex-1">
            <header className="flex h-20 items-center justify-between border-b border-border/70 px-5 md:px-8"><div className="lg:hidden flex items-center gap-2 font-semibold"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">A</div>ASAP Funds</div><div className="hidden text-sm text-muted-foreground lg:block">{activeTab === 'overview' ? 'Tuesday, October 3, 2026' : NAV.find((item) => item.id === activeTab)?.label}</div><div className="flex items-center gap-2"><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Bell size={18} /></button><button onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Toggle theme">{state.darkMode ? <Sun size={18} /> : <Moon size={18} />}</button><div className="ml-2 flex items-center gap-2 border-l border-border pl-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-xs font-bold text-orange-800">JD</div><div className="hidden text-left md:block"><div className="text-sm font-medium">Jordan Davis</div><div className="text-xs text-muted-foreground">Free plan</div></div><ChevronDown size={15} className="text-muted-foreground" /></div></div></header>
            <div className="mx-auto max-w-7xl px-5 py-7 md:px-8">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-sm font-medium text-primary">Good morning, Jordan</p><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your money, in motion.</h1><p className="mt-2 text-muted-foreground">Track rates, convert currencies, and make every move count.</p></div><Button onClick={() => setActiveTab('converter')}><Plus size={16} /> New conversion</Button></div>
              {activeTab === 'overview' && <><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total balance', value: `$${state.portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: '+2.4%', icon: Wallet }, { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : '-'}$${Math.abs(totalPnL).toLocaleString()}`, change: '+8.1%', icon: BarChart3 }, { label: 'Conversions', value: state.trades.length + 24, change: '+12 this month', icon: RefreshCw }, { label: 'Plan usage', value: `${Math.min(100, state.trades.length + 12)}%`, change: '12 of 100 actions', icon: Sparkles }].map(({ label, value, change, icon: Icon }) => <div key={label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon size={18} className="text-primary" /></div><div className="text-2xl font-bold tracking-tight">{value}</div><div className="mt-2 text-xs font-medium text-success">{change}</div></div>)}</div><div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Balance overview</h2><p className="text-sm text-muted-foreground">Portfolio value over the last 30 days</p></div><button className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">30 days <ChevronDown size={13} className="ml-1 inline" /></button></div><div className="flex h-48 items-end gap-2 border-b border-border/70 px-2">{[32, 45, 38, 55, 48, 67, 58, 74, 65, 81, 76, 92, 86, 100].map((height, index) => <div key={index} className={`flex-1 rounded-t-md ${index === 13 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${height}%` }} />)}</div><div className="mt-4 flex justify-between text-xs text-muted-foreground"><span>Sep 04</span><span>Sep 18</span><span>Oct 03</span></div></div><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Live rates</h2><p className="text-sm text-muted-foreground">Updated just now</p></div><button onClick={refresh} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><RefreshCw size={16} /></button></div><div className="space-y-1">{currencies.slice(0, 5).map((currency, index) => <div key={currency.code} className="flex items-center justify-between rounded-xl p-3 hover:bg-muted"><div className="flex items-center gap-3"><span className="text-lg">{currency.flag}</span><div><div className="text-sm font-semibold">USD / {currency.code}</div><div className="text-xs text-muted-foreground">{currency.name}</div></div></div><div className="text-right"><div className="text-sm font-semibold">{Number(currency.rate || 1).toFixed(4)}</div><div className="text-xs text-success">+{(index + 1) * 0.12}%</div></div></div>)}</div></div></div><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Recent activity</h2><p className="text-sm text-muted-foreground">Your latest trades and conversions</p></div><button onClick={() => setActiveTab('history')} className="text-sm font-medium text-primary">View all <ArrowRight size={14} className="ml-1 inline" /></button></div>{state.trades.length === 0 ? <div className="rounded-xl bg-muted/50 py-10 text-center text-sm text-muted-foreground">No activity yet. Create your first conversion to get started.</div> : <TradeHistory trades={state.trades.slice(0, 4)} onCloseTrade={handleCloseTrade} onCancelOrder={(id) => dispatch({ type: 'UPDATE_TRADE', payload: { id, updates: { status: 'cancelled' } } })} />}</div></>}
              {activeTab === 'converter' && <CurrencyConverter currencies={currencies} onRefresh={refresh} />}
              {activeTab === 'trade' && <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><AdvancedTradePanel currencies={currencies} portfolio={state.portfolio} selectedPair={state.selectedPair} onPairChange={(pair) => dispatch({ type: 'SET_SELECTED_PAIR', payload: pair })} onExecuteTrade={handleExecuteTrade} /><OrderBook pair={state.selectedPair} currencies={currencies} /></div>}
              {activeTab === 'portfolio' && <PortfolioDashboard portfolio={state.portfolio} trades={state.trades} />}
              {activeTab === 'history' && <TradeHistory trades={state.trades} onCloseTrade={handleCloseTrade} onCancelOrder={(id) => dispatch({ type: 'UPDATE_TRADE', payload: { id, updates: { status: 'cancelled' } } })} />}
            </div>
          </main>
        </div>
        {showUpgrade && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowUpgrade(false)}><div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard /></div><button onClick={() => setShowUpgrade(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X size={18} /></button></div><h2 className="text-2xl font-bold">Move faster with Pro</h2><p className="mt-2 text-muted-foreground">Unlimited conversions, advanced analytics, and priority rates for your workflow.</p><div className="my-6 rounded-2xl bg-muted p-4"><div className="flex items-end justify-between"><span className="font-semibold">Pro plan</span><span className="text-2xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/month</span></span></div><ul className="mt-4 space-y-2 text-sm text-muted-foreground"><li>✓ Unlimited currency conversions</li><li>✓ Exportable reports and history</li><li>✓ Advanced portfolio insights</li></ul></div><Button className="w-full" onClick={() => setShowUpgrade(false)}>Continue to checkout <ArrowRight size={16} /></Button></div></div>}
      </div>
    </div>
  )
}
