import { INSTITUTIONS } from '../../constants/institutions'
import Card from '../ui/Card'

export default function Step1_SelectAccount({ accounts, onSelect }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-1">Which account is this for?</h2>
      <p className="text-sm text-gray-500 mb-4">Select the account that matches your CSV file.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map(account => {
          const inst = INSTITUTIONS[account.institution] || INSTITUTIONS.manual
          return (
            <Card
              key={account.account_id}
              className="p-4 cursor-pointer hover:border-primary-300 hover:shadow-md active:scale-[0.98] transition-all"
              onClick={() => onSelect(account)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: inst.bgColor }}
                >
                  {inst.emoji}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{account.account_name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {inst.name} · {account.account_type.replace(/-/g, ' ')}
                  </p>
                </div>
                <span className="ml-auto text-gray-300 text-lg">›</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
