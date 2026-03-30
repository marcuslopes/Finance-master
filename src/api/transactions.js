import { appsScriptPost } from './appsScript'

export const importTransactions = (idToken, batchId, accountId, rows) =>
  appsScriptPost('importTransactions', { batch_id: batchId, account_id: accountId, rows }, idToken)

export const listTransactions = (idToken, filters = {}) =>
  appsScriptPost('listTransactions', { filters }, idToken)
