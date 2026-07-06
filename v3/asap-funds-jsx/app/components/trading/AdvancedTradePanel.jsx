'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'
import { TradingEngine } from '../../lib/trading/engine'
import { ORDER_TYPES, RISK_LEVELS, TRADING_PAIRS } from '../../lib/utils/constants'
import { formatNumber } from '../../lib/utils/formatters'

export function AdvancedTradePanel({ currencies, portfolio, selectedPair, onPairChange, onExecuteTrade }) {
  const [direction, setDirection] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [amount, setAmount] = useState(100)
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [riskLevel, setRiskLevel] = useState('medium')
  const [leverage, setLeverage] = useState(1)

  const currentRate = useMemo(() => {
    const [base, quote] = selectedPair.split('/')
    return TradingEngine.calculatePairRate(base, quote, currencies)
  }, [selectedPair, currencies])

  const margin = useMemo(() => TradingEngine.calculateMargin(amount, currentRate, leverage), [amount, currentRate, leverage])

  const handleExecute = useCallback(() => {
    onExecuteTrade({
      pair: selectedPair,
      direction,
      orderType,
      amount,
      entryPrice: currentRate,
      stopLoss: stopLoss ? +stopLoss : null,
      takeProfit: takeProfit ? +takeProfit : null,
      riskLevel,
      leverage,
      margin,
      spreadCost: TradingEngine.calculateSpreadCost(amount, TRADING_PAIRS.find((p) => p.pair === selectedPair)?.spread || 0.0001),
    })
  }, [direction, orderType, amount, currentRate, stopLoss, takeProfit, riskLevel, leverage, margin, selectedPair, onExecuteTrade])

  return (
    <Card className="space-y-6">
      <h2 className="text-2xl font-bold">🚀 Advanced Trading</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Trading Pair</label>
        <div className="grid grid-cols-3 gap-2">
          {TRADING_PAIRS.map((p) => (
            <button
              key={p.pair}
              onClick={() => onPairChange(p.pair)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                selectedPair === p.pair ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p.pair}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground">Current Rate</div>
        <div className="text-2xl font-bold">{currentRate.toFixed(6)}</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Direction</label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={direction === 'buy' ? 'buy' : 'outline'} onClick={() => setDirection('buy')} className="w-full">📈 BUY</Button>
          <Button variant={direction === 'sell' ? 'sell' : 'outline'} onClick={() => setDirection('sell')} className="w-full">📉 SELL</Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Order Type</label>
        <div className="grid grid-cols-3 gap-2">
          {ORDER_TYPES.map((ot) => (
            <Tooltip key={ot.id} content={ot.description}>
              <button
                onClick={() => setOrderType(ot.id)}
                className={`px-3 py-2 rounded text-sm ${orderType === ot.id ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                {ot.icon} {ot.name}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))} className="input-field" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Take Profit</label>
          <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="input-field" placeholder="TP" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Stop Loss</label>
          <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="input-field" placeholder="SL" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {RISK_LEVELS.map((rl) => (
            <button
              key={rl.id}
              onClick={() => setRiskLevel(rl.id)}
              className="px-3 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor: riskLevel === rl.id ? rl.color : undefined,
                color: riskLevel === rl.id ? 'white' : undefined,
                opacity: riskLevel === rl.id ? 1 : 0.5,
              }}
            >
              {rl.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Leverage: 1:{leverage}</label>
        <input type="range" min="1" max="10" value={leverage} onChange={(e) => setLeverage(+e.target.value)} className="w-full" />
      </div>

      <div className="bg-muted rounded-lg p-4 space-y-2">
        <h4 className="font-semibold">📊 Trade Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Entry: <span className="font-medium">{currentRate.toFixed(6)}</span></div>
          <div>Margin: <span className="font-medium">${formatNumber(margin)}</span></div>
        </div>
      </div>

      <Button
        variant={direction === 'buy' ? 'buy' : 'sell'}
        className="w-full text-lg py-6"
        onClick={handleExecute}
      >
        {direction === 'buy' ? '📈' : '📉'} {orderType === 'market' ? 'EXECUTE MARKET ORDER' : 'PLACE ORDER'}
      </Button>
    </Card>
  )
}