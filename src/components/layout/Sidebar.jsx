import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, ArrowUpDown, Upload, Settings, Layers } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/accounts',     label: 'Accounts',     Icon: Building2 },
  { to: '/import',       label: 'Import CSV',   Icon: Upload },
  { to: '/transactions', label: 'Transactions', Icon: ArrowUpDown },
  { to: '/holdings',     label: 'Holdings',     Icon: Layers },
  { to: '/settings',     label: 'Settings',     Icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍁</span>
          <span className="font-bold text-gray-900 text-lg">CanWealth</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        Free & open source
      </div>
    </aside>
  )
}
