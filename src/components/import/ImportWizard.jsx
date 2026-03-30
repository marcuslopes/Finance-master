import { useState } from 'react'
import Step1_SelectAccount from './Step1_SelectAccount'
import Step2_UploadCSV from './Step2_UploadCSV'
import Step3_FieldMapping from './Step3_FieldMapping'
import Step4_Preview from './Step4_Preview'
import Step5_Result from './Step5_Result'

const STEPS = ['Account', 'Upload', 'Map Fields', 'Preview', 'Done']

export default function ImportWizard({ accounts }) {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState(null)
  const [csvRows, setCsvRows] = useState([])
  const [csvHeaders, setCsvHeaders] = useState([])
  const [filename, setFilename] = useState('')
  const [mapping, setMapping] = useState({})
  const [normalizedRows, setNormalizedRows] = useState([])
  const [result, setResult] = useState(null)

  function reset() {
    setStep(1)
    setAccount(null)
    setCsvRows([])
    setCsvHeaders([])
    setFilename('')
    setMapping({})
    setNormalizedRows([])
    setResult(null)
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center mb-6">
        {STEPS.map((label, i) => {
          const num = i + 1
          const active = num === step
          const done = num < step
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    done
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : active
                      ? 'border-primary-600 text-primary-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {done ? '✓' : num}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${active ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      {step === 1 && (
        <Step1_SelectAccount
          accounts={accounts}
          onSelect={(acc) => { setAccount(acc); setStep(2) }}
        />
      )}
      {step === 2 && (
        <Step2_UploadCSV
          account={account}
          onParsed={(rows, headers, fname) => { setCsvRows(rows); setCsvHeaders(headers); setFilename(fname); setStep(3) }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3_FieldMapping
          account={account}
          csvHeaders={csvHeaders}
          csvRows={csvRows}
          sampleRow={csvRows[0] || {}}
          onConfirm={(mappingResult, normResult) => { setMapping(mappingResult); setNormalizedRows(normResult); setStep(4) }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4_Preview
          account={account}
          rows={normalizedRows}
          filename={filename}
          onConfirm={(importResult) => { setResult(importResult); setStep(5) }}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <Step5_Result
          result={result}
          onImportAnother={reset}
        />
      )}
    </div>
  )
}
