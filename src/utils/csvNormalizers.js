import { buildInstitutionRef } from './dedup'

/**
 * Normalize a Wealthsimple CSV row.
 * Typical columns: Date, Activity, Description, Symbol, Quantity, Price, Amount
 */
export function normalizeWealthsimple(row, mapping) {
  const date = row[mapping.date || 'Date']
  const activity = (row[mapping.activity || 'Activity'] || '').toLowerCase()
  const description = row[mapping.description || 'Description'] || ''
  const symbol = row[mapping.ticker || 'Symbol'] || ''
  const quantity = parseFloat(row[mapping.quantity || 'Quantity']) || 0
  const price = parseFloat(row[mapping.price || 'Price']) || 0
  const amount = parseFloat((row[mapping.amount || 'Amount'] || '').replace(/[,$]/g, '')) || 0

  const categoryMap = {
    'buy': 'buy', 'sell': 'sell', 'deposit': 'deposit', 'withdrawal': 'withdrawal',
    'dividend': 'dividend', 'interest': 'interest', 'fee': 'fee', 'transfer': 'transfer',
    'contribution': 'deposit', 'withdrawal': 'withdrawal',
  }
  const category = categoryMap[activity] || 'other'

  const institutionRef = buildInstitutionRef(date, amount, description)

  return {
    date: normalizeDate(date),
    description,
    category,
    amount,
    currency: 'CAD',
    quantity: quantity || '',
    price: price || '',
    ticker: symbol.toUpperCase() || '',
    institution_ref: institutionRef,
    notes: '',
  }
}

/**
 * Normalize a Tangerine CSV row.
 * Typical columns: Date, Transaction, Name, Memo, Amount
 */
export function normalizeTangerine(row, mapping) {
  const date = row[mapping.date || 'Date']
  const transaction = (row[mapping.transaction || 'Transaction'] || '').toLowerCase()
  const name = row[mapping.name || 'Name'] || ''
  const memo = row[mapping.memo || 'Memo'] || ''
  const amount = parseFloat((row[mapping.amount || 'Amount'] || '').replace(/[,$]/g, '')) || 0

  const description = name || memo || transaction

  const categoryMap = {
    'debit': amount < 0 ? 'withdrawal' : 'deposit',
    'credit': amount > 0 ? 'deposit' : 'withdrawal',
    'transfer': 'transfer',
    'interest': 'interest',
    'fee': 'fee',
  }
  const category = categoryMap[transaction] || (amount >= 0 ? 'deposit' : 'withdrawal')
  const institutionRef = buildInstitutionRef(date, amount, description)

  return {
    date: normalizeDate(date),
    description,
    category,
    amount,
    currency: 'CAD',
    quantity: '',
    price: '',
    ticker: '',
    institution_ref: institutionRef,
    notes: memo !== description ? memo : '',
  }
}

/**
 * Normalize a Computershare CSV row.
 * Typical columns: Date, Type, Description, Shares, Price, Amount
 */
export function normalizeComputershare(row, mapping) {
  const date = row[mapping.date || 'Date']
  const type = (row[mapping.type || 'Type'] || '').toLowerCase()
  const description = row[mapping.description || 'Description'] || ''
  const shares = parseFloat(row[mapping.shares || 'Shares']) || 0
  const price = parseFloat(row[mapping.price || 'Price']) || 0
  const amount = parseFloat((row[mapping.amount || 'Amount'] || '').replace(/[,$]/g, '')) || 0

  const categoryMap = {
    'purchase': 'buy', 'sale': 'sell', 'drip': 'buy',
    'dividend': 'dividend', 'reinvestment': 'buy', 'transfer': 'transfer',
    'split': 'other',
  }
  const category = categoryMap[type] || 'other'
  const institutionRef = buildInstitutionRef(date, amount, description)

  return {
    date: normalizeDate(date),
    description,
    category,
    amount,
    currency: 'CAD',
    quantity: shares || '',
    price: price || '',
    ticker: '',
    institution_ref: institutionRef,
    notes: '',
  }
}

/**
 * Normalize a Newton CSV row.
 * Typical columns: Date, Type, Pair, Side, Price, Amount, Fee
 */
