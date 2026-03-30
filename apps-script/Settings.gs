// ─── Settings.gs ─────────────────────────────────────────────────────────────

/** Get a single setting value by key, or null if not found */
function getSettingValue(key) {
  var rows = sheetToObjects('settings');
  var row = rows.find(function(r) { return r['key'] === key; });
  return row ? row['value'] : null;
}

/** Get all settings as a plain object */
function getAllSettings() {
  var rows = sheetToObjects('settings');
  var result = {};
  rows.forEach(function(r) { result[r['key']] = r['value']; });
  return result;
}

/** Set a setting key-value pair (upsert) */
function setSetting(key, value) {
  var sheet = getSheet('settings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0]; // ['key','value','updated_at']

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 3).setValue(nowISO());
      return;
    }
  }
  // Not found — append
  sheet.appendRow([key, value, nowISO()]);
}

/** Register the owner's Google sub on first run */
function setOwner(idToken) {
  var identity = verifyIdToken(idToken);
  var existing = getSettingValue('owner_google_sub');
  if (existing) {
    throw new Error('Owner already registered. Clear the settings sheet to re-initialize.');
  }
  setSetting('owner_google_sub', identity.sub);
  setSetting('app_version', '0.1.0');
  setSetting('display_currency', 'CAD');
  setSetting('net_worth_start_date', new Date().toISOString().substring(0, 10));
  return { registered: true, email: identity.email };
}

/** Get owner sub (used by LoginPage to detect first run) */
function getOwner(idToken) {
  // Only verify the token — don't require ownership (this is the first-run check)
  verifyIdToken(idToken);
  var sub = getSettingValue('owner_google_sub');
  return { initialized: !!sub };
}
