export class TradingEngine {
  static calculatePairRate(baseCurrency, quoteCurrency, currencies) {
    const base = currencies.find((c) => c.code === baseCurrency)
    const quote = currencies.find((c) => c.code === quoteCurrency)
    if (!base || !quote) return 1
    const baseToUSD = base.code === 'USD' ? 1 : base.rate || 1
    const quoteToUSD = quote.code === 'USD' ? 1 : quote.rate || 1
    return baseToUSD / quoteToUSD
  }

  static convertCurrency(amount, fromCurrency, toCurrency, currencies) {
    if (fromCurrency === toCurrency) return amount
    const rate = this.calculatePairRate(fromCurrency, toCurrency, currencies)
    return amount * rate
  }

  static calculateMargin(positionSize, price, leverage = 1) {
    return (positionSize * price) / leverage
  }

  static calculateSpreadCost(positionSize, spread) {
    return positionSize * spread
  }

  static calculateProfitLoss(positionSize, entryPrice, exitPrice, direction) {
    const diff = exitPrice - entryPrice
    return positionSize * diff * (direction === 'buy' ? 1 : -1)
  }
}