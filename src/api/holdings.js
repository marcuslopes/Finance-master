import { appsScriptPost } from './appsScript'

export const upsertHolding = (idToken, data) =>
  appsScriptPost('upsertHolding', { data }, idToken)

export const listHoldings = (idToken, accountId) =>
  appsScriptPost('listHoldings', { account_id: accountId }, idToken)

export const updateHoldingPrice = (idToken, holdingId, priceCad) =>
  appsScriptPost('updateHoldingPrice', { holding_id: holdingId, price_cad: priceCad }, idToken)
