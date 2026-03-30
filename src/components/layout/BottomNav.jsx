import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, ArrowUpDown, Upload, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/accounts',     label: 'Accounts',     Icon: Building2 },
  { to: '/import',       label: 'Import',       Icon: Upload },
  { to: '/transactions', label: 'Transactions', Icon: ArrowUpDown },
  { to: '/settings',     label: 'Settings',     Icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-h-[56px] ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
