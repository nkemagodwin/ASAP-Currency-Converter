'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { TradingEngine } from '@/lib/trading/engine'
import { formatNumber } from '@/lib/utils/formatters'
import { CURRENCIES, TRADING_PAIRS } from '@/lib/utils/constants'

export function CurrencyConverter({ currencies, onRefresh }) {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [amount, setAmount] = useState(100)
  const [history, setHistory] = useState([])

  const rate = useMemo(() => TradingEngine.calculatePairRate(from, to, currencies), [from, to, currencies])
  const converted = useMemo(() => TradingEngine.convertCurrency(amount, from, to, currencies), [amount, from, to, currencies])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const saveConversion = () => {
    setHistory((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), from, to, amount, result: converted, rate },
      ...prev.slice(0, 9),
    ])
  }

  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000, 10000]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">💱 Currency Converter</h2>
          <Tooltip content="Refresh rates">
            <Button variant="outline" onClick={onRefresh}>🔄</Button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="input-field">
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
              className="input-field mt-2"
              placeholder="Amount"
            />
          </div>

          <Button variant="outline" onClick={swap} className="mb-1">🔄</Button>

          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="input-field">
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <div className="input-field mt-2 bg-muted font-bold text-lg">
              {formatNumber(converted, 6)} {to}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          1 {from} = <span className="font-bold text-foreground">{rate.toFixed(6)}</span> {to}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quick Amounts</label>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`px-3 py-1 rounded text-sm ${amount === a ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                {a >= 1000 ? `${(a / 1000).toFixed(0)}K` : a}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={saveConversion} className="w-full">💾 Save Conversion</Button>
      </Card>

      <Card>
        <h3 className="font-bold mb-4">⭐ Popular Pairs</h3>
        <div className="space-y-2">
          {TRADING_PAIRS.slice(0, 6).map((p) => {
            const pairRate = TradingEngine.calculatePairRate(p.base, p.quote, currencies)
            return (
              <button
                key={p.pair}
                onClick={() => { setFrom(p.base); setTo(p.quote); setAmount(100) }}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="font-medium">{p.pair}</div>
                <div className="text-sm text-muted-foreground">{pairRate.toFixed(4)}</div>
              </button>
            )
          })}
        </div>
      </Card>

      {history.length > 0 && (
        <Card className="lg:col-span-3">
          <h3 className="font-bold mb-4">📋 Recent Conversions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">From</th>
                  <th className="text-left py-2">To</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Result</th>
                  <th className="text-left py-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b">
                    <td className="py-2">{h.time}</td>
                    <td className="py-2">{h.from}</td>
                    <td className="py-2">{h.to}</td>
                    <td className="py-2">{formatNumber(h.amount)}</td>
                    <td className="py-2">{formatNumber(h.result, 4)}</td>
                    <td className="py-2">{h.rate.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}