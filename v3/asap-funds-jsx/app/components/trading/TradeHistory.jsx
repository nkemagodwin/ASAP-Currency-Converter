'use client'

import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { formatNumber } from '../../lib/utils/formatters'

export function TradeHistory({ trades, onCloseTrade, onCancelOrder }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    let f = [...trades]
    switch (filter) {
      case 'open': f = f.filter((t) => t.status === 'filled' && !t.exitPrice); break
      case 'pending': f = f.filter((t) => t.status === 'pending'); break
      case 'closed': f = f.filter((t) => t.status === 'filled' && t.exitPrice); break
      default: break
    }
    return f.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [trades, filter])

  const totalPnL = trades.reduce((s, t) => s + (t.profit || 0), 0)

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">📋 Trade History</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Trades</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p>No trades found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Time</th>
                <th className="text-left py-3">Pair</th>
                <th className="text-left py-3">Direction</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">P&L</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isOpen = t.status === 'filled' && !t.exitPrice
                const isPending = t.status === 'pending'
                return (
                  <tr key={t.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">{new Date(t.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-medium">{t.pair}</td>
                    <td className="py-3">
                      <span className={`badge ${t.direction === 'buy' ? 'badge-success' : 'badge-danger'}`}>
                        {t.direction?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">{formatNumber(t.amount)}</td>
                    <td className="py-3">
                      <span className={`badge ${isOpen ? 'badge-warning' : isPending ? 'badge-warning' : (t.profit || 0) >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {isOpen ? 'OPEN' : isPending ? 'PENDING' : 'CLOSED'}
                      </span>
                    </td>
                    <td className={`py-3 font-medium ${(t.profit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {t.profit ? `$${formatNumber(t.profit)}` : '-'}
                    </td>
                    <td className="py-3">
                      {isOpen && <Button variant="outline" onClick={() => onCloseTrade(t.id, t.entryPrice * 1.01)}>Close</Button>}
                      {isPending && <Button variant="outline" onClick={() => onCancelOrder(t.id)}>Cancel</Button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between mt-4 pt-4 border-t text-sm">
        <span>{filtered.length} trades</span>
        <span>Total P&L: <span className={`font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>${formatNumber(totalPnL)}</span></span>
      </div>
    </Card>
  )
}