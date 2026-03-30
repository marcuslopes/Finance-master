import { appsScriptPost } from './appsScript'

export const listAccounts = (idToken) =>
  appsScriptPost('listAccounts', {}, idToken)

export const createAccount = (idToken, data) =>
  appsScriptPost('createAccount', { data }, idToken)

export const updateAccount = (idToken, accountId, data) =>
  appsScriptPost('updateAccount', { account_id: accountId, data }, idToken)

export const deactivateAccount = (idToken, accountId) =>
  appsScriptPost('deactivateAccount', { account_id: accountId }, idToken)
