import { useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { formatCAD } from '../utils/currency'
import { displayDate } from '../utils/dates'
import { CategoryBadge } from '../components/ui/Badge'
import { LoadingScreen } from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Card from '../components/ui/Card'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { Search } from 'lucide-react'

const CATEGORIES = ['', 'buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'transfer', 'interest', 'crypto_buy', 'crypto_sell', 'other']

export default function TransactionsPage() {
  const { transactions, loading } = useTransactions()
  const { accounts } = useAccounts()
  const [search, setSearch] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const accountMap = accounts.reduce((m, a) => ({ ...m, [a.account_id]: a }), {})

  const filtered = transactions.filter(txn => {
    if (filterAccount && txn.account_id !== filterAccount) return false
    if (filterCategory && txn.category !== filterCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (txn.description || '').toLowerCase().includes(q) ||
        (txn.ticker || '').toLowerCase().includes(q) ||
        String(txn.amount).includes(q)
      )
    }
    return true
  })

  if (loading) return <LoadingScreen />

  return (
    <PageContainer>
      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <Select className="flex-1" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.account_name}</option>)}
          </Select>
          <Select className="flex-1" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.filter(Boolean).map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-gray-500">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={transactions.length === 0 ? 'No transactions yet' : 'No matches'}
          description={transactions.length === 0 ? 'Import a CSV to see your transactions.' : 'Try adjusting your filters.'}
        />
      ) : (
        <Card className="divide-y divide-gray-100 overflow-hidden">
          {filtered.map((txn, i) => {
            const account = accountMap[txn.account_id]
            const amount = parseFloat(txn.amount) || 0
            return (
              <div key={txn.txn_id || i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={txn.category} />
                    {txn.ticker && (
                      <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                        {txn.ticker}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 truncate mt-0.5">{txn.description || '—'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{displayDate(txn.date)}</span>
                    {account && <span className="text-xs text-gray-400">· {account.account_name}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium tabular-nums ${amount >= 0 ? 'text-green-700' : 'text-gray-900'}`}>
                    {formatCAD(amount)}
                  </p>
                </div>
              </div>
            )
          })}
        </Card>
      )}
    </PageContainer>
  )
}
