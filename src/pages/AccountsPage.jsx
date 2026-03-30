import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import AccountCard from '../components/accounts/AccountCard'
import AddAccountModal from '../components/accounts/AddAccountModal'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { LoadingScreen } from '../components/ui/Spinner'
import { useAccounts } from '../hooks/useAccounts'
import { useLatestBalances } from '../hooks/useBalances'

export default function AccountsPage() {
  const { accounts, loading, createAccount, deactivateAccount } = useAccounts()
  const { balances } = useLatestBalances()
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  const balanceMap = balances.reduce((m, b) => ({ ...m, [b.account_id]: b }), {})

  async function handleDeactivate(account) {
    if (!confirm(`Remove "${account.account_name}"? This won't delete your transactions.`)) return
    try {
      await deactivateAccount(account.account_id)
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={16} />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="No accounts yet"
          description="Add your financial accounts to start tracking your net worth."
          actionLabel="Add your first account"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.map(account => (
            <AccountCard
              key={account.account_id}
              account={account}
              latestBalance={balanceMap[account.account_id]}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Import prompt */}
      {accounts.length > 0 && balances.length === 0 && (
        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-900 mb-1">Next step: Import your data</p>
          <p className="text-sm text-primary-700 mb-3">
            Download a CSV from each institution and import it to see your balances.
          </p>
          <Button size="sm" onClick={() => navigate('/import')}>Go to Import</Button>
        </div>
      )}

      <AddAccountModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={createAccount}
      />
    </PageContainer>
  )
}
