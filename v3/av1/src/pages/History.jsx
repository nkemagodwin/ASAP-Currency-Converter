import React, { useState, useEffect } from 'react'

export default function History() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItems, setSelectedItems] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [userHistory, setUserHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load history from localStorage on component mount
  useEffect(() => {
    loadUserHistory()
    
    // Listen for storage changes from other tabs/components
    window.addEventListener('storage', loadUserHistory)
    
    // Custom event listener for real-time updates within the same tab
    window.addEventListener('historyUpdated', loadUserHistory)
    
    return () => {
      window.removeEventListener('storage', loadUserHistory)
      window.removeEventListener('historyUpdated', loadUserHistory)
    }
  }, [])

  const loadUserHistory = () => {
    setLoading(true)
    try {
      // Get transactions from localStorage
      const storedConversions = JSON.parse(localStorage.getItem('currencyConversions') || '[]')
      const storedTrades = JSON.parse(localStorage.getItem('currencyTrades') || '[]')
      
      // Process and format conversions
      const formattedConversions = storedConversions.map(conv => ({
        ...conv,
        category: 'Conversion',
        id: conv.id || `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: conv.date || new Date().toISOString(),
        status: conv.status || 'completed'
      }))
      
      // Process and format trades
      const formattedTrades = storedTrades.map(trade => ({
        ...trade,
        category: 'Trade',
        id: trade.id || `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: trade.date || new Date().toISOString(),
        status: trade.status || 'completed'
      }))
      
      // Combine and sort by date (newest first)
      const allHistory = [...formattedConversions, ...formattedTrades]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setUserHistory(allHistory)
    } catch (error) {
      console.error('Error loading history:', error)
      // If there's an error, set empty array
      setUserHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Function to add a new transaction (can be called from other components)
  const addTransaction = (transaction) => {
    try {
      const storageKey = transaction.type === 'trade' ? 'currencyTrades' : 'currencyConversions'
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]')
      
      const newTransaction = {
        ...transaction,
        id: transaction.id || `${transaction.type === 'trade' ? 'TRD' : 'CONV'}-${Date.now()}`,
        date: transaction.date || new Date().toISOString(),
        status: transaction.status || 'completed'
      }
      
      existingData.push(newTransaction)
      localStorage.setItem(storageKey, JSON.stringify(existingData))
      
      // Trigger update
      window.dispatchEvent(new Event('historyUpdated'))
      
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      return null
    }
  }

  // Function to delete a transaction
  const deleteTransaction = (id, category) => {
    try {
      const storageKey = category === 'Trade' ? 'currencyTrades' : 'currencyConversions'
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updatedData = existingData.filter(item => item.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updatedData))
      
      // Trigger update
      window.dispatchEvent(new Event('historyUpdated'))
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  // Function to clear all history
  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      localStorage.removeItem('currencyConversions')
      localStorage.removeItem('currencyTrades')
      window.dispatchEvent(new Event('historyUpdated'))
      setSelectedItems([])
    }
  }

  // Get filtered and sorted history
  const getFilteredHistory = () => {
    let filtered = [...userHistory]

    // Filter by tab
    if (activeTab === 'conversions') {
      filtered = filtered.filter(item => item.category === 'Conversion')
    } else if (activeTab === 'trades') {
      filtered = filtered.filter(item => item.category === 'Trade')
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(search) ||
        item.fromCurrency?.toLowerCase().includes(search) ||
        item.toCurrency?.toLowerCase().includes(search) ||
        item.pair?.toLowerCase().includes(search)
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch(dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      filtered = filtered.filter(item => new Date(item.date) >= filterDate)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        
        // Handle date sorting
        if (sortConfig.key === 'date') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(currentItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const exportHistory = (format) => {
    const filteredData = getFilteredHistory().filter(item => 
      selectedItems.length === 0 || selectedItems.includes(item.id)
    )
    
    if (filteredData.length === 0) {
      alert('No data to export')
      return
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Type', 'Details', 'Amount', 'Rate', 'Total', 'Date', 'Status']
      const csvContent = [
        headers.join(','),
        ...filteredData.map(item => 
          [
            item.id,
            item.category,
            item.pair || `${item.fromCurrency}/${item.toCurrency}`,
            item.amount || item.fromAmount,
            item.rate,
            item.total || item.toAmount,
            new Date(item.date).toLocaleString(),
            item.status
          ].join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `currency-history-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      alert('PDF export coming soon!')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-red-100 text-red-700',
      'failed': 'bg-gray-100 text-gray-700'
    }
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  const getProfitColor = (profit) => {
    if (!profit) return 'text-gray-600'
    return profit.toString().startsWith('+') ? 'text-green-600' : 'text-red-600'
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  const filteredHistory = getFilteredHistory()
  const totalRecords = filteredHistory.length
  
  // Calculate pagination
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, dateFilter, statusFilter])

  // Summary calculations
  const conversions = userHistory.filter(item => item.category === 'Conversion')
  const trades = userHistory.filter(item => item.category === 'Trade')
  const totalVolume = userHistory.reduce((sum, item) => {
    return sum + (parseFloat(item.total || item.toAmount || 0))
  }, 0)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-950 mb-4">Transaction History</h1>
          <p className="text-xl text-gray-600">View and manage your real-time transaction history</p>
          {userHistory.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
              <p className="text-yellow-800">
                📝 No transactions yet. Start converting or trading currencies to build your history!
              </p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-950">{userHistory.length}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Conversions</p>
                <p className="text-2xl font-bold text-blue-600">{conversions.length}</p>
              </div>
              <div className="text-3xl">💱</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Trades</p>
                <p className="text-2xl font-bold text-green-600">{trades.length}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'conversions', label: 'Conversions' },
                { key: 'trades', label: 'Trades' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID or currency..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => exportHistory('csv')}
                disabled={filteredHistory.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              {userHistory.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-950 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:text-blue-300"
                    onClick={() => handleSort('id')}
                  >
                    ID <SortIcon column="id" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Details</th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-blue-300"
                    onClick={() => handleSort('fromAmount')}
                  >
                    Amount <SortIcon column="fromAmount" />
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-blue-300"
                    onClick={() => handleSort('rate')}
                  >
                    Rate <SortIcon column="rate" />
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-blue-300"
                    onClick={() => handleSort('total')}
                  >
                    Total <SortIcon column="total" />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:text-blue-300"
                    onClick={() => handleSort('date')}
                  >
                    Date <SortIcon column="date" />
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">
                        {userHistory.length === 0 ? '📝' : '🔍'}
                      </div>
                      <p className="text-lg font-semibold">
                        {userHistory.length === 0 
                          ? 'No transactions yet' 
                          : 'No transactions match your filters'}
                      </p>
                      <p className="text-sm">
                        {userHistory.length === 0 
                          ? 'Start converting or trading currencies to see your history here.' 
                          : 'Try adjusting your filters or search terms'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-blue-600 font-semibold">{item.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.category === 'Conversion' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.category === 'Conversion' ? '💱' : '📈'} {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.category === 'Conversion' ? (
                          <div>
                            <p className="font-semibold text-blue-950">
                              {item.fromCurrency} → {item.toCurrency}
                            </p>
                            <p className="text-sm text-gray-500">
                              {parseFloat(item.fromAmount).toLocaleString()} {item.fromCurrency}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-blue-950">{item.pair}</p>
                            <p className={`text-sm font-semibold ${
                              item.type === 'Buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.type}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {item.category === 'Conversion' 
                            ? `${parseFloat(item.fromAmount).toLocaleString()} ${item.fromCurrency}`
                            : `${parseFloat(item.amount || 0).toLocaleString()}`
                          }
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {parseFloat(item.rate).toFixed(4)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.category === 'Conversion'
                              ? `${parseFloat(item.toAmount).toLocaleString()} ${item.toCurrency}`
                              : `$${parseFloat(item.total || 0).toLocaleString()}`
                            }
                          </p>
                          {item.profit && (
                            <p className={`text-sm font-semibold ${getProfitColor(item.profit)}`}>
                              {item.profit}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{formatDate(item.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                            onClick={() => {
                              alert(JSON.stringify(item, null, 2))
                            }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                            onClick={() => deleteTransaction(item.id, item.category)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                <span className="font-semibold">{totalRecords}</span> transactions
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Helper text at bottom */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Transactions are automatically saved to your browser's local storage.</p>
          <p>They persist until you clear your browser data or use the "Clear All" button.</p>
        </div>
      </div>
    </div>
  )
}