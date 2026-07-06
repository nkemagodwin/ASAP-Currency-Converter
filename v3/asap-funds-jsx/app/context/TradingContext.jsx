'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

const initialState = {
  portfolio: {
    balance: 10000,
    initialBalance: 10000,
    currencies: {
      USD: 10000,
      EUR: 0,
      GBP: 0,
      JPY: 0,
      NGN: 0,
      GHS: 0,
    },
    totalValue: 10000,
    dailyPnL: 0,
    totalPnL: 0,
    winRate: 0,
  },
  trades: [],
  isLoading: false,
  selectedPair: 'USD/EUR',
  darkMode: true,
}

function tradingReducer(state, action) {
  switch (action.type) {
    case 'ADD_TRADE':
      return { ...state, trades: [action.payload, ...state.trades] }
    case 'UPDATE_TRADE':
      return {
        ...state,
        trades: state.trades.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      }
    case 'UPDATE_BALANCE':
      return {
        ...state,
        portfolio: { ...state.portfolio, balance: action.payload },
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SELECTED_PAIR':
      return { ...state, selectedPair: action.payload }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'RESET_PORTFOLIO':
      return { ...initialState, darkMode: state.darkMode }
    default:
      return state
  }
}

const TradingContext = createContext(null)

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState, (init) => {
    if (typeof window === 'undefined') return init
    try {
      const saved = localStorage.getItem('trading-state')
      return saved ? { ...init, ...JSON.parse(saved) } : init
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem('trading-state', JSON.stringify(state))
  }, [state])

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) throw new Error('useTrading must be used within TradingProvider')
  return context
}