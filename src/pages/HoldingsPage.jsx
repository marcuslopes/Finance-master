import { useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import { LoadingScreen } from '../components/ui/Spinner'
import { formatCAD } from '../utils/currency'
import { useHoldings } from '../hooks/useHoldings'
import { ASSET_CLASS_MAP } from '../constants/assetClasses'

export default function HoldingsPage() {
  const { holdings, loading, updatePrice } = useHoldings()
  const [priceModal, setPriceModal] = useState(null) // { holding }
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSavePrice() {
    if (!newPrice || isNaN(parseFloat(newPrice))) return
    setSaving(true)
    try {
      await updatePrice(priceModal.holding_id, parseFloat(newPrice))
      setPriceModal(null)
      setNewPrice('')
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (holdings.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon="📈"
          title="No holdings yet"
          description="Import investment transactions to see your portfolio here."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <p className="text-sm text-gray-500 mb-4">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</p>

      <Card className="divide-y divide-gray-100 overflow-hidden">
        {holdings.map((h, i) => {
          const qty = parseFloat(h.quantity) || 0
          const avgCost = parseFloat(h.average_cost) || 0
          const totalCost = qty * avgCost
          const assetMeta = ASSET_CLASS_MAP[h.asset_class] || ASSET_CLASS_MAP.other

          return (
            <div key={h.holding_id || i} className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: assetMeta.bgColor, color: assetMeta.color }}
              >
                {h.ticker?.substring(0, 3) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{h.ticker || '—'}</p>
                <p className="text-xs text-gray-500 truncate">{h.name || assetMeta.label}</p>
                <p className="text-xs text-gray-400">{qty.toLocaleString()} units @ {formatCAD(avgCost)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 tabular-nums text-sm">{formatCAD(totalCost)}</p>
                <button
                  onClick={() => { setPriceModal(h); setNewPrice(String(avgCost)) }}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Update price
                </button>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Update price modal */}
      <Modal isOpen={!!priceModal} onClose={() => setPriceModal(null)} title={`Update Price — ${priceModal?.ticker}`} size="sm">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Enter the current market price in CAD to update the holding value.
          </p>
          <Input
            label="Current Price (CAD)"
            type="number"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            required
          />
          <div className="flex gap-3 pb-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPriceModal(null)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSavePrice}>Save</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
