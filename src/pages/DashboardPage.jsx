import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import NetWorthCard from '../components/dashboard/NetWorthCard'
import AccountSummaryList from '../components/dashboard/AccountSummaryList'
import AllocationChart from '../components/dashboard/AllocationChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import Button from '../components/ui/Button'
import { useAccounts } from '../hooks/useAccounts'
import { useLatestBalances } from '../hooks/useBalances'
import { useHoldings } from '../hooks/useHoldings'
import { useTransactions } from '../hooks/useTransactions'
import { useNetWorth, useNetWorthHistory } from '../hooks/useNetWorth'
import { useAllocation } from '../hooks/useAllocation'
import { listSnapshots } from '../api/balances'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'

export default function DashboardPage() {
  const { idToken } = useAuth()
  const navigate = useNavigate()
  const { accounts, loading: accLoading } = useAccounts()
  const { balances, loading: balLoading } = useLatestBalances()
  const { holdings } = useHoldings()
  const { transactions } = useTransactions()
  const [allSnapshots, setAllSnapshots] = useState([])

  useEffect(() => {
    if (!idToken) return
    listSnapshots(idToken).then(data => setAllSnapshots(data || [])).catch(() => {})
  }, [idToken])

  const { total, byAccount } = useNetWorth(balances, accounts)
  const history = useNetWorthHistory(allSnapshots)
  const allocation = useAllocation(holdings, balances, accounts)

  const loading = accLoading || balLoading
  const hasData = accounts.length > 0 && balances.length > 0

  // First-run onboarding
  if (!loading && accounts.length === 0) {
    return (
      <PageContainer>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🍁</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to CanWealth</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Your free Canadian wealth tracker. Your data stays in your Google Drive.
          </p>
          <div className="max-w-sm mx-auto space-y-3">
            {[
              { step: 1, label: 'Add your accounts', desc: 'Wealthsimple, Tangerine, Computershare, Newton', action: () => navigate('/accounts') },
              { step: 2, label: 'Download CSV exports', desc: 'From each institution\'s website or app', action: null },
              { step: 3, label: 'Import your data', desc: 'Drag & drop CSV files to see your net worth', action: () => navigate('/import') },
            ].map(({ step, label, desc, action }) => (
              <div
                key={step}
                onClick={action}
                className={`flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left ${action ? 'cursor-pointer hover:border-primary-300 transition-colors' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                {action && <span className="ml-auto text-gray-400">›</span>}
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-4">
      <NetWorthCard total={total} history={history} loading={loading} />
      <AccountSummaryList byAccount={byAccount} />
      {allocation.length > 0 && <AllocationChart allocation={allocation} />}
      {transactions.length > 0 && <RecentTransactions transactions={transactions} />}

      {/* Import prompt if we have accounts but no recent data */}
      {!loading && accounts.length > 0 && balances.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-900 mb-1">No balance data yet</p>
          <p className="text-sm text-amber-700 mb-3">Import a CSV from any institution to see your net worth.</p>
          <Button size="sm" onClick={() => navigate('/import')}>Import CSV</Button>
        </div>
      )}
    </PageContainer>
  )
}
