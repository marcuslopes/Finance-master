import { appsScriptGet, appsScriptPost } from './appsScript'

export const getOwner = (idToken) =>
  appsScriptGet('getOwner', idToken)

export const setOwner = (idToken) =>
  appsScriptPost('setOwner', {}, idToken)

export const getSettings = (idToken) =>
  appsScriptPost('getSettings', {}, idToken)

export const setSetting = (idToken, key, value) =>
  appsScriptPost('setSetting', { key, value }, idToken)

export const logImport = (idToken, data) =>
  appsScriptPost('logImport', { data }, idToken)
