import { useNavigate } from 'react-router-dom'
import { INSTITUTIONS } from '../../constants/institutions'
import { formatCAD } from '../../utils/currency'
import Card from '../ui/Card'

export default function AccountSummaryList({ byAccount }) {
  const navigate = useNavigate()

  if (!byAccount?.length) return null

  return (
    <div>
      <p className="font-medium text-gray-900 mb-3">Accounts</p>
      {/* Horizontal scroll on mobile, vertical on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
        {byAccount.map(({ account, balance, date }) => {
          const inst = INSTITUTIONS[account.institution] || INSTITUTIONS.manual
          return (
            <Card
              key={account.account_id}
              className="p-3 flex-shrink-0 w-44 md:w-auto"
              onClick={() => navigate('/accounts')}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{inst.emoji}</span>
                <span className="text-xs font-medium text-gray-600 truncate">{inst.name}</span>
              </div>
              <p className="text-sm font-medium text-gray-700 truncate mb-1">{account.account_name}</p>
              <p className="font-bold text-gray-900 tabular-nums text-sm">{formatCAD(balance)}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
