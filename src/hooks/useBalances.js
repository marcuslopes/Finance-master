import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { getLatestBalances, listSnapshots, recordSnapshot } from '../api/balances'

export function useLatestBalances() {
  const { idToken } = useAuth()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!idToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await getLatestBalances(idToken)
      setBalances(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [idToken])

  useEffect(() => { fetch() }, [fetch])

  return { balances, loading, error, refetch: fetch }
}

export function useSnapshots(accountId) {
  const { idToken } = useAuth()
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!idToken) return
    setLoading(true)
    listSnapshots(idToken, accountId)
      .then(data => setSnapshots(data || []))
      .catch(() => setSnapshots([]))
      .finally(() => setLoading(false))
  }, [idToken, accountId])

  const saveSnapshot = useCallback(async (accId, date, balanceCad, balanceNative, source) => {
    const result = await recordSnapshot(idToken, accId, date, balanceCad, balanceNative, source)
    const data = await listSnapshots(idToken, accountId)
    setSnapshots(data || [])
    return result
  }, [idToken, accountId])

  return { snapshots, loading, saveSnapshot }
}
