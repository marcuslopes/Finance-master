const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

if (!SCRIPT_URL) {
  console.warn('[CanWealth] VITE_APPS_SCRIPT_URL is not set. API calls will fail. Set it in .env.local')
}

/**
 * POST an action to the Apps Script Web App.
 * Always includes the Google ID token for server-side verification.
 */
export async function appsScriptPost(action, payload = {}, idToken) {
  if (!SCRIPT_URL) throw new Error('Apps Script URL not configured. Check Settings.')

  const body = JSON.stringify({ action, id_token: idToken, ...payload })

  let response
  try {
    response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for doPost
      // Note: Apps Script Web Apps deployed as "Only myself" require no CORS pre-flight
      // because we use text/plain (a simple request). This is intentional.
    })
  } catch (e) {
    throw new Error('Network error reaching Apps Script: ' + e.message)
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from Apps Script`)
  }

  let json
  try {
    json = await response.json()
  } catch (e) {
    throw new Error('Invalid JSON response from Apps Script')
  }

  if (!json.ok) {
    const status = json.status || 0
    if (status === 401 || json.error?.includes('Unauthorized')) {
      throw new AuthError(json.error || 'Unauthorized')
    }
    throw new Error(json.error || 'Apps Script error')
  }

  return json.data
}

/**
 * GET action (for simple read queries with params in URL).
 */
export async function appsScriptGet(action, idToken, extraParams = {}) {
  if (!SCRIPT_URL) throw new Error('Apps Script URL not configured. Check Settings.')

  const params = new URLSearchParams({ action, id_token: idToken, ...extraParams })
  const url = `${SCRIPT_URL}?${params}`

  let response
  try {
    response = await fetch(url)
  } catch (e) {
    throw new Error('Network error reaching Apps Script: ' + e.message)
  }

  let json
  try {
    json = await response.json()
  } catch (e) {
    throw new Error('Invalid JSON response from Apps Script')
  }

  if (!json.ok) {
    if (json.status === 401 || json.error?.includes('Unauthorized')) {
      throw new AuthError(json.error || 'Unauthorized')
    }
    throw new Error(json.error || 'Apps Script error')
  }

  return json.data
}

export class AuthError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthError'
  }
}
