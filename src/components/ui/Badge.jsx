const CATEGORY_COLORS = {
  buy:          'bg-green-100 text-green-800',
  sell:         'bg-red-100 text-red-800',
  dividend:     'bg-blue-100 text-blue-800',
  deposit:      'bg-emerald-100 text-emerald-800',
  withdrawal:   'bg-orange-100 text-orange-800',
  fee:          'bg-gray-100 text-gray-700',
  transfer:     'bg-purple-100 text-purple-800',
  interest:     'bg-cyan-100 text-cyan-800',
  crypto_buy:   'bg-violet-100 text-violet-800',
  crypto_sell:  'bg-pink-100 text-pink-800',
  other:        'bg-gray-100 text-gray-600',
}

export function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  const label = category?.replace(/_/g, ' ') || 'other'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {label}
    </span>
  )
}

export default function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    green:  'bg-green-100 text-green-800',
    red:    'bg-red-100 text-red-800',
    blue:   'bg-blue-100 text-blue-800',
    teal:   'bg-primary-100 text-primary-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
