// ─── Code.gs ─────────────────────────────────────────────────────────────────
// Entry point for the Apps Script Web App.
// Deploy as: Execute as Me | Who has access: Only myself
//
// Setup instructions:
//   1. In Apps Script editor: Project Settings → Script Properties
//      Add: SHEET_ID = (your Google Sheet's ID from the URL)
//      Add: CLIENT_ID = (your Google OAuth Client ID from GCP Console)
//   2. Deploy as Web App, record the URL in your .env.local as VITE_APPS_SCRIPT_URL
//   3. Run setupSheets() once from the editor to create the 7 sheets

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  var idToken = e && e.parameter && e.parameter.id_token;

  try {
    if (action === 'health') {
      return ok({ status: 'ok', time: nowISO() });
    }
    if (action === 'getOwner') {
      return ok(getOwner(idToken));
    }
    return err('Unknown GET action: ' + action, 404);
  } catch (ex) {
    return err(ex.message, ex.message.indexOf('Unauthorized') !== -1 ? 401 : 400);
  }
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (ex) {
    return err('Invalid JSON body: ' + ex.message, 400);
  }

  var action = body.action;
  var idToken = body.id_token;

  try {
    switch (action) {

      // ── Settings ───────────────────────────────────────────────────────────
      case 'setOwner':
        return ok(setOwner(idToken));

      case 'getSettings':
        requireAuth(idToken);
        return ok(getAllSettings());

      case 'setSetting':
        requireAuth(idToken);
        setSetting(body.key, body.value);
        return ok({ saved: true });

      // ── Accounts ───────────────────────────────────────────────────────────
      case 'listAccounts':
        return ok(listAccounts(idToken));

      case 'createAccount':
        return ok(createAccount(idToken, body.data));

      case 'updateAccount':
        return ok(updateAccount(idToken, body.account_id, body.data));

      case 'deactivateAccount':
        return ok(deactivateAccount(idToken, body.account_id));

      // ── Transactions ───────────────────────────────────────────────────────
      case 'importTransactions':
        return ok(importTransactions(idToken, body.batch_id, body.account_id, body.rows));

      case 'listTransactions':
        return ok(listTransactions(idToken, body.filters));

      // ── Balances ───────────────────────────────────────────────────────────
      case 'recordSnapshot':
        return ok(recordSnapshot(idToken, body.account_id, body.date, body.balance_cad, body.balance_native, body.source));

      case 'listSnapshots':
        return ok(listSnapshots(idToken, body.account_id));

      case 'getLatestBalances':
        return ok(getLatestBalances(idToken));

      // ── Holdings ───────────────────────────────────────────────────────────
      case 'upsertHolding':
        return ok(upsertHolding(idToken, body.data));

      case 'listHoldings':
        return ok(listHoldings(idToken, body.account_id));

      case 'updateHoldingPrice':
        return ok(updateHoldingPrice(idToken, body.holding_id, body.price_cad));

      // ── Import Log ─────────────────────────────────────────────────────────
      case 'logImport':
        return ok(logImport(idToken, body.data));

      case 'listImportLog':
        return ok(listImportLog(idToken));

      // ── Setup (run once) ───────────────────────────────────────────────────
      case 'setupSheets':
        requireAuth(idToken);
        return ok({ message: setupSheets() });

      default:
        return err('Unknown action: ' + action, 404);
    }
  } catch (ex) {
    var isAuth = ex.message.indexOf('Unauthorized') !== -1 || ex.message.indexOf('Invalid id_token') !== -1 || ex.message.indexOf('expired') !== -1;
    return err(ex.message, isAuth ? 401 : 400);
  }
}
