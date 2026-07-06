
import React, { useState, useEffect } from 'react'

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
]

const tradeHistoryData = [
  { id: 1, pair: 'EUR/USD', type: 'Buy', amount: '1,000', rate: '1.0925', total: '$1,092.50', date: '2024-01-15 14:30', status: 'Completed' },
  { id: 2, pair: 'GBP/USD', type: 'Sell', amount: '500', rate: '1.2650', total: '$632.50', date: '2024-01-15 12:15', status: 'Completed' },
  { id: 3, pair: 'USD/JPY', type: 'Buy', amount: '5,000', rate: '149.50', total: '¥747,500', date: '2024-01-14 16:45', status: 'Pending' },
  { id: 4, pair: 'AUD/USD', type: 'Sell', amount: '2,000', rate: '0.6570', total: '$1,314.00', date: '2024-01-14 10:00', status: 'Completed' },
]

const marketData = [
  { pair: 'EUR/USD', rate: '1.0925', change: '+0.0012', changePercent: '+0.11%', high: '1.0945', low: '1.0900', volume: '1.2M' },
  { pair: 'GBP/USD', rate: '1.2650', change: '-0.0030', changePercent: '-0.24%', high: '1.2700', low: '1.2620', volume: '890K' },
  { pair: 'USD/JPY', rate: '149.50', change: '+0.85', changePercent: '+0.57%', high: '150.10', low: '148.80', volume: '2.1M' },
  { pair: 'AUD/USD', rate: '0.6570', change: '+0.0015', changePercent: '+0.23%', high: '0.6590', low: '0.6545', volume: '650K' },
  { pair: 'USD/CAD', rate: '1.3450', change: '-0.0020', changePercent: '-0.15%', high: '1.3480', low: '1.3420', volume: '780K' },
]

export default function Trade() {
  const [activeTab, setActiveTab] = useState('trade')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [amount, setAmount] = useState('')
  const [orderType, setOrderType] = useState('market')
  const [limitPrice, setLimitPrice] = useState('')
  const [tradeType, setTradeType] = useState('buy')
  const [estimatedTotal, setEstimatedTotal] = useState(0)
  const [rate, setRate] = useState(0.92)

  useEffect(() => {
    // Simulate fetching live rates based on selected pair
    const mockRates = {
      'USDEUR': 0.92,
      'USDGBP': 0.79,
      'USDJPY': 149.50,
      'USDAUD': 1.53,
      'USDCAD': 1.35,
      'EURUSD': 1.09,
      'GBPUSD': 1.27,
      'JPYUSD': 0.0067,
      'AUDUSD': 0.66,
      'CADUSD': 0.74,
    }
    
    const pairKey = fromCurrency + toCurrency
    const currentRate = mockRates[pairKey] || 1
    setRate(currentRate)
    
    if (amount) {
      setEstimatedTotal((parseFloat(amount) * currentRate).toFixed(2))
    }
  }, [fromCurrency, toCurrency, amount])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    setAmount(value)
    if (value && !isNaN(value)) {
      setEstimatedTotal((parseFloat(value) * rate).toFixed(2))
    } else {
      setEstimatedTotal(0)
    }
  }

  const handleTrade = (e) => {
    e.preventDefault()
    // Handle trade execution logic
    console.log('Trade:', { fromCurrency, toCurrency, amount, orderType, tradeType, limitPrice })
    alert('Trade executed successfully!')
  }

  const getChangeColor = (change) => {
    return change.startsWith('+') ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-950 mb-4">Currency Trading</h1>
          <p className="text-xl text-gray-600">Trade currencies with real-time rates and advanced tools</p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-1">Balance</p>
            <p className="text-2xl font-bold text-blue-950">$25,430.00</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-1">Today's P&L</p>
            <p className="text-2xl font-bold text-green-500">+$342.50</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-1">Open Positions</p>
            <p className="text-2xl font-bold text-blue-950">3</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-blue-950">47</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg mb-8">
          {['trade', 'market', 'history', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Trade Tab */}
        {activeTab === 'trade' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trading Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-blue-950 mb-6">New Trade</h2>
              
              <form onSubmit={handleTrade} className="space-y-6">
                {/* Buy/Sell Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-3 font-semibold transition-colors ${
                      tradeType === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-3 font-semibold transition-colors ${
                      tradeType === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-7 gap-4 items-end">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={swapCurrencies}
                      className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="market"
                        checked={orderType === 'market'}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">Market</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="limit"
                        checked={orderType === 'limit'}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">Limit</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="stop"
                        checked={orderType === 'stop'}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">Stop Loss</span>
                    </label>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({fromCurrency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Limit Price (if limit order) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit Price
                    </label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter limit price"
                      step="0.0001"
                    />
                  </div>
                )}

                {/* Rate Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="text-lg font-semibold text-blue-950">
                      1 {fromCurrency} = {rate} {toCurrency}
                    </span>
                  </div>
                  {amount && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Estimated Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {estimatedTotal} {toCurrency}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {fromCurrency}/{toCurrency}
                </button>
              </form>
            </div>

            {/* Live Rates Sidebar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-blue-950 mb-4">Live Rates</h3>
              <div className="space-y-3">
                {marketData.slice(0, 8).map((item) => (
                  <div key={item.pair} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-blue-950">{item.pair}</p>
                      <p className={`text-sm ${getChangeColor(item.change)}`}>
                        {item.change} ({item.changePercent})
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-950">{item.rate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-blue-950 text-white">
              <h2 className="text-2xl font-bold">Market Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pair</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Rate</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Change</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">High</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Low</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Volume</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marketData.map((item) => (
                    <tr key={item.pair} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-950">{item.pair}</td>
                      <td className="px-6 py-4 text-right font-medium">{item.rate}</td>
                      <td className={`px-6 py-4 text-right ${getChangeColor(item.change)}`}>
                        {item.change} ({item.changePercent})
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.high}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.low}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.volume}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Trade History</h2>
              <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pair</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Rate</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tradeHistoryData.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">#{trade.id}</td>
                      <td className="px-6 py-4 font-semibold text-blue-950">{trade.pair}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          trade.type === 'Buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{trade.amount}</td>
                      <td className="px-6 py-4 text-right font-medium">{trade.rate}</td>
                      <td className="px-6 py-4 text-right font-semibold">{trade.total}</td>
                      <td className="px-6 py-4 text-gray-600">{trade.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          trade.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-blue-950 mb-6">Performance Chart</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-lg">Chart Coming Soon</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-blue-950 mb-6">Trading Statistics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Win Rate', value: '68%', color: 'text-green-500' },
                  { label: 'Average Profit', value: '$245.30', color: 'text-green-500' },
                  { label: 'Average Loss', value: '-$180.20', color: 'text-red-500' },
                  { label: 'Profit Factor', value: '1.36', color: 'text-blue-600' },
                  { label: 'Total Trades', value: '47', color: 'text-blue-950' },
                  { label: 'Best Trade', value: '+$890.00', color: 'text-green-500' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}