/**
 * Google Sheets API v4 client.
 * All calls use the user's OAuth2 access token directly — no server needed.
 */

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// ─── Sheet schemas (column order matters) ─────────────────────────────────────

export const SCHEMAS = {
  accounts:     ['account_id','institution','account_name','account_type','currency','is_active','display_order','created_at','notes'],
  transactions: ['txn_id','account_id','date','description','category','amount','currency','quantity','price','ticker','institution_ref','import_batch_id','imported_at','notes'],
  balances:     ['snapshot_id','account_id','date','balance_cad','balance_native','source','recorded_at'],
  holdings:     ['holding_id','account_id','ticker','name','quantity','average_cost','asset_class','last_updated'],
  prices:       ['price_id','ticker','date','price_cad','price_native','currency','source'],
  import_log:   ['batch_id','account_id','institution','filename','row_count','imported_count','skipped_count','imported_at','status','notes'],
  settings:     ['key','value','updated_at'],
}

// ─── localStorage key for spreadsheet ID ──────────────────────────────────────

export function getSheetId() {
  return localStorage.getItem('cw_sheet_id') || ''
}

export function setSheetId(id) {
  localStorage.setItem('cw_sheet_id', id.trim())
}

// ─── Core fetch helpers ────────────────────────────────────────────────────────

async function apiFetch(url, options, accessToken) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    const e = new Error('Your session has expired. Please sign in again.')
    e.name = 'AuthError'
    throw e
  }

  if (!res.ok) {
    let msg = `Sheets API error ${res.status}`
    try {
      const j = await res.json()
      msg = j?.error?.message || msg
    } catch (_) {}
    throw new Error(msg)
  }

  return res.json()
}

// ─── Read all rows from a sheet ────────────────────────────────────────────────

/**
 * Read all data rows from a sheet, returned as an array of plain objects.
 * Returns [] if the sheet exists but has only a header row.
 */
export async function readSheet(sheetName, accessToken) {
  const sheetId = getSheetId()
  if (!sheetId) throw new Error('Google Sheet ID not configured. Go to Settings to set it.')

  const range = encodeURIComponent(`${sheetName}!A:${colLetter(SCHEMAS[sheetName].length)}`)
  const url = `${BASE}/${sheetId}/values/${range}`

  let json
  try {
    json = await apiFetch(url, {}, accessToken)
  } catch (e) {
    // Sheet doesn't exist yet → run setup and retry once
    if (e.message.includes('Unable to parse range') || e.message.includes('400')) {
      await setupSheets(accessToken)
      json = await apiFetch(url, {}, accessToken)
    } else {
      throw e
    }
  }

  const rows = json.values || []
  if (rows.length <= 1) return []

  const headers = rows[0]
  return rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] ?? '' })
    return obj
  })
}

// ─── Append rows ───────────────────────────────────────────────────────────────

/**
 * Append one or more rows to a sheet.
 * `rows` is an array of objects keyed by schema column names.
 */
export async function appendRows(sheetName, rows, accessToken) {
  const sheetId = getSheetId()
  if (!sheetId) throw new Error('Google Sheet ID not configured.')

  const schema = SCHEMAS[sheetName]
  const values = rows.map(obj => schema.map(col => {
    const v = obj[col]
    return v === undefined || v === null ? '' : v
  }))

  const range = encodeURIComponent(`${sheetName}!A:A`)
  const url = `${BASE}/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ values }),
  }, accessToken)
}

// ─── Update a specific cell ────────────────────────────────────────────────────

/**
 * Update one or more cells in a specific row.
 * `updates` is an array of { row: 1-based row number, col: 1-based col number, value }.
 */
export async function updateCells(sheetName, updates, accessToken) {
  const sheetId = getSheetId()
  if (!sheetId) throw new Error('Google Sheet ID not configured.')

  const data = updates.map(({ row, col, value }) => ({
    range: `${sheetName}!${colLetter(col)}${row}`,
    values: [[value === undefined || value === null ? '' : value]],
  }))

  const url = `${BASE}/${sheetId}/values:batchUpdate`
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data }),
  }, accessToken)
}

// ─── Find a row index by key ────────────────────────────────────────────────────

/**
 * Read raw 2D data from a sheet and find the 1-based row number where
 * column `colName` equals `value`. Returns -1 if not found.
 * Row 1 is the header row, so data starts at row 2.
 */
export async function findRowNumber(sheetName, colName, value, accessToken) {
  const sheetId = getSheetId()
  if (!sheetId) throw new Error('Google Sheet ID not configured.')

  const schema = SCHEMAS[sheetName]
  const colIdx = schema.indexOf(colName)
  if (colIdx === -1) throw new Error(`Column ${colName} not in schema for ${sheetName}`)

  const range = encodeURIComponent(`${sheetName}!${colLetter(colIdx + 1)}:${colLetter(colIdx + 1)}`)
  const url = `${BASE}/${sheetId}/values/${range}`
  const json = await apiFetch(url, {}, accessToken)
  const col = json.values || []

  for (let i = 1; i < col.length; i++) { // i=0 is header
    if (String(col[i]?.[0] ?? '') === String(value)) return i + 1 // 1-based
  }
  return -1
}

// ─── Sheet setup ───────────────────────────────────────────────────────────────

/**
 * Ensure all 7 required sheets exist with correct headers.
 * Safe to call multiple times (idempotent).
 */
export async function setupSheets(accessToken) {
  const sheetId = getSheetId()
  if (!sheetId) throw new Error('Google Sheet ID not configured.')

  // Get existing sheet titles
  const meta = await apiFetch(`${BASE}/${sheetId}?fields=sheets.properties.title`, {}, accessToken)
  const existing = new Set((meta.sheets || []).map(s => s.properties.title))

  // Create missing sheets
  const toCreate = Object.keys(SCHEMAS).filter(name => !existing.has(name))
  if (toCreate.length > 0) {
    await apiFetch(`${BASE}/${sheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: toCreate.map(title => ({ addSheet: { properties: { title } } })),
      }),
    }, accessToken)
  }

  // Write headers to all sheets (idempotent — only writes if A1 is empty)
  const headerData = []
  for (const [name, cols] of Object.entries(SCHEMAS)) {
    headerData.push({
      range: `${name}!A1:${colLetter(cols.length)}1`,
      values: [cols],
    })
  }

  await apiFetch(`${BASE}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: headerData,
    }),
  }, accessToken)

  return true
}

/**
 * Validate a spreadsheet ID by trying to read its metadata.
 * Returns { valid: true, title } or throws.
 */
export async function validateSheetId(id, accessToken) {
  const meta = await apiFetch(
    `${BASE}/${id.trim()}?fields=properties.title`,
    {},
    accessToken
  )
  return { valid: true, title: meta.properties?.title || 'Untitled' }
}

// ─── Utility ───────────────────────────────────────────────────────────────────

/** Convert 1-based column number to letter (1→A, 26→Z, 27→AA) */
function colLetter(n) {
  let s = ''
  while (n > 0) {
    n--
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26)
  }
  return s
}
