'use client'

import { useState, useEffect, useCallback } from 'react'
import { CURRENCIES } from '../lib/utils/constants'

export function useCurrencyData() {
  const [currencies, setCurrencies] = useState(() =>
    CURRENCIES.map((c) => ({ ...c, rate: 1, previousRate: 1, change: 0 }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [rateHistory, setRateHistory] = useState({})

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/exchange-rates?base=USD')
      if (!res.ok) throw new Error('Failed to fetch rates')
      const data = await res.json()

      setCurrencies((prev) =>
        prev.map((currency) => {
          if (currency.code === 'USD') {
            return { ...currency, rate: 1, previousRate: 1, lastUpdate: data.timestamp }
          }
          const liveRate = data.rates[currency.code]
          if (liveRate) {
            const previousRate = currency.rate || 1
            const change = ((liveRate - previousRate) / previousRate) * 100
            return {
              ...currency,
              rate: liveRate,
              previousRate,
              change: parseFloat(change.toFixed(4)),
              trend: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'neutral',
              lastUpdate: data.timestamp,
            }
          }
          return currency
        })
      )
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching rates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 30000)
    return () => clearInterval(interval)
  }, [fetchRates])

  return { currencies, loading, error, lastUpdate, rateHistory, refresh: fetchRates }
}