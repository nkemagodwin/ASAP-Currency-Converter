import React, { useState, useEffect } from 'react'

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
]

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [result, setResult] = useState(null)
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulated exchange rates (in production, fetch from API)
    const mockRates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, 
      AUD: 1.53, CAD: 1.35, CHF: 0.88, CNY: 7.24, INR: 83.12
    }
    setRates(mockRates)
  }, [])

  const handleConvert = (e) => {
    e.preventDefault()
    if (!amount || isNaN(amount)) return

    setLoading(true)
    setTimeout(() => {
      const fromRate = rates[fromCurrency]
      const toRate = rates[toCurrency]
      const converted = (amount / fromRate) * toRate
      setResult(converted.toFixed(2))
      setLoading(false)
    }, 500)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">
        Currency Converter
      </h2>
      
      <form onSubmit={handleConvert} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
            step="0.01"
            min="0"
          />
        </div>

        <div className="grid grid-cols-5 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapCurrencies}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">
              {amount} {fromCurrency} =
            </p>
            <p className="text-4xl font-bold text-blue-950">
              {result} {toCurrency}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}