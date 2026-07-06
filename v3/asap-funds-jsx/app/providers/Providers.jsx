'use client'

import { TradingProvider } from '../context/TradingContext'

export function Providers({ children }) {
  return <TradingProvider>{children}</TradingProvider>
}