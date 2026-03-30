// ─── Balances.gs ─────────────────────────────────────────────────────────────

function recordSnapshot(idToken, accountId, date, balanceCad, balanceNative, source) {
  requireAuth(idToken);

  var accounts = sheetToObjects('accounts');
  if (!accounts.find(function(a) { return a['account_id'] === accountId; })) {
    throw new Error('Account not found: ' + accountId);
  }

  var snapshotId = 'bal_' + uuid().replace(/-/g, '').substring(0, 12);
  var safeDate = validateDate(date, 'date');
  var safeCad = validateNumber(balanceCad, 'balance_cad');
  var safeNative = balanceNative !== undefined && balanceNative !== '' ? validateNumber(balanceNative, 'balance_native') : safeCad;
  var safeSource = ['csv_import','manual','calculated'].indexOf(source) !== -1 ? source : 'manual';

  getSheet('balances').appendRow([
    snapshotId,
    accountId,
    safeDate,
    safeCad,
    safeNative,
    safeSource,
    nowISO()
  ]);

  return { snapshot_id: snapshotId };
}

function listSnapshots(idToken, accountId) {
  requireAuth(idToken);

  var rows = sheetToObjects('balances');
  if (accountId) {
    rows = rows.filter(function(r) { return r['account_id'] === accountId; });
  }
  rows.sort(function(a, b) { return String(a['date']).localeCompare(String(b['date'])); });
  return rows;
}

/**
 * Get the latest balance snapshot per account.
 * Used by the dashboard to compute current net worth.
 */
function getLatestBalances(idToken) {
  requireAuth(idToken);

  var rows = sheetToObjects('balances');
  // Group by account_id, keep only the latest date
  var latest = {};
  rows.forEach(function(r) {
    var aid = r['account_id'];
    if (!latest[aid] || String(r['date']) > String(latest[aid]['date'])) {
      latest[aid] = r;
    }
  });
  return Object.values(latest);
}
