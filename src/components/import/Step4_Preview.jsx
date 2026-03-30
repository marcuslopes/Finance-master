import { useState } from 'react'
import Button from '../ui/Button'
import { CategoryBadge } from '../ui/Badge'
import { formatCAD } from '../../utils/currency'
import { displayDate } from '../../utils/dates'
import { importTransactions } from '../../api/transactions'
import { logImport } from '../../api/settings'
import { useAuth } from '../../auth/useAuth'
import { uuid } from '../../utils/uuid'
import { AlertCircle } from 'lucide-react'

/**
 * Step4 receives `rows` as { normalized: [...], parseErrors: [...] }
 * from Step3 (already normalized).
 */
export default function Step4_Preview({ account, rows, filename, onConfirm, onBack }) {
  const { accessToken } = useAuth()
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  const normalizedRows = rows?.normalized || []
  const parseErrors = rows?.parseErrors || []
  const showRows = normalizedRows.slice(0, 50)

  async function handleImport() {
    setImporting(true)
    setError('')
    try {
      const batchId = 'batch_' + uuid().replace(/-/g, '').substring(0, 16)

      const result = await importTransactions(accessToken, batchId, account.account_id, normalizedRows)

      await logImport(accessToken, {
        batch_id: batchId,
        account_id: account.account_id,
        institution: account.institution,
        filename: filename || 'unknown.csv',
        row_count: normalizedRows.length,
        imported_count: result.imported || 0,
        skipped_count: result.skipped || 0,
        status: (result.errors?.length || 0) > 0 ? 'partial' : 'success',
        notes: result.errors?.map(e => `Row ${e.row}: ${e.error}`).join('; ') || '',
      })

      onConfirm({ ...result, batchId, filename })
    } catch (e) {
      setError(e.message)
      setImporting(false)
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-1">Preview</h2>
      <p className="text-sm text-gray-500 mb-4">
        {normalizedRows.length} rows ready · {parseErrors.length} parse errors
        {normalizedRows.length > 50 && ` · showing first 50`}
      </p>

      {parseErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-amber-600" />
            <p className="text-sm font-medium text-amber-800">{parseErrors.length} rows skipped (parse errors):</p>
          </div>
          {parseErrors.slice(0, 5).map(e => (
            <p key={e.row} className="text-xs text-amber-700 ml-5">Row {e.row}: {e.error}</p>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">{error}</div>
      )}

      {showRows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">Description</th>
                <th className="text-left px-3 py-2 font-medium">Category</th>
                <th className="text-right px-3 py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {showRows.map((row, i) => (
                <tr key={i} className="bg-white">
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{displayDate(row.date)}</td>
                  <td className="px-3 py-2 text-gray-900 max-w-[120px] truncate">{row.description || '—'}</td>
                  <td className="px-3 py-2"><CategoryBadge category={row.category} /></td>
                  <td className={`px-3 py-2 text-right tabular-nums font-medium ${parseFloat(row.amount) >= 0 ? 'text-green-700' : 'text-gray-900'}`}>
                    {formatCAD(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {normalizedRows.length === 0 && parseErrors.length === 0 && (
        <p className="text-center py-8 text-gray-500 text-sm">
          No rows to import. Go back and check your field mapping.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={importing}>Back</Button>
        <Button className="flex-1" loading={importing} disabled={normalizedRows.length === 0} onClick={handleImport}>
          Import {normalizedRows.length} rows
        </Button>
      </div>
    </div>
  )
}
