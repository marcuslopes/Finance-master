import { readSheet, appendRows, updateCells, findRowNumber } from './sheets'
import { uuid } from '../utils/uuid'

export async function listHoldings(accessToken, accountId) {
  const rows = await readSheet('holdings', accessToken)
  const filtered = accountId ? rows.filter(r => r.account_id === accountId) : rows
  return filtered.filter(r => parseFloat(r.quantity) !== 0)
}

export async function upsertHolding(accessToken, data) {
  const rows = await readSheet('holdings', accessToken)
  // Find existing holding for this account + ticker
  const existing = rows.find(
    r => r.account_id === data.account_id && r.ticker === (data.ticker || '').toUpperCase()
  )

  if (existing) {
    const rowNum = await findRowNumber('holdings', 'holding_id', existing.holding_id, accessToken)
    if (rowNum !== -1) {
      // Cols: holding_id=1 account_id=2 ticker=3 name=4 quantity=5 average_cost=6 asset_class=7 last_updated=8
      await updateCells('holdings', [
        { row: rowNum, col: 5, value: data.quantity },
        { row: rowNum, col: 6, value: data.average_cost ?? 0 },
        { row: rowNum, col: 8, value: new Date().toISOString().substring(0, 10) },
      ], accessToken)
      return { updated: true, holding_id: existing.holding_id }
    }
  }

  const holdingId = 'hld_' + uuid().replace(/-/g, '').substring(0, 12)
  await appendRows('holdings', [{
    holding_id:   holdingId,
    account_id:   data.account_id,
    ticker:       (data.ticker || '').toUpperCase(),
    name:         data.name || '',
    quantity:     data.quantity,
    average_cost: data.average_cost ?? 0,
    asset_class:  data.asset_class || 'other',
    last_updated: new Date().toISOString().substring(0, 10),
  }], accessToken)
  return { created: true, holding_id: holdingId }
}

export async function updateHoldingPrice(accessToken, holdingId, priceCad) {
  const rowNum = await findRowNumber('holdings', 'holding_id', holdingId, accessToken)
  if (rowNum === -1) throw new Error('Holding not found')
  // Update last_updated; also write to prices sheet
  await updateCells('holdings', [
    { row: rowNum, col: 8, value: new Date().toISOString().substring(0, 10) },
  ], accessToken)
  // Store in prices sheet for history
  await appendRows('prices', [{
    price_id:      'prc_' + uuid().replace(/-/g, '').substring(0, 12),
    ticker:        holdingId, // store by holding_id as key for simplicity
    date:          new Date().toISOString().substring(0, 10),
    price_cad:     priceCad,
    price_native:  priceCad,
    currency:      'CAD',
    source:        'manual',
  }], accessToken)
  return { updated: true }
}
