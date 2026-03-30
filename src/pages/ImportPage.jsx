import { useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import ImportWizard from '../components/import/ImportWizard'
import EmptyState from '../components/ui/EmptyState'
import { useAccounts } from '../hooks/useAccounts'
import { LoadingScreen } from '../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'

export default function ImportPage() {
  const { accounts, loading } = useAccounts()
  const navigate = useNavigate()

  if (loading) return <LoadingScreen />

  if (accounts.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon="🏦"
          title="Add accounts first"
          description="You need at least one account before you can import transactions."
          actionLabel="Add Account"
          onAction={() => navigate('/accounts')}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <ImportWizard accounts={accounts} />
    </PageContainer>
  )
}
