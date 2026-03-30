import { readSheet, appendRows } from './sheets'
import { uuid } from '../utils/uuid'

export async function importTransactions(accessToken, batchId, accountId, rows) {
  // Load existing institution_refs for this account (for dedup)
  const existing = await readSheet('transactions', accessToken)
  const existingRefs = new Set(
    existing
      .filter(t => t.account_id === accountId && t.institution_ref)
      .map(t => t.institution_ref)
  )

  const importedAt = new Date().toISOString()
  const toAppend = []
  let skipped = 0
  const errors = []

  rows.forEach((row, i) => {
    try {
      if (row.institution_ref && existingRefs.has(row.institution_ref)) {
        skipped++
        return
      }
      toAppend.push({
        txn_id:           'txn_' + uuid().replace(/-/g, '').substring(0, 16),
        account_id:       accountId,
        date:             row.date || '',
        description:      (row.description || '').substring(0, 500),
        category:         row.category || 'other',
        amount:           row.amount ?? 0,
        currency:         row.currency || 'CAD',
        quantity:         row.quantity ?? '',
        price:            row.price ?? '',
        ticker:           (row.ticker || '').toUpperCase().substring(0, 20),
        institution_ref:  (row.institution_ref || '').substring(0, 200),
        import_batch_id:  batchId,
        imported_at:      importedAt,
        notes:            (row.notes || '').substring(0, 500),
      })
      // Track within batch to prevent intra-batch duplicates
      if (row.institution_ref) existingRefs.add(row.institution_ref)
    } catch (e) {
      errors.push({ row: i + 1, error: e.message })
    }
  })

  if (toAppend.length > 0) {
    // Sheets API has a limit of ~2MB per request; batch in chunks of 500
    for (let i = 0; i < toAppend.length; i += 500) {
      await appendRows('transactions', toAppend.slice(i, i + 500), accessToken)
    }
  }

  return { imported: toAppend.length, skipped, errors }
}

export async function listTransactions(accessToken, filters = {}) {
  let rows = await readSheet('transactions', accessToken)

  if (filters.account_id) rows = rows.filter(t => t.account_id === filters.account_id)
  if (filters.start_date)  rows = rows.filter(t => String(t.date) >= filters.start_date)
  if (filters.end_date)    rows = rows.filter(t => String(t.date) <= filters.end_date)
  if (filters.category)    rows = rows.filter(t => t.category === filters.category)
  if (filters.import_batch_id) rows = rows.filter(t => t.import_batch_id === filters.import_batch_id)

  rows.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return rows.slice(0, 2000)
}
