// ─── Auth.gs ─────────────────────────────────────────────────────────────────
// Google ID token verification.
// EVERY handler must call requireAuth(idToken) before touching the Sheet.

/**
 * Verify the Google ID token passed from the React PWA.
 * Uses Google's tokeninfo endpoint (counts against UrlFetch quota but is
 * reliable and requires no manual JWT key management).
 *
 * Returns { sub: string } on success.
 * Throws on failure.
 */
function verifyIdToken(idToken) {
  if (!idToken) throw new Error('Missing id_token');

  var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
  var response;
  try {
    response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  } catch (e) {
    throw new Error('Failed to reach Google tokeninfo: ' + e.message);
  }

  var code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Invalid id_token (tokeninfo returned ' + code + ')');
  }

  var payload;
  try {
    payload = JSON.parse(response.getContentText());
  } catch (e) {
    throw new Error('Malformed tokeninfo response');
  }

  // Verify token is intended for our app
  var expectedClientId = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('id_token audience mismatch');
  }

  // Token must not be expired (tokeninfo handles this but double-check)
  var exp = parseInt(payload.exp, 10);
  if (exp && exp < Math.floor(Date.now() / 1000)) {
    throw new Error('id_token has expired');
  }

  if (!payload.sub) throw new Error('id_token missing sub claim');

  return { sub: payload.sub, email: payload.email || '' };
}

/**
 * Verify the token AND confirm the caller is the registered owner.
 * For the setOwner action, only token verification is required (no owner check).
 * All other actions must call this.
 */
function requireAuth(idToken) {
  var identity = verifyIdToken(idToken);
  var ownerSub = getSettingValue('owner_google_sub');

  if (!ownerSub) {
    // Owner not yet registered — only setOwner is permitted, handled in Code.gs
    throw new Error('App not initialized. Call setOwner first.');
  }

  if (identity.sub !== ownerSub) {
    throw new Error('Unauthorized: this app belongs to a different Google account.');
  }

  return identity;
}
