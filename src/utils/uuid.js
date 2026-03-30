/** Generate a UUID using the browser's crypto API */
export function uuid() {
  return crypto.randomUUID()
}

/** Generate a short ID (12 hex chars) */
export function shortId() {
  return uuid().replace(/-/g, '').substring(0, 12)
}
