import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from './useAuth'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

export default function LoginPage() {
  const { isAuthenticated, storeToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: `${SHEETS_SCOPE} profile email`,
    onSuccess: async (tokenResponse) => {
      // Fetch user profile using the access token
      let userInfo = null
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (res.ok) userInfo = await res.json()
      } catch (_) {}

      storeToken(tokenResponse.access_token, tokenResponse.expires_in, userInfo
        ? { name: userInfo.name, email: userInfo.email, picture: userInfo.picture }
        : null
      )
    },
    onError: (err) => {
      console.error('Google login error', err)
    },
  })

  const clientIdSet = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍁</div>
          <h1 className="text-2xl font-bold text-gray-900">CanWealth</h1>
          <p className="text-gray-500 text-sm mt-1">Your free Canadian wealth tracker</p>
        </div>

        {!clientIdSet && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
            <p className="font-medium mb-1">Setup required</p>
            <p>VITE_GOOGLE_CLIENT_ID is not set. See README.</p>
          </div>
        )}

        <button
          onClick={() => login()}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="mt-8 space-y-2 text-xs text-gray-400 text-center">
          <p>Your data stays in <strong className="text-gray-600">your Google Sheet</strong>.</p>
          <p>No financial institution passwords stored.</p>
          <p className="text-primary-600">Grants access to Google Sheets only.</p>
        </div>
      </div>
    </div>
  )
}
