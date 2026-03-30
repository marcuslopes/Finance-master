import { readSheet, appendRows } from './sheets'
import { uuid } from '../utils/uuid'

export async function recordSnapshot(accessToken, accountId, date, balanceCad, balanceNative, source = 'manual') {
  await appendRows('balances', [{
    snapshot_id:     'bal_' + uuid().replace(/-/g, '').substring(0, 12),
    account_id:      accountId,
    date,
    balance_cad:     balanceCad,
    balance_native:  balanceNative ?? balanceCad,
    source:          ['csv_import','manual','calculated'].includes(source) ? source : 'manual',
    recorded_at:     new Date().toISOString(),
  }], accessToken)
  return { saved: true }
}

export async function listSnapshots(accessToken, accountId) {
  const rows = await readSheet('balances', accessToken)
  const filtered = accountId ? rows.filter(r => r.account_id === accountId) : rows
  return filtered.sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export async function getLatestBalances(accessToken) {
  const rows = await readSheet('balances', accessToken)
  const latest = {}
  rows.forEach(r => {
    const aid = r.account_id
    if (!latest[aid] || String(r.date) > String(latest[aid].date)) {
      latest[aid] = r
    }
  })
  return Object.values(latest)
}
