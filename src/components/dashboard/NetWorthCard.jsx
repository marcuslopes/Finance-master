import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCAD, formatDelta } from '../../utils/currency'
import { chartDate } from '../../utils/dates'
import { Skeleton } from '../ui/Spinner'

export default function NetWorthCard({ total, history, loading }) {
  const [expanded, setExpanded] = useState(false)

  // Compute delta vs 30 days ago
  const delta = (() => {
    if (!history?.length || history.length < 2) return null
    const latest = history[history.length - 1]?.total || 0
    // Find closest snapshot ~30 days back
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const pastPoint = [...history]
      .filter(h => new Date(h.date) <= thirtyDaysAgo)
      .pop()
    if (!pastPoint) return null
    return latest - (pastPoint.total || 0)
  })()

  const chartData = history?.map(h => ({
    date: chartDate(h.date),
    total: parseFloat(h.total) || 0,
  })) || []

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
        <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
        <Skeleton className="h-10 w-40 bg-white/20 mb-1" />
        <Skeleton className="h-4 w-20 bg-white/20" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
      <p className="text-primary-100 text-sm font-medium mb-1">Total Net Worth</p>
      <p className="text-4xl font-bold tabular-nums tracking-tight mb-1">
        {formatCAD(total)}
      </p>

      {delta !== null && (
        <div className={`flex items-center gap-1 text-sm ${delta >= 0 ? 'text-green-200' : 'text-red-200'}`}>
          {delta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{formatDelta(delta)} vs 30 days ago</span>
        </div>
      )}

      {/* Toggle chart */}
      {chartData.length > 1 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 flex items-center gap-1 text-xs text-primary-200 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide chart' : 'Show history'}
        </button>
      )}

      {expanded && chartData.length > 1 && (
        <div className="mt-3 -mx-1">
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(255,255,255,0.3)" />
                  <stop offset="95%" stopColor="rgba(255,255,255,0.02)" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0f766e', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }}
                formatter={(v) => [formatCAD(v), 'Net Worth']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2}
                fill="url(#netWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
