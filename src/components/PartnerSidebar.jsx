import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Navigation, Wrench, User, Settings, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads',     icon: FileText,        path: '/leads' },
  { label: 'Rides',     icon: Navigation,      path: '/rides' },
  { label: 'Services',  icon: Wrench,          path: '/services' },
  { label: 'Profile',   icon: User,            path: '/profile' },
  { label: 'Settings',  icon: Settings,        path: '/settings' },
]

export function PartnerSidebar() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#181818] border-r border-[#2A2A2A] py-6 px-4 fixed top-0 left-0 z-30">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center">
            <span className="text-black font-black text-xs">C</span>
          </div>
          <div>
            <div className="text-white font-black text-sm tracking-wide leading-tight">CARDOM</div>
            <div className="text-orange-400 font-bold text-[10px] tracking-widest uppercase leading-tight">PARTNER</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = pathname === path || pathname === `/partner${path}` || pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#202020] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all w-full mt-4"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </aside>
  )
}
