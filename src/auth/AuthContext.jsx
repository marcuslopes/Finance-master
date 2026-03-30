import { createContext, useState, useCallback, useRef } from 'react'
import { googleLogout } from '@react-oauth/google'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [idToken, setIdToken] = useState(() => sessionStorage.getItem('cw_token') || null)
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('cw_user')
    return u ? JSON.parse(u) : null
  })
  const tokenExpiryRef = useRef(null)

  const login = useCallback((credentialResponse) => {
    const token = credentialResponse.credential
    if (!token) return

    // Decode the JWT payload (no signature check — that's done server-side in Apps Script)
    const parts = token.split('.')
    if (parts.length !== 3) return
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    const userInfo = {
      sub: payload.sub,
      name: payload.name || '',
      email: payload.email || '',
      picture: payload.picture || '',
    }

    setIdToken(token)
    setUser(userInfo)
    sessionStorage.setItem('cw_token', token)
    sessionStorage.setItem('cw_user', JSON.stringify(userInfo))

    // Auto-logout when token expires (Google tokens live 1 hour)
    if (tokenExpiryRef.current) clearTimeout(tokenExpiryRef.current)
    const expiresIn = (payload.exp * 1000 - Date.now()) - 30_000 // 30s buffer
    if (expiresIn > 0) {
      tokenExpiryRef.current = setTimeout(() => logout(), expiresIn)
    }
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    setIdToken(null)
    setUser(null)
    sessionStorage.removeItem('cw_token')
    sessionStorage.removeItem('cw_user')
    if (tokenExpiryRef.current) clearTimeout(tokenExpiryRef.current)
  }, [])

  return (
    <AuthContext.Provider value={{ idToken, user, login, logout, isAuthenticated: !!idToken }}>
      {children}
    </AuthContext.Provider>
  )
}
