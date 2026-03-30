import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { INSTITUTION_LIST } from '../../constants/institutions'
import { ACCOUNT_TYPES } from '../../constants/accountTypes'

export default function AddAccountModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    institution: 'wealthsimple',
    account_name: '',
    account_type: 'tfsa',
    currency: 'CAD',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.account_name.trim()) errs.account_name = 'Name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await onSave(form)
      setForm({ institution: 'wealthsimple', account_name: '', account_type: 'tfsa', currency: 'CAD', notes: '' })
      onClose()
    } catch (e) {
      setErrors({ general: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Account">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <Select label="Institution" required value={form.institution} onChange={e => set('institution', e.target.value)}>
          {INSTITUTION_LIST.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.emoji} {inst.name}</option>
          ))}
        </Select>

        <Input
          label="Account Name"
          required
          placeholder="e.g. Wealthsimple TFSA"
          value={form.account_name}
          onChange={e => set('account_name', e.target.value)}
          error={errors.account_name}
        />

        <Select label="Account Type" required value={form.account_type} onChange={e => set('account_type', e.target.value)}>
          {ACCOUNT_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.label} — {t.description}</option>
          ))}
        </Select>

        <Select label="Currency" value={form.currency} onChange={e => set('currency', e.target.value)}>
          <option value="CAD">CAD — Canadian Dollar</option>
          <option value="USD">USD — US Dollar</option>
        </Select>

        <Input
          label="Notes (optional)"
          placeholder="Any notes about this account"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />

        <div className="flex gap-3 pt-2 pb-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  )
}
