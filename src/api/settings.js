import { readSheet, appendRows, updateCells, findRowNumber } from './sheets'

export async function getSettings(accessToken) {
  const rows = await readSheet('settings', accessToken)
  return rows.reduce((m, r) => ({ ...m, [r.key]: r.value }), {})
}

export async function setSetting(accessToken, key, value) {
  const rowNum = await findRowNumber('settings', 'key', key, accessToken)
  if (rowNum !== -1) {
    // Cols: key=1 value=2 updated_at=3
    await updateCells('settings', [
      { row: rowNum, col: 2, value },
      { row: rowNum, col: 3, value: new Date().toISOString() },
    ], accessToken)
  } else {
    await appendRows('settings', [{
      key,
      value,
      updated_at: new Date().toISOString(),
    }], accessToken)
  }
  return { saved: true }
}

export async function logImport(accessToken, data) {
  await appendRows('import_log', [{
    batch_id:       data.batch_id || '',
    account_id:     data.account_id || '',
    institution:    data.institution || '',
    filename:       data.filename || '',
    row_count:      data.row_count || 0,
    imported_count: data.imported_count || 0,
    skipped_count:  data.skipped_count || 0,
    imported_at:    new Date().toISOString(),
    status:         data.status || 'success',
    notes:          (data.notes || '').substring(0, 500),
  }], accessToken)
  return { logged: true }
}
