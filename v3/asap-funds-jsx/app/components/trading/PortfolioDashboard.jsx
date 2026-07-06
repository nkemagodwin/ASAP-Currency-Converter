'use client'

import { useMemo } from 'react'
import { Card } from '../ui/Card'
import { formatNumber } from '../../lib/utils/formatters'
import { CURRENCIES, RISK_LEVELS } from '../../lib/utils/constants'

export function PortfolioDashboard({ portfolio, trades }) {
  const metrics = useMemo(() => {
    const filled = trades.filter((t) => t.status === 'filled' && t.exitPrice)
    const wins = filled.filter((t) => t.profit > 0)
    const winRate = filled.length ? (wins.length / filled.length) * 100 : 0
    const totalPnL = trades.reduce((s, t) => s + (t.profit || 0), 0)
    return { ...portfolio, winRate, totalPnL }
  }, [portfolio, trades])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-2xl font-bold mb-6">💼 Portfolio Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Value', value: `$${formatNumber(metrics.totalValue)}`, color: 'text-primary' },
            { label: 'Total P&L', value: `${metrics.totalPnL >= 0 ? '+' : ''}$${formatNumber(metrics.totalPnL)}`, color: metrics.totalPnL >= 0 ? 'text-success' : 'text-destructive' },
            { label: 'Win Rate', value: `${formatNumber(metrics.winRate, 1)}%`, color: metrics.winRate >= 50 ? 'text-success' : 'text-warning' },
            { label: 'Balance', value: `$${formatNumber(metrics.balance)}`, color: 'text-primary' },
          ].map((m, i) => (
            <div key={i} className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">{m.label}</div>
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        <h3 className="font-bold mt-6 mb-4">💰 Holdings</h3>
        <div className="space-y-2">
          {Object.entries(portfolio.currencies)
            .filter(([, a]) => a > 0)
            .map(([code, amt]) => {
              const info = CURRENCIES.find((c) => c.code === code) || { flag: '💰', rate: 1 }
              return (
                <div key={code} className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>{info.flag} {code}</span>
                  <span className="font-medium">{formatNumber(amt)} (${formatNumber(amt * (info.rate || 1))})</span>
                </div>
              )
            })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">🛡️ Risk Management</h2>
        <div className="space-y-2">
          {RISK_LEVELS.map((rl) => (
            <div key={rl.id} className="flex justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium" style={{ color: rl.color }}>{rl.name}</div>
                <div className="text-xs text-muted-foreground">
                  Max Position: {(rl.maxPositionSize * 100).toFixed(0)}% | Max Loss: {(rl.maxLossPerTrade * 100).toFixed(0)}%
                </div>
              </div>
              <div className="w-3 h-3 rounded-full self-center" style={{ backgroundColor: rl.color }} />
            </div>
          ))}
        </div>

        <h3 className="font-bold mt-6 mb-4">📈 Performance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Total Trades</span><span className="font-medium">{trades.length}</span></div>
          <div className="flex justify-between"><span>Open Positions</span><span className="font-medium">{trades.filter((t) => t.status === 'filled' && !t.exitPrice).length}</span></div>
          <div className="flex justify-between"><span>Pending Orders</span><span className="font-medium">{trades.filter((t) => t.status === 'pending').length}</span></div>
        </div>
      </Card>
    </div>
  )
}