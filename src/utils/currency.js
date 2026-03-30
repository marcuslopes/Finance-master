const cadFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** Format a number as CAD currency: $1,234.56 */
export function formatCAD(value) {
  const n = parseFloat(value)
  if (isNaN(n)) return '$0.00'
  return cadFormatter.format(n)
}

/** Format a number as USD: US$1,234.56 */
export function formatUSD(value) {
  const n = parseFloat(value)
  if (isNaN(n)) return 'US$0.00'
  return usdFormatter.format(n)
}

/** Format a large number compactly: $1.2M, $450K */
export function formatCompact(value) {
  const n = parseFloat(value)
  if (isNaN(n)) return '$0'
  return compactFormatter.format(n)
}

/** Format a percentage with sign: +5.2% or -1.3% */
export function formatPct(value, decimals = 1) {
  const n = parseFloat(value)
  if (isNaN(n)) return '0%'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(decimals)}%`
}

/** Format a delta amount with sign: +$1,234 or -$500 */
export function formatDelta(value) {
  const n = parseFloat(value)
  if (isNaN(n)) return '+$0.00'
  const formatted = cadFormatter.format(Math.abs(n))
  return n >= 0 ? `+${formatted}` : `-${formatted}`
}
