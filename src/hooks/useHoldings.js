import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { listHoldings, updateHoldingPrice } from '../api/holdings'

export function useHoldings(accountId) {
  const { accessToken } = useAuth()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await listHoldings(accessToken, accountId)
      setHoldings(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken, accountId])

  useEffect(() => { fetch() }, [fetch])

  const updatePrice = useCallback(async (holdingId, priceCad) => {
    await updateHoldingPrice(accessToken, holdingId, priceCad)
    await fetch()
  }, [accessToken, fetch])

  return { holdings, loading, error, refetch: fetch, updatePrice }
}
