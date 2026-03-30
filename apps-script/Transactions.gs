// ─── Transactions.gs ─────────────────────────────────────────────────────────

var VALID_CATEGORIES = ['buy','sell','dividend','deposit','withdrawal','fee','transfer','interest','crypto_buy','crypto_sell','other'];

/**
 * Import a batch of normalized transactions.
 * Deduplicates on (account_id, institution_ref).
 * Returns { imported, skipped, errors[] }.
 */
function importTransactions(idToken, batchId, accountId, rows) {
  requireAuth(idToken);

  // Verify account exists
  var accounts = sheetToObjects('accounts');
  var account = accounts.find(function(a) { return a['account_id'] === accountId; });
  if (!account) throw new Error('Account not found: ' + accountId);

  // Build existing institution_ref set for this account (for dedup)
  var existing = sheetToObjects('transactions')
    .filter(function(t) { return t['account_id'] === accountId; })
    .reduce(function(set, t) {
      if (t['institution_ref']) set[t['institution_ref']] = true;
      return set;
    }, {});

  var sheet = getSheet('transactions');
  var imported = 0, skipped = 0;
  var errors = [];
  var importedAt = nowISO();

  rows.forEach(function(row, i) {
    try {
      var institutionRef = validateString(row.institution_ref, 'institution_ref', 200);
      if (institutionRef && existing[institutionRef]) {
        skipped++;
        return;
      }

      var txnId = 'txn_' + uuid().replace(/-/g, '').substring(0, 16);
      var date = validateDate(row.date, 'date');
      var description = validateString(row.description, 'description', 500);
      var category = row.category && VALID_CATEGORIES.indexOf(row.category) !== -1 ? row.category : 'other';
      var amount = validateNumber(row.amount, 'amount');
      var currency = validateCurrency(row.currency);
      var quantity = row.quantity ? validateNumber(row.quantity, 'quantity') : '';
      var price = row.price ? validateNumber(row.price, 'price') : '';
      var ticker = validateTicker(row.ticker);
      var notes = validateString(row.notes, 'notes', 500);

      sheet.appendRow([
        txnId,
        accountId,
        date,
        description,
        category,
        amount,
        currency,
        quantity,
        price,
        ticker,
        institutionRef,
        batchId,
        importedAt,
        notes
      ]);

      // Track for dedup within the same batch
      if (institutionRef) existing[institutionRef] = true;
      imported++;
    } catch (e) {
      errors.push({ row: i + 1, error: e.message });
    }
  });

  return { imported: imported, skipped: skipped, errors: errors };
}

function listTransactions(idToken, filters) {
  requireAuth(idToken);

  var txns = sheetToObjects('transactions');

  if (filters) {
    if (filters.account_id) {
      txns = txns.filter(function(t) { return t['account_id'] === filters.account_id; });
    }
    if (filters.start_date) {
      txns = txns.filter(function(t) { return String(t['date']) >= filters.start_date; });
    }
    if (filters.end_date) {
      txns = txns.filter(function(t) { return String(t['date']) <= filters.end_date; });
    }
    if (filters.category) {
      txns = txns.filter(function(t) { return t['category'] === filters.category; });
    }
    if (filters.import_batch_id) {
      txns = txns.filter(function(t) { return t['import_batch_id'] === filters.import_batch_id; });
    }
  }

  // Sort by date desc
  txns.sort(function(a, b) { return String(b['date']).localeCompare(String(a['date'])); });

  // Limit to 2000 rows max to stay within Apps Script response limits
  if (txns.length > 2000) txns = txns.slice(0, 2000);

  return txns;
}
