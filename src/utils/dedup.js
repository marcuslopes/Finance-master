/**
 * Generate a dedup hash for a transaction row.
 * Uses the institution_ref (institution's own ID/description)
 * combined with the account ID to create a stable key.
 */
export async function hashRow(accountId, institutionRef) {
  if (!institutionRef) return null
  const data = `${accountId}::${institutionRef}`
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
}

/**
 * Build a dedup key from CSV row fields (used when institution_ref is not available).
 * Combines date + amount + description into a stable identifier.
 */
export function buildInstitutionRef(date, amount, description) {
  // Normalize: trim, lowercase, collapse whitespace
  const d = String(date || '').trim()
  const a = String(parseFloat(amount) || 0)
  const desc = String(description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return `${d}|${a}|${desc}`
}
