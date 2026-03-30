export const INSTITUTIONS = {
  wealthsimple: {
    id: 'wealthsimple',
    name: 'Wealthsimple',
    color: '#000000',
    bgColor: '#f0fdf4',
    emoji: '🌿',
    csvInstructions: 'Log in → Help Centre → "Request a custom statement" → select date range → Download CSV',
    csvColumns: ['Date', 'Activity', 'Description', 'Symbol', 'Quantity', 'Price', 'Amount'],
  },
  tangerine: {
    id: 'tangerine',
    name: 'Tangerine',
    color: '#FF6600',
    bgColor: '#fff7ed',
    emoji: '🍊',
    csvInstructions: 'Log in → Select account → "Download Transactions" button → CSV format',
    csvColumns: ['Date', 'Transaction', 'Name', 'Memo', 'Amount'],
  },
  computershare: {
    id: 'computershare',
    name: 'Computershare',
    color: '#003087',
    bgColor: '#eff6ff',
    emoji: '📊',
    csvInstructions: 'Log in to Investor Centre → Activity → Export → CSV',
    csvColumns: ['Date', 'Type', 'Description', 'Shares', 'Price', 'Amount'],
  },
  newton: {
    id: 'newton',
    name: 'Newton',
    color: '#6366f1',
    bgColor: '#f5f3ff',
    emoji: '⚡',
    csvInstructions: 'Log in → Account → Trade History → Export CSV',
    csvColumns: ['Date', 'Type', 'Pair', 'Side', 'Price', 'Amount (CAD)', 'Fee (CAD)'],
  },
  manual: {
    id: 'manual',
    name: 'Manual Entry',
    color: '#6b7280',
    bgColor: '#f9fafb',
    emoji: '✏️',
    csvInstructions: 'Enter balances manually',
    csvColumns: [],
  },
}

export const INSTITUTION_LIST = Object.values(INSTITUTIONS)
