import { readSheet, appendRows, updateCells, findRowNumber } from './sheets'
import { uuid } from '../utils/uuid'

export async function listAccounts(accessToken) {
  const rows = await readSheet('accounts', accessToken)
  return rows
    .filter(r => r.is_active !== 'FALSE' && r.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
}

export async function createAccount(accessToken, data) {
  const existing = await readSheet('accounts', accessToken)
  const maxOrder = existing.reduce((m, r) => Math.max(m, Number(r.display_order) || 0), 0)
  const accountId = 'acc_' + uuid().replace(/-/g, '').substring(0, 12)

  await appendRows('accounts', [{
    account_id:    accountId,
    institution:   data.institution,
    account_name:  data.account_name,
    account_type:  data.account_type,
    currency:      data.currency || 'CAD',
    is_active:     'TRUE',
    display_order: maxOrder + 1,
    created_at:    new Date().toISOString().substring(0, 10),
    notes:         data.notes || '',
  }], accessToken)

  return { account_id: accountId }
}

export async function updateAccount(accessToken, accountId, data) {
  const rowNum = await findRowNumber('accounts', 'account_id', accountId, accessToken)
  if (rowNum === -1) throw new Error('Account not found: ' + accountId)

  // Col positions (1-based): account_id=1 institution=2 account_name=3 account_type=4 currency=5 is_active=6 display_order=7 created_at=8 notes=9
  const updates = []
  if (data.account_name !== undefined) updates.push({ row: rowNum, col: 3, value: data.account_name })
  if (data.account_type !== undefined) updates.push({ row: rowNum, col: 4, value: data.account_type })
  if (data.currency !== undefined)     updates.push({ row: rowNum, col: 5, value: data.currency })
  if (data.notes !== undefined)        updates.push({ row: rowNum, col: 9, value: data.notes })

  if (updates.length > 0) await updateCells('accounts', updates, accessToken)
  return { updated: true }
}

export async function deactivateAccount(accessToken, accountId) {
  const rowNum = await findRowNumber('accounts', 'account_id', accountId, accessToken)
  if (rowNum === -1) throw new Error('Account not found: ' + accountId)
  await updateCells('accounts', [{ row: rowNum, col: 6, value: 'FALSE' }], accessToken)
  return { deactivated: true }
}
