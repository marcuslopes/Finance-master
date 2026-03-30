import { INSTITUTIONS } from '../../constants/institutions'
import { formatCAD } from '../../utils/currency'
import { displayDate } from '../../utils/dates'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { Pencil, Trash2 } from 'lucide-react'

export default function AccountCard({ account, latestBalance, onEdit, onDeactivate }) {
  const inst = INSTITUTIONS[account.institution] || INSTITUTIONS.manual
  const balance = latestBalance ? parseFloat(latestBalance.balance_cad) : null

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Institution + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: inst.bgColor }}
          >
            {inst.emoji}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{account.account_name}</p>
            <p className="text-xs text-gray-500 capitalize">{account.account_type.replace(/-/g, ' ')}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right flex-shrink-0">
          {balance !== null ? (
            <>
              <p className="font-semibold text-gray-900 tabular-nums">{formatCAD(balance)}</p>
              {latestBalance?.date && (
                <p className="text-xs text-gray-400">as of {displayDate(latestBalance.date)}</p>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400">No data</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Badge color={account.currency === 'USD' ? 'blue' : 'teal'}>
          {account.currency}
        </Badge>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit?.(account)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit account"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDeactivate?.(account)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Remove account"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  )
}
