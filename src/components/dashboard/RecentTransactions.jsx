import { useNavigate } from 'react-router-dom'
import { formatCAD } from '../../utils/currency'
import { displayDate } from '../../utils/dates'
import { CategoryBadge } from '../ui/Badge'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function RecentTransactions({ transactions }) {
  const navigate = useNavigate()
  if (!transactions?.length) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-900">Recent Transactions</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
          See all
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 8).map((txn, i) => (
          <div key={txn.txn_id || i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CategoryBadge category={txn.category} />
              <span className="text-sm text-gray-700 truncate">{txn.description || '—'}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-medium tabular-nums ${
                parseFloat(txn.amount) >= 0 ? 'text-green-700' : 'text-gray-900'
              }`}>
                {formatCAD(txn.amount)}
              </p>
              <p className="text-xs text-gray-400">{displayDate(txn.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
