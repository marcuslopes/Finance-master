export const ASSET_CLASSES = [
  { id: 'equity',       label: 'Equities',      color: '#0d9488', bgColor: '#ccfbf1' },
  { id: 'fixed_income', label: 'Fixed Income',  color: '#2563eb', bgColor: '#dbeafe' },
  { id: 'crypto',       label: 'Crypto',        color: '#7c3aed', bgColor: '#ede9fe' },
  { id: 'cash',         label: 'Cash',          color: '#16a34a', bgColor: '#dcfce7' },
  { id: 'reit',         label: 'REITs',         color: '#ea580c', bgColor: '#ffedd5' },
  { id: 'other',        label: 'Other',         color: '#6b7280', bgColor: '#f3f4f6' },
]

export const ASSET_CLASS_MAP = ASSET_CLASSES.reduce((m, a) => ({ ...m, [a.id]: a }), {})
