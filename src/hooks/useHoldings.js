import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { listHoldings, updateHoldingPrice } from '../api/holdings'

export function useHoldings(accountId) {
  const { idToken } = useAuth()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!idToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await listHoldings(idToken, accountId)
      setHoldings(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [idToken, accountId])

  useEffect(() => { fetch() }, [fetch])

  const updatePrice = useCallback(async (holdingId, priceCad) => {
    await updateHoldingPrice(idToken, holdingId, priceCad)
    await fetch()
  }, [idToken, fetch])

  return { holdings, loading, error, refetch: fetch, updatePrice }
}
