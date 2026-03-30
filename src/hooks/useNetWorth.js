import { useMemo } from 'react'

/**
 * Compute current net worth from latest balance snapshots.
 * Returns: { total, byAccount, currency }
 */
export function useNetWorth(balances, accounts) {
  return useMemo(() => {
    if (!balances?.length || !accounts?.length) {
      return { total: 0, byAccount: [], currency: 'CAD' }
    }

    const accountMap = accounts.reduce((m, a) => ({ ...m, [a.account_id]: a }), {})

    const byAccount = balances
      .filter(b => accountMap[b.account_id])
      .map(b => ({
        ...b,
        account: accountMap[b.account_id],
        balance: parseFloat(b.balance_cad) || 0,
      }))
      .sort((a, b) => b.balance - a.balance)

    const total = byAccount.reduce((sum, b) => sum + b.balance, 0)

    return { total, byAccount, currency: 'CAD' }
  }, [balances, accounts])
}

/**
 * Build a net worth history array from all balance snapshots.
 * Groups snapshots by date, sums balance_cad across all accounts.
 */
export function useNetWorthHistory(allSnapshots) {
  return useMemo(() => {
    if (!allSnapshots?.length) return []

    // Group by date, sum all account balances
    const byDate = {}
    allSnapshots.forEach(s => {
      const date = String(s.date).substring(0, 10)
      byDate[date] = (byDate[date] || 0) + (parseFloat(s.balance_cad) || 0)
    })

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }))
  }, [allSnapshots])
}
