import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import * as api from '../api/accounts'

export function useAccounts() {
  const { idToken } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    if (!idToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.listAccounts(idToken)
      setAccounts(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [idToken])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const createAccount = useCallback(async (data) => {
    const result = await api.createAccount(idToken, data)
    await fetchAccounts()
    return result
  }, [idToken, fetchAccounts])

  const updateAccount = useCallback(async (accountId, data) => {
    const result = await api.updateAccount(idToken, accountId, data)
    await fetchAccounts()
    return result
  }, [idToken, fetchAccounts])

  const deactivateAccount = useCallback(async (accountId) => {
    const result = await api.deactivateAccount(idToken, accountId)
    await fetchAccounts()
    return result
  }, [idToken, fetchAccounts])

  return { accounts, loading, error, refetch: fetchAccounts, createAccount, updateAccount, deactivateAccount }
}
