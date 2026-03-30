import { createContext, useState, useCallback, useRef } from 'react'
import { googleLogout } from '@react-oauth/google'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(
    () => sessionStorage.getItem('cw_access_token') || null
  )
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('cw_user')
    return u ? JSON.parse(u) : null
  })
  const expiryTimerRef = useRef(null)

  const storeToken = useCallback((token, expiresIn, userInfo) => {
    setAccessTokenState(token)
    sessionStorage.setItem('cw_access_token', token)

    if (userInfo) {
      setUser(userInfo)
      sessionStorage.setItem('cw_user', JSON.stringify(userInfo))
    }

    // Auto-clear when token expires (add 30s buffer)
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    const ms = ((expiresIn || 3600) - 30) * 1000
    if (ms > 0) {
      expiryTimerRef.current = setTimeout(() => {
        setAccessTokenState(null)
        sessionStorage.removeItem('cw_access_token')
      }, ms)
    }
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    setAccessTokenState(null)
    setUser(null)
    sessionStorage.removeItem('cw_access_token')
    sessionStorage.removeItem('cw_user')
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
  }, [])

  return (
    <AuthContext.Provider value={{
      accessToken,
      user,
      storeToken,
      logout,
      isAuthenticated: !!accessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
