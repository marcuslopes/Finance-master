import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export default function Step5_Result({ result, onImportAnother }) {
  const navigate = useNavigate()
  const { imported = 0, skipped = 0, errors = [], batchId, filename } = result || {}
  const hasErrors = errors.length > 0
  const success = imported > 0 || skipped > 0

  return (
    <div className="text-center py-4">
      <div className="mb-4">
        {success ? (
          <CheckCircle size={48} className="mx-auto text-green-500" />
        ) : (
          <AlertTriangle size={48} className="mx-auto text-amber-500" />
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-2">
        {success ? 'Import complete' : 'Nothing imported'}
      </h2>

      <div className="inline-flex gap-4 bg-gray-50 rounded-xl p-4 mb-4 text-sm">
        <div>
          <p className="text-2xl font-bold text-green-700 tabular-nums">{imported}</p>
          <p className="text-gray-500">imported</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-400 tabular-nums">{skipped}</p>
          <p className="text-gray-500">duplicates skipped</p>
        </div>
        {hasErrors && (
          <>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-red-500 tabular-nums">{errors.length}</p>
              <p className="text-gray-500">errors</p>
            </div>
          </>
        )}
      </div>

      {hasErrors && (
        <div className="bg-red-50 rounded-lg p-3 mb-4 text-left">
          <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
          {errors.slice(0, 5).map((e, i) => (
            <p key={i} className="text-xs text-red-600">Row {e.row}: {e.error}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {imported > 0 && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/transactions')}
          >
            View Transactions
          </Button>
        )}
        <Button className="flex-1" onClick={onImportAnother}>
          Import Another
        </Button>
      </div>
    </div>
  )
}
