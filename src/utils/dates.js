import { format, parseISO, isValid, subDays, subMonths, subYears, startOfMonth, endOfMonth } from 'date-fns'

/** Parse a date string (YYYY-MM-DD or ISO) to a Date object */
export function parseDate(str) {
  if (!str) return null
  const d = typeof str === 'string' ? parseISO(str) : new Date(str)
  return isValid(d) ? d : null
}

/** Format a date to YYYY-MM-DD */
export function toISODate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : parseDate(date)
  if (!d) return ''
  return format(d, 'yyyy-MM-dd')
}

/** Format a date for display: Jan 15, 2026 */
export function displayDate(date) {
  const d = date instanceof Date ? date : parseDate(date)
  if (!d) return ''
  return format(d, 'MMM d, yyyy')
}

/** Format a date for chart x-axis: Jan 26 */
export function chartDate(date) {
  const d = date instanceof Date ? date : parseDate(date)
  if (!d) return ''
  return format(d, 'MMM d')
}

/** Format a date for month display: January 2026 */
export function displayMonth(date) {
  const d = date instanceof Date ? date : parseDate(date)
  if (!d) return ''
  return format(d, 'MMMM yyyy')
}

export { subDays, subMonths, subYears, startOfMonth, endOfMonth }

/** Get today as YYYY-MM-DD string */
export function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Get date N days ago as YYYY-MM-DD */
export function daysAgo(n) {
  return toISODate(subDays(new Date(), n))
}
