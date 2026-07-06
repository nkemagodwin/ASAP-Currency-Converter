'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { TradingEngine } from '../../lib/trading/engine'

export function OrderBook({ pair, currencies }) {
  const [orders, setOrders] = useState({ bids: [], asks: [] })

  useEffect(() => {
    if (!pair) return
    const generate = () => {
      const [base, quote] = pair.split('/')
      const price = TradingEngine.calculatePairRate(base, quote, currencies)

      const bids = Array.from({ length: 8 }, (_, i) => ({
        price: price * (1 - (i + 1) * 0.0005),
        volume: +(Math.random() * 1000).toFixed(2),
      })).sort((a, b) => b.price - a.price)

      const asks = Array.from({ length: 8 }, (_, i) => ({
        price: price * (1 + (i + 1) * 0.0005),
        volume: +(Math.random() * 1000).toFixed(2),
      })).sort((a, b) => a.price - b.price)

      setOrders({ bids, asks })
    }
    generate()
    const interval = setInterval(generate, 3000)
    return () => clearInterval(interval)
  }, [pair, currencies])

  return (
    <Card>
      <h3 className="text-lg font-bold mb-4">📊 Order Book - {pair}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Bid (Buy)</span>
            <span>Volume</span>
          </div>
          {orders.bids.map((b, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-success/10">
              <span className="text-success font-medium">{b.price.toFixed(5)}</span>
              <span>{b.volume}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Ask (Sell)</span>
            <span>Volume</span>
          </div>
          {orders.asks.map((a, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-destructive/10">
              <span className="text-destructive font-medium">{a.price.toFixed(5)}</span>
              <span>{a.volume}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}