// ─── Utils.gs ────────────────────────────────────────────────────────────────
// Shared helpers: UUID, validators, response builders.
// These have no side effects and can be tested in isolation.

/** Generate a v4-style UUID using Google's Utilities */
function uuid() {
  return Utilities.getUuid();
}

/** Current ISO datetime string in Toronto timezone */
function nowISO() {
  return new Date().toISOString();
}

/** Build a successful JSON response */
function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Build an error JSON response */
function err(message, code) {
  var status = code || 400;
  // Apps Script ContentService doesn't support HTTP status codes directly;
  // the client reads { ok: false, error: "..." } to detect errors.
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: message, status: status }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Input validators ────────────────────────────────────────────────────────

/** Validate and return a safe date string YYYY-MM-DD, or throw */
function validateDate(value, fieldName) {
  if (!value) throw new Error(fieldName + ' is required');
  var d = new Date(value);
  if (isNaN(d.getTime())) throw new Error(fieldName + ' is not a valid date: ' + value);
  return d.toISOString().substring(0, 10);
}

/** Parse and validate a number, or throw */
function validateNumber(value, fieldName) {
  var n = parseFloat(value);
  if (isNaN(n)) throw new Error(fieldName + ' must be a number, got: ' + value);
  return n;
}

/** Validate a string with optional max length */
function validateString(value, fieldName, maxLen) {
  if (value === null || value === undefined) return '';
  var s = String(value).trim();
  var limit = maxLen || 500;
  if (s.length > limit) s = s.substring(0, limit);
  return s;
}

/** Validate a boolean-ish value */
function validateBool(value) {
  if (value === true || value === 'TRUE' || value === 'true' || value === '1') return true;
  return false;
}

/** Validate ticker: alphanumeric + dots + hyphens, max 20 chars */
function validateTicker(value) {
  if (!value) return '';
  var t = String(value).trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(t)) return '';
  return t;
}

/** Validate institution enum */
var VALID_INSTITUTIONS = ['wealthsimple', 'tangerine', 'computershare', 'newton', 'manual'];
function validateInstitution(value) {
  var v = String(value || '').toLowerCase().trim();
  if (VALID_INSTITUTIONS.indexOf(v) === -1) throw new Error('Invalid institution: ' + value);
  return v;
}

/** Validate account type enum */
var VALID_ACCOUNT_TYPES = ['tfsa', 'rrsp', 'fhsa', 'cash', 'non-reg', 'crypto', 'chequing', 'savings', 'espp', 'other'];
function validateAccountType(value) {
  var v = String(value || '').toLowerCase().trim();
  if (VALID_ACCOUNT_TYPES.indexOf(v) === -1) throw new Error('Invalid account type: ' + value);
  return v;
}

/** Validate currency */
var VALID_CURRENCIES = ['CAD', 'USD'];
function validateCurrency(value) {
  var v = String(value || 'CAD').toUpperCase().trim();
  if (VALID_CURRENCIES.indexOf(v) === -1) return 'CAD';
  return v;
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────

var _ss = null;

/** Get (and cache) the Spreadsheet using SHEET_ID property */
function getSpreadsheet() {
  if (_ss) return _ss;
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('SHEET_ID script property not set. See setup instructions.');
  _ss = SpreadsheetApp.openById(id);
  return _ss;
}

/** Get a sheet by name, throw if missing */
function getSheet(name) {
  var sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found. Run setupSheets() first.');
  return sheet;
}

/** Read all data rows (skipping header row 1) as objects keyed by header */
function sheetToObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

/** Find the 1-based row index for a row where column matches value */
function findRowIndex(sheetName, colHeader, value) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = headers.indexOf(colHeader);
  if (col === -1) return -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(value)) return i + 1; // 1-based
  }
  return -1;
}

/** Create the 7 required sheets with header rows if they don't exist */
function setupSheets() {
  var ss = getSpreadsheet();
  var schemas = {
    'accounts':     ['account_id','institution','account_name','account_type','currency','is_active','display_order','created_at','notes'],
    'transactions': ['txn_id','account_id','date','description','category','amount','currency','quantity','price','ticker','institution_ref','import_batch_id','imported_at','notes'],
    'balances':     ['snapshot_id','account_id','date','balance_cad','balance_native','source','recorded_at'],
    'holdings':     ['holding_id','account_id','ticker','name','quantity','average_cost','asset_class','last_updated'],
    'prices':       ['price_id','ticker','date','price_cad','price_native','currency','source'],
    'import_log':   ['batch_id','account_id','institution','filename','row_count','imported_count','skipped_count','imported_at','status','notes'],
    'settings':     ['key','value','updated_at']
  };
  Object.keys(schemas).forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    var existing = sheet.getRange(1, 1, 1, schemas[name].length).getValues()[0];
    var hasHeader = existing[0] !== '';
    if (!hasHeader) {
      sheet.getRange(1, 1, 1, schemas[name].length).setValues([schemas[name]]);
      sheet.setFrozenRows(1);
    }
  });
  return 'Sheets set up successfully';
}
