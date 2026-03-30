// ─── ImportLog.gs ─────────────────────────────────────────────────────────────

function logImport(idToken, batchInfo) {
  requireAuth(idToken);

  var sheet = getSheet('import_log');
  sheet.appendRow([
    validateString(batchInfo.batch_id, 'batch_id', 50),
    validateString(batchInfo.account_id, 'account_id', 50),
    validateString(batchInfo.institution, 'institution', 50),
    validateString(batchInfo.filename, 'filename', 200),
    parseInt(batchInfo.row_count, 10) || 0,
    parseInt(batchInfo.imported_count, 10) || 0,
    parseInt(batchInfo.skipped_count, 10) || 0,
    nowISO(),
    ['success','partial','failed'].indexOf(batchInfo.status) !== -1 ? batchInfo.status : 'success',
    validateString(batchInfo.notes, 'notes', 500)
  ]);

  return { logged: true };
}

function listImportLog(idToken) {
  requireAuth(idToken);
  var rows = sheetToObjects('import_log');
  rows.sort(function(a, b) {
    return String(b['imported_at']).localeCompare(String(a['imported_at']));
  });
  return rows.slice(0, 100); // Last 100 imports
}
