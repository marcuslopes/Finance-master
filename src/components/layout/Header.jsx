import { useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { LogOut } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/accounts':     'Accounts',
  '/import':       'Import CSV',
  '/transactions': 'Transactions',
  '/holdings':     'Holdings',
  '/settings':     'Settings',
}

export default function Header() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const title = PAGE_TITLES[pathname] || 'CanWealth'

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between h-14 flex-shrink-0">
      <h1 className="font-semibold text-gray-900 text-base">{title}</h1>

      <div className="flex items-center gap-2">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
