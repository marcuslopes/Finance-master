import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { getLatestBalances, listSnapshots, recordSnapshot } from '../api/balances'

export function useLatestBalances() {
  const { accessToken } = useAuth()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await getLatestBalances(accessToken)
      setBalances(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => { fetch() }, [fetch])

  return { balances, loading, error, refetch: fetch }
}

export function useSnapshots(accountId) {
  const { accessToken } = useAuth()
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    listSnapshots(accessToken, accountId)
      .then(data => setSnapshots(data || []))
      .catch(() => setSnapshots([]))
      .finally(() => setLoading(false))
  }, [accessToken, accountId])

  const saveSnapshot = useCallback(async (accId, date, balanceCad, balanceNative, source) => {
    const result = await recordSnapshot(accessToken, accId, date, balanceCad, balanceNative, source)
    const data = await listSnapshots(accessToken, accountId)
    setSnapshots(data || [])
    return result
  }, [accessToken, accountId])

  return { snapshots, loading, saveSnapshot }
}
