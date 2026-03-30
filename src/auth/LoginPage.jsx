import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from './useAuth'
import { getOwner, setOwner } from '../api/settings'

export default function LoginPage() {
  const { login, idToken, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | checking | registering | error
  const [errorMsg, setErrorMsg] = useState('')

  // If already authenticated, handle first-run check
  useEffect(() => {
    if (isAuthenticated && idToken) {
      handlePostLogin(idToken)
    }
  }, [isAuthenticated, idToken])

  async function handlePostLogin(token) {
    setStatus('checking')
    try {
      const { initialized } = await getOwner(token)
      if (!initialized) {
        setStatus('registering')
        await setOwner(token)
      }
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setStatus('error')
      setErrorMsg(e.message || 'Could not connect to your data storage.')
    }
  }

  function handleSuccess(credentialResponse) {
    login(credentialResponse)
    // handlePostLogin fires via useEffect
  }

  function handleError() {
    setStatus('error')
    setErrorMsg('Google Sign-In failed. Please try again.')
  }

  const scriptUrlSet = !!import.meta.env.VITE_APPS_SCRIPT_URL
  const clientIdSet = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍁</div>
          <h1 className="text-2xl font-bold text-gray-900">CanWealth</h1>
          <p className="text-gray-500 text-sm mt-1">Your free Canadian wealth tracker</p>
        </div>

        {/* Setup warnings */}
        {(!scriptUrlSet || !clientIdSet) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
            <p className="font-medium mb-1">Setup required</p>
            {!clientIdSet && <p>• VITE_GOOGLE_CLIENT_ID not set</p>}
            {!scriptUrlSet && <p>• VITE_APPS_SCRIPT_URL not set</p>}
            <p className="mt-1 text-xs">See README for setup instructions.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {(status === 'checking' || status === 'registering') && (
          <div className="text-center py-4 text-gray-500 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2" />
            {status === 'registering' ? 'Setting up your data store…' : 'Connecting to your data…'}
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              shape="rectangular"
              theme="outline"
              size="large"
              text="signin_with"
              width="280"
            />
          </div>
        )}

        <div className="mt-8 space-y-2 text-xs text-gray-400 text-center">
          <p>Your financial data stays in <strong className="text-gray-600">your Google Drive</strong>.</p>
          <p>No passwords to banks or brokers are ever stored.</p>
        </div>
      </div>
    </div>
  )
}
