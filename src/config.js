/**
 * Public app configuration.
 * These values are safe to commit — none of them are secrets.
 *
 * VITE_GOOGLE_CLIENT_ID: identifies your app to Google OAuth.
 * It's visible in the browser by design. Security comes from the
 * "Authorized JavaScript origins" restriction in Google Cloud Console.
 */

// If set via environment variable (CI/local override), use that.
// Otherwise fall back to the value hardcoded below.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com'
