export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')