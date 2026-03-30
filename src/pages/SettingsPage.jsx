import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { useAuth } from '../auth/useAuth'
import { getSettings, setSetting } from '../api/settings'
import { listAccounts } from '../api/accounts'
import { listTransactions } from '../api/transactions'
import { getLatestBalances } from '../api/balances'
import { listHoldings } from '../api/holdings'
import { today } from '../utils/dates'
import { Download, ExternalLink, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const { idToken, user, logout } = useAuth()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!idToken) return
    getSettings(idToken)
      .then(s => setSettings(s || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [idToken])

  async function handleSaveSetting(key, value) {
    setSaving(true)
    try {
      await setSetting(idToken, key, value)
      setSettings(s => ({ ...s, [key]: value }))
    } catch (e) {
      alert('Error saving: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const [accounts, transactions, balances, holdings] = await Promise.all([
        listAccounts(idToken),
        listTransactions(idToken, {}),
        getLatestBalances(idToken),
        listHoldings(idToken),
      ])
      const data = {
        exported_at: new Date().toISOString(),
        accounts,
        transactions,
        balances,
        holdings,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `canwealth-export-${today()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <PageContainer className="space-y-4">
      {/* Account info */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Account</p>
        {user && (
          <div className="flex items-center gap-3 mb-4">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            )}
            <div>
              <p className="font-medium text-gray-900">{user.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={logout}>Sign Out</Button>
      </Card>

      {/* Display preferences */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Display</p>
        <Select
          label="Display Currency"
          value={settings.display_currency || 'CAD'}
          onChange={e => handleSaveSetting('display_currency', e.target.value)}
          disabled={saving}
        >
          <option value="CAD">CAD — Canadian Dollar</option>
          <option value="USD">USD — US Dollar</option>
        </Select>
      </Card>

      {/* Connection info */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Connection</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Google Client ID</span>
            <span className={`text-xs font-mono ${clientId ? 'text-green-700' : 'text-red-600'}`}>
              {clientId ? '✓ Set' : '✗ Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Apps Script URL</span>
            <span className={`text-xs font-mono ${scriptUrl ? 'text-green-700' : 'text-red-600'}`}>
              {scriptUrl ? '✓ Set' : '✗ Not set'}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          These are set in your <code>.env.local</code> file and baked in at build time.
          See the README to update them.
        </p>
      </Card>

      {/* Data management */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Data</p>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-700 mb-1">Export all data</p>
            <p className="text-xs text-gray-500 mb-2">
              Download all your accounts, transactions, balances, and holdings as a JSON file.
              Your data is fetched directly from your Google Sheet.
            </p>
            <Button variant="secondary" size="sm" loading={exporting} onClick={handleExport}>
              <Download size={15} />
              Export as JSON
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-2">About CanWealth</p>
        <p className="text-sm text-gray-500 mb-1">Version 0.1.0</p>
        <p className="text-xs text-gray-400 mb-3">
          Free, open-source Canadian wealth tracker. Your data lives in your own Google Sheet.
          No financial institution passwords are ever stored or transmitted.
        </p>
        <a
          href="https://github.com/marcuslopes/Finance-master"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
        >
          <ExternalLink size={14} />
          View source on GitHub
        </a>
      </Card>
    </PageContainer>
  )
}
