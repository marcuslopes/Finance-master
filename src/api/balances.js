import { appsScriptPost } from './appsScript'

export const recordSnapshot = (idToken, accountId, date, balanceCad, balanceNative, source = 'manual') =>
  appsScriptPost('recordSnapshot', { account_id: accountId, date, balance_cad: balanceCad, balance_native: balanceNative, source }, idToken)

export const listSnapshots = (idToken, accountId) =>
  appsScriptPost('listSnapshots', { account_id: accountId }, idToken)

export const getLatestBalances = (idToken) =>
  appsScriptPost('getLatestBalances', {}, idToken)
