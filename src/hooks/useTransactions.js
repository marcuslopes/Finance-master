import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { listTransactions } from '../api/transactions'

export function useTransactions(filters = {}) {
  const { idToken } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchKey = JSON.stringify(filters)

  const fetch = useCallback(async () => {
    if (!idToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await listTransactions(idToken, filters)
      setTransactions(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [idToken, fetchKey])

  useEffect(() => { fetch() }, [fetch])

  return { transactions, loading, error, refetch: fetch }
}
