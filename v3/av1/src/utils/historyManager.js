// utils/historyManager.js

export const addConversionToHistory = (conversionData) => {
  try {
    const existingConversions = JSON.parse(localStorage.getItem('currencyConversions') || '[]')
    
    const newConversion = {
      id: `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: 'Conversion',
      fromCurrency: conversionData.fromCurrency,
      toCurrency: conversionData.toCurrency,
      fromAmount: parseFloat(conversionData.amount),
      toAmount: parseFloat(conversionData.result),
      rate: parseFloat(conversionData.rate),
      date: new Date().toISOString(),
      status: 'completed',
      type: 'Conversion'
    }
    
    existingConversions.push(newConversion)
    localStorage.setItem('currencyConversions', JSON.stringify(existingConversions))
    
    // Trigger update event
    window.dispatchEvent(new Event('historyUpdated'))
    
    return newConversion
  } catch (error) {
    console.error('Error saving conversion:', error)
    return null
  }
}

export const addTradeToHistory = (tradeData) => {
  try {
    const existingTrades = JSON.parse(localStorage.getItem('currencyTrades') || '[]')
    
    const newTrade = {
      id: `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: 'Trade',
      pair: `${tradeData.fromCurrency}/${tradeData.toCurrency}`,
      type: tradeData.type === 'buy' ? 'Buy' : 'Sell',
      amount: parseFloat(tradeData.amount),
      rate: parseFloat(tradeData.rate),
      total: parseFloat(tradeData.total),
      date: new Date().toISOString(),
      status: tradeData.orderType === 'market' ? 'completed' : 'pending',
      profit: tradeData.profit || '$0.00'
    }
    
    existingTrades.push(newTrade)
    localStorage.setItem('currencyTrades', JSON.stringify(existingTrades))
    
    // Trigger update event
    window.dispatchEvent(new Event('historyUpdated'))
    
    return newTrade
  } catch (error) {
    console.error('Error saving trade:', error)
    return null
  }
}

export const getConversionHistory = () => {
  return JSON.parse(localStorage.getItem('currencyConversions') || '[]')
}

export const getTradeHistory = () => {
  return JSON.parse(localStorage.getItem('currencyTrades') || '[]')
}

export const clearHistory = () => {
  localStorage.removeItem('currencyConversions')
  localStorage.removeItem('currencyTrades')
  window.dispatchEvent(new Event('historyUpdated'))
}