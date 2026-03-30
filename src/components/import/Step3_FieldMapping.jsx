import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { INSTITUTION_PRESETS, normalizeGeneric } from '../../utils/csvNormalizers'

const REQUIRED_FIELDS = ['date', 'amount']
const ALL_FIELDS = [
  { key: 'date',        label: 'Date',         required: true },
  { key: 'description', label: 'Description',  required: false },
  { key: 'amount',      label: 'Amount (CAD)', required: true },
  { key: 'ticker',      label: 'Ticker/Symbol', required: false },
  { key: 'quantity',    label: 'Quantity',     required: false },
  { key: 'price',       label: 'Price',        required: false },
]

export default function Step3_FieldMapping({ account, csvHeaders, csvRows, sampleRow, onConfirm, onBack }) {
  const preset = INSTITUTION_PRESETS[account.institution]
  const [mapping, setMapping] = useState(() => preset?.mapping || {})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (preset) { setMapping(preset.mapping); return }
    const headerLower = csvHeaders.map(h => h.toLowerCase())
    const auto = {}
    ALL_FIELDS.forEach(({ key }) => {
      const match = csvHeaders.find((h, i) => headerLower[i].includes(key))
      if (match) auto[key] = match
    })
    setMapping(auto)
  }, [account.institution, csvHeaders])

  function handleConfirm() {
    const errs = {}
    REQUIRED_FIELDS.forEach(f => { if (!mapping[f]) errs[f] = 'Required' })
    if (Object.keys(errs).length) { setErrors(errs); return }

    // Normalize all CSV rows right here
    const normalizer = preset?.normalizer || normalizeGeneric
    const normalized = []
    const parseErrors = []

    csvRows.forEach((row, i) => {
      try {
        const norm = normalizer(row, mapping)
        if (!norm.date) throw new Error('Could not parse date')
        normalized.push(norm)
      } catch (e) {
        parseErrors.push({ row: i + 1, error: e.message })
      }
    })

    onConfirm(mapping, { normalized, parseErrors })
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-1">Map CSV columns</h2>
      <p className="text-sm text-gray-500 mb-4">
        {preset
          ? `Pre-filled for ${account.account_name}. Verify and confirm.`
          : 'Match each field to a column in your CSV.'}
      </p>

      <div className="space-y-3 mb-4">
        {ALL_FIELDS.map(({ key, label, required }) => (
          <Select
            key={key}
            label={`${label}${required ? ' *' : ''}`}
            value={mapping[key] || ''}
            onChange={e => { setMapping(m => ({ ...m, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: '' })) }}
            error={errors[key]}
          >
            <option value="">— skip this field —</option>
            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
          </Select>
        ))}
      </div>

      {/* Sample preview */}
      {sampleRow && Object.keys(sampleRow).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">First data row:</p>
          <div className="space-y-1">
            {ALL_FIELDS.filter(f => mapping[f.key]).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-24 flex-shrink-0">{label}:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800 truncate max-w-[180px]">
                  {String(sampleRow[mapping[key]] ?? '—')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={handleConfirm} className="flex-1">Preview Import</Button>
      </div>
    </div>
  )
}
