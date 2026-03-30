import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import * as api from '../api/accounts'

export function useAccounts() {
  const { accessToken } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.listAccounts(accessToken)
      setAccounts(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const createAccount = useCallback(async (data) => {
    const result = await api.createAccount(accessToken, data)
    await fetchAccounts()
    return result
  }, [accessToken, fetchAccounts])

  const updateAccount = useCallback(async (accountId, data) => {
    const result = await api.updateAccount(accessToken, accountId, data)
    await fetchAccounts()
    return result
  }, [accessToken, fetchAccounts])

  const deactivateAccount = useCallback(async (accountId) => {
    const result = await api.deactivateAccount(accessToken, accountId)
    await fetchAccounts()
    return result
  }, [accessToken, fetchAccounts])

  return { accounts, loading, error, refetch: fetchAccounts, createAccount, updateAccount, deactivateAccount }
}
