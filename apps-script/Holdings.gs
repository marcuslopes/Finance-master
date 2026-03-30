// ─── Holdings.gs ─────────────────────────────────────────────────────────────

var VALID_ASSET_CLASSES = ['equity','fixed_income','crypto','cash','reit','other'];

function upsertHolding(idToken, data) {
  requireAuth(idToken);

  var accountId = validateString(data.account_id, 'account_id', 50);
  if (!accountId) throw new Error('account_id is required');

  var ticker = validateTicker(data.ticker);
  if (!ticker) throw new Error('ticker is required');

  var name = validateString(data.name, 'name', 200);
  var quantity = validateNumber(data.quantity, 'quantity');
  var averageCost = data.average_cost !== undefined ? validateNumber(data.average_cost, 'average_cost') : 0;
  var assetClass = VALID_ASSET_CLASSES.indexOf(data.asset_class) !== -1 ? data.asset_class : 'other';
  var today = nowISO().substring(0, 10);

  // Check if holding exists for this account+ticker
  var sheet = getSheet('holdings');
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var accountIdCol = headers.indexOf('account_id');
  var tickerCol = headers.indexOf('ticker');

  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][accountIdCol]) === accountId && String(allData[i][tickerCol]) === ticker) {
      // Update existing row
      // Cols: holding_id(A), account_id(B), ticker(C), name(D), quantity(E), average_cost(F), asset_class(G), last_updated(H)
      sheet.getRange(i + 1, 5).setValue(quantity);
      sheet.getRange(i + 1, 6).setValue(averageCost);
      sheet.getRange(i + 1, 8).setValue(today);
      if (name) sheet.getRange(i + 1, 4).setValue(name);
      return { updated: true, holding_id: allData[i][0] };
    }
  }

  // Insert new holding
  var holdingId = 'hld_' + uuid().replace(/-/g, '').substring(0, 12);
  sheet.appendRow([holdingId, accountId, ticker, name, quantity, averageCost, assetClass, today]);
  return { created: true, holding_id: holdingId };
}

function listHoldings(idToken, accountId) {
  requireAuth(idToken);

  var rows = sheetToObjects('holdings');
  if (accountId) {
    rows = rows.filter(function(r) { return r['account_id'] === accountId; });
  }
  return rows.filter(function(r) { return parseFloat(r['quantity'] || 0) !== 0; });
}

function updateHoldingPrice(idToken, holdingId, priceCAD) {
  requireAuth(idToken);

  var rowIdx = findRowIndex('holdings', 'holding_id', holdingId);
  if (rowIdx === -1) throw new Error('Holding not found: ' + holdingId);

  var safePrice = validateNumber(priceCAD, 'price_cad');

  // Also upsert into prices sheet
  var sheet = getSheet('holdings');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var ticker = data[rowIdx - 1][headers.indexOf('ticker')];

  upsertPrice_internal(ticker, nowISO().substring(0, 10), safePrice, 'CAD', 'manual');
  sheet.getRange(rowIdx, 8).setValue(nowISO().substring(0, 10));

  return { updated: true };
}

function upsertPrice_internal(ticker, date, priceCad, currency, source) {
  var sheet = getSheet('prices');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var tickerCol = headers.indexOf('ticker');
  var dateCol = headers.indexOf('date');

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tickerCol]) === ticker && String(data[i][dateCol]) === date) {
      sheet.getRange(i + 1, 4).setValue(priceCad); // price_cad
      return;
    }
  }
  var priceId = 'prc_' + uuid().replace(/-/g, '').substring(0, 12);
  sheet.appendRow([priceId, ticker, date, priceCad, priceCad, currency || 'CAD', source || 'manual']);
}
