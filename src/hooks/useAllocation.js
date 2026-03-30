import { useMemo } from 'react'
import { ASSET_CLASS_MAP } from '../constants/assetClasses'

/**
 * Compute asset allocation from holdings + balances.
 * Returns array of { name, value, color, pct }
 */
export function useAllocation(holdings, balances, accounts) {
  return useMemo(() => {
    const totals = {}

    // Add holdings by asset class
    holdings?.forEach(h => {
      const cls = h.asset_class || 'other'
      const qty = parseFloat(h.quantity) || 0
      const avgCost = parseFloat(h.average_cost) || 0
      const value = qty * avgCost
      totals[cls] = (totals[cls] || 0) + value
    })

    // Add cash balances from cash/savings/chequing accounts
    if (balances?.length && accounts?.length) {
      const accountMap = accounts.reduce((m, a) => ({ ...m, [a.account_id]: a }), {})
      const cashTypes = new Set(['cash', 'chequing', 'savings'])
      balances.forEach(b => {
        const acc = accountMap[b.account_id]
        if (acc && cashTypes.has(acc.account_type)) {
          totals['cash'] = (totals['cash'] || 0) + (parseFloat(b.balance_cad) || 0)
        }
      })
    }

    const grand = Object.values(totals).reduce((s, v) => s + v, 0)
    if (grand === 0) return []

    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([cls, value]) => {
        const meta = ASSET_CLASS_MAP[cls] || ASSET_CLASS_MAP.other
        return {
          name: meta.label,
          value,
          color: meta.color,
          bgColor: meta.bgColor,
          pct: (value / grand) * 100,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [holdings, balances, accounts])
}
