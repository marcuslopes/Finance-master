import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useAuth } from '../auth/useAuth'
import { getSettings, setSetting } from '../api/settings'
import { listAccounts } from '../api/accounts'
import { listTransactions } from '../api/transactions'
import { getLatestBalances } from '../api/balances'
import { listHoldings } from '../api/holdings'
import { getSheetId, setSheetId, validateSheetId, setupSheets } from '../api/sheets'
import { today } from '../utils/dates'
import { Download, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export default function SettingsPage() {
  const { accessToken, user, logout } = useAuth()
  const [settings, setSettings] = useState({})
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Sheet ID config
  const [sheetIdInput, setSheetIdInput] = useState(getSheetId)
  const [sheetStatus, setSheetStatus] = useState(null) // null | 'validating' | { ok, title } | 'error'
  const [sheetError, setSheetError] = useState('')
  const [settingUp, setSettingUp] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    getSettings(accessToken).then(s => setSettings(s || {})).catch(() => {})
  }, [accessToken])

  async function handleSaveSetting(key, value) {
    setSaving(true)
    try {
      await setSetting(accessToken, key, value)
      setSettings(s => ({ ...s, [key]: value }))
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleConnectSheet() {
    const id = sheetIdInput.trim()
    if (!id) return
    setSheetStatus('validating')
    setSheetError('')
    try {
      const result = await validateSheetId(id, accessToken)
      setSheetId(id)
      setSheetStatus(result)
    } catch (e) {
      setSheetStatus('error')
      setSheetError(e.message.includes('403') || e.message.includes('404')
        ? 'Sheet not found or you don\'t have access. Make sure it\'s in your Google Drive.'
        : e.message)
    }
  }

  async function handleSetupSheets() {
    setSettingUp(true)
    try {
      await setupSheets(accessToken)
      alert('Sheets created! Your CanWealth workbook is ready.')
    } catch (e) {
      alert('Setup error: ' + e.message)
    } finally {
      setSettingUp(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const [accounts, transactions, balances, holdings] = await Promise.all([
        listAccounts(accessToken),
        listTransactions(accessToken, {}),
        getLatestBalances(accessToken),
        listHoldings(accessToken),
      ])
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), accounts, transactions, balances, holdings }, null, 2)], { type: 'application/json' })
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

  const sheetIdSaved = getSheetId()

  return (
    <PageContainer className="space-y-4">
      {/* Account */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Account</p>
        {user && (
          <div className="flex items-center gap-3 mb-4">
            {user.picture && <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />}
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={logout}>Sign Out</Button>
      </Card>

      {/* Google Sheet connection */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-1">Google Sheet</p>
        <p className="text-sm text-gray-500 mb-3">
          Create a blank Google Sheet, then paste its ID here (the long string in the URL between /d/ and /edit).
        </p>

        {sheetIdSaved && (
          <div className="flex items-center gap-2 mb-3 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            <CheckCircle size={15} />
            <span>Connected — Sheet ID saved</span>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            value={sheetIdInput}
            onChange={e => setSheetIdInput(e.target.value)}
            error={sheetStatus === 'error' ? sheetError : ''}
          />
          <Button
            size="md"
            loading={sheetStatus === 'validating'}
            onClick={handleConnectSheet}
            disabled={!sheetIdInput.trim()}
          >
            Connect
          </Button>
        </div>

        {sheetStatus?.ok && (
          <p className="text-sm text-green-700 mt-2">✓ Connected to "{sheetStatus.title}"</p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Once connected, create the required sheets:</p>
          <Button variant="secondary" size="sm" loading={settingUp} onClick={handleSetupSheets} disabled={!sheetIdSaved}>
            Create sheets (run once)
          </Button>
        </div>
      </Card>

      {/* Display */}
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

      {/* Data */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-3">Data</p>
        <p className="text-xs text-gray-500 mb-3">
          Download all your data as JSON. Fetched directly from your Google Sheet.
        </p>
        <Button variant="secondary" size="sm" loading={exporting} onClick={handleExport}>
          <Download size={15} />
          Export as JSON
        </Button>
      </Card>

      {/* About */}
      <Card className="p-4">
        <p className="font-medium text-gray-900 mb-2">About CanWealth</p>
        <p className="text-xs text-gray-500 mb-3">
          Free, open-source. Data lives in your Google Sheet — no servers, no subscription, no financial passwords.
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
