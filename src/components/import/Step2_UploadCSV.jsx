import { useRef, useState } from 'react'
import Papa from 'papaparse'
import Button from '../ui/Button'
import { INSTITUTIONS } from '../../constants/institutions'
import { Upload, FileText, AlertCircle } from 'lucide-react'

export default function Step2_UploadCSV({ account, onParsed, onBack }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')

  const inst = INSTITUTIONS[account.institution] || INSTITUTIONS.manual

  function parseFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file (.csv)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10 MB)')
      return
    }

    setParsing(true)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        setParsing(false)
        if (!results.data?.length) {
          setError('CSV appears empty or has no data rows.')
          return
        }
        const headers = results.meta.fields || []
        if (headers.length === 0) {
          setError('CSV has no headers. The first row must be a header row.')
          return
        }
        onParsed(results.data, headers, file.name)
      },
      error(err) {
        setParsing(false)
        setError('Could not parse CSV: ' + err.message)
      },
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) parseFile(file)
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-1">Upload CSV for {account.account_name}</h2>
      <p className="text-sm text-gray-500 mb-1">
        {inst.csvInstructions}
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Expected columns: {inst.csvColumns.join(', ') || 'varies'}
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => parseFile(e.target.files?.[0])}
        />
        {parsing ? (
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <div className="w-8 h-8 border-2 border-primary-400 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm">Parsing CSV…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={28} />
            <p className="text-sm font-medium text-gray-700">Tap to select CSV file</p>
            <p className="text-xs">or drag and drop here</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
      </div>
    </div>
  )
}
