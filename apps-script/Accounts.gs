// ─── Accounts.gs ─────────────────────────────────────────────────────────────

function listAccounts(idToken) {
  requireAuth(idToken);
  return sheetToObjects('accounts')
    .filter(function(r) { return r['is_active'] !== false && r['is_active'] !== 'FALSE'; })
    .sort(function(a, b) { return (a['display_order'] || 0) - (b['display_order'] || 0); });
}

function createAccount(idToken, data) {
  requireAuth(idToken);

  var accountId = 'acc_' + uuid().replace(/-/g, '').substring(0, 12);
  var institution = validateInstitution(data.institution);
  var accountName = validateString(data.account_name, 'account_name', 100);
  if (!accountName) throw new Error('account_name is required');
  var accountType = validateAccountType(data.account_type);
  var currency = validateCurrency(data.currency);
  var notes = validateString(data.notes, 'notes', 500);

  // Get current max display order
  var accounts = sheetToObjects('accounts');
  var maxOrder = accounts.reduce(function(m, r) {
    return Math.max(m, parseInt(r['display_order'] || 0, 10));
  }, 0);

  var sheet = getSheet('accounts');
  sheet.appendRow([
    accountId,
    institution,
    accountName,
    accountType,
    currency,
    true,
    maxOrder + 1,
    nowISO().substring(0, 10),
    notes
  ]);

  return { account_id: accountId };
}

function updateAccount(idToken, accountId, data) {
  requireAuth(idToken);

  var rowIdx = findRowIndex('accounts', 'account_id', accountId);
  if (rowIdx === -1) throw new Error('Account not found: ' + accountId);

  var sheet = getSheet('accounts');
  // Columns: A=account_id B=institution C=account_name D=account_type E=currency F=is_active G=display_order H=created_at I=notes
  if (data.account_name !== undefined) sheet.getRange(rowIdx, 3).setValue(validateString(data.account_name, 'account_name', 100));
  if (data.account_type !== undefined) sheet.getRange(rowIdx, 4).setValue(validateAccountType(data.account_type));
  if (data.currency !== undefined)     sheet.getRange(rowIdx, 5).setValue(validateCurrency(data.currency));
  if (data.notes !== undefined)        sheet.getRange(rowIdx, 9).setValue(validateString(data.notes, 'notes', 500));

  return { updated: true };
}

function deactivateAccount(idToken, accountId) {
  requireAuth(idToken);

  var rowIdx = findRowIndex('accounts', 'account_id', accountId);
  if (rowIdx === -1) throw new Error('Account not found: ' + accountId);

  getSheet('accounts').getRange(rowIdx, 6).setValue(false); // is_active = false
  return { deactivated: true };
}
