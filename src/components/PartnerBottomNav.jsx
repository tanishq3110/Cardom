import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Navigation, Wrench, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads',     icon: FileText,        path: '/leads' },
  { label: 'Rides',     icon: Navigation,      path: '/rides' },
  { label: 'Services',  icon: Wrench,          path: '/services' },
  { label: 'Profile',   icon: User,            path: '/profile' },
]

export function PartnerBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#181818] border-t border-[#2A2A2A] flex items-center">
      {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
        const active = pathname === path || pathname === `/partner${path}` || pathname.startsWith(path + '/')
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[10px] font-semibold tracking-wide transition-colors relative ${
              active ? 'text-orange-400' : 'text-[#A1A1AA]'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : 'text-[#A1A1AA]'}`} />
            {label}
            {active && <span className="absolute top-0 w-6 h-0.5 bg-orange-500 rounded-b-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