export function normalizeNewton(row, mapping) {
  const date = row[mapping.date || 'Date']
  const type = (row[mapping.type || 'Type'] || '').toLowerCase()
  const pair = row[mapping.pair || 'Pair'] || ''
  const side = (row[mapping.side || 'Side'] || '').toLowerCase()
  const price = parseFloat(row[mapping.price || 'Price']) || 0
  const amount = parseFloat((row[mapping.amount || 'Amount (CAD)'] || row[mapping.amount || 'Amount'] || '').replace(/[,$]/g, '')) || 0
  const fee = parseFloat(row[mapping.fee || 'Fee (CAD)'] || 0) || 0

  // Extract ticker from pair (e.g. "BTC-CAD" → "BTC")
  const ticker = pair.split('-')[0] || pair

  const categoryMap = {
    'trade': side === 'buy' ? 'crypto_buy' : 'crypto_sell',
    'deposit': 'deposit',
    'withdrawal': 'withdrawal',
    'buy': 'crypto_buy',
    'sell': 'crypto_sell',
  }
  const category = categoryMap[type] || (side === 'buy' ? 'crypto_buy' : 'crypto_sell')
  const institutionRef = buildInstitutionRef(date, amount, `${type}-${pair}`)

  return {
    date: normalizeDate(date),
    description: `${side ? side.charAt(0).toUpperCase() + side.slice(1) + ' ' : ''}${ticker || pair}`,
    category,
    amount: side === 'sell' ? amount : -amount, // buys are outflows in CAD
    currency: 'CAD',
    quantity: '',
    price: price || '',
    ticker: ticker.toUpperCase(),
    institution_ref: institutionRef,
    notes: fee ? `Fee: $${fee.toFixed(2)} CAD` : '',
  }
}

/**
 * Generic normalizer using custom field mapping from the wizard.
 */
export function normalizeGeneric(row, mapping) {
  const date = row[mapping.date]
  const description = row[mapping.description] || ''
  const rawAmount = (row[mapping.amount] || '').replace(/[,$]/g, '')
  const amount = parseFloat(rawAmount) || 0
  const ticker = (row[mapping.ticker] || '').toUpperCase()
  const quantity = parseFloat(row[mapping.quantity]) || ''
  const price = parseFloat(row[mapping.price]) || ''
  const institutionRef = buildInstitutionRef(date, amount, description)

  return {
    date: normalizeDate(date),
    description,
    category: 'other',
    amount,
    currency: 'CAD',
    quantity,
    price,
    ticker,
    institution_ref: institutionRef,
    notes: '',
  }
}

/** Institution preset column mappings */
export const INSTITUTION_PRESETS = {
  wealthsimple: {
    normalizer: normalizeWealthsimple,
    mapping: {
      date: 'Date', activity: 'Activity', description: 'Description',
      ticker: 'Symbol', quantity: 'Quantity', price: 'Price', amount: 'Amount',
    },
  },
  tangerine: {
    normalizer: normalizeTangerine,
    mapping: {
      date: 'Date', transaction: 'Transaction', name: 'Name', memo: 'Memo', amount: 'Amount',
    },
  },
  computershare: {
    normalizer: normalizeComputershare,
    mapping: {
      date: 'Date', type: 'Type', description: 'Description',
      shares: 'Shares', price: 'Price', amount: 'Amount',
    },
  },
  newton: {
    normalizer: normalizeNewton,
    mapping: {
      date: 'Date', type: 'Type', pair: 'Pair', side: 'Side',
      price: 'Price', amount: 'Amount (CAD)', fee: 'Fee (CAD)',
    },
  },
}

// ─── Date normalization ───────────────────────────────────────────────────────

/**
 * Normalize a date string to YYYY-MM-DD.
 * Handles: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, Month DD YYYY, etc.
 */
export function normalizeDate(str) {
  if (!str) return ''
  const s = String(str).trim()

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10)

  // MM/DD/YYYY or M/D/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`

  // DD/MM/YYYY (Tangerine uses this)
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`

  // Try native Date parse as fallback
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    return d.toISOString().substring(0, 10)
  }

  return s
}
