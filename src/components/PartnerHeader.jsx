import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, X, LayoutDashboard, FileText, Navigation, Wrench, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', icon: FileText, path: '/leads' },
  { label: 'Rides', icon: Navigation, path: '/rides' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Services', icon: Wrench, path: '/services' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export function PartnerHeader({ title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, partnerProfile, signOut, unreadNotificationsCount = 0 } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const initials = partnerProfile?.business_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#111111]/95 backdrop-blur border-b border-[#2A2A2A] px-4 sm:px-6 py-3 lg:ml-60">
        <div className="flex items-center justify-between">
          {/* Mobile brand / page title */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#202020] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              {title && <h1 className="text-sm font-bold text-white">{title}</h1>}
              {subtitle && <p className="text-xs text-[#A1A1AA]">{subtitle}</p>}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#202020] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-orange-500 ring-2 ring-[#111111] flex items-center justify-center text-[9px] font-bold text-white px-1">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-black font-black text-xs">{initials}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute top-0 left-0 w-64 min-h-screen bg-[#181818] border-r border-[#2A2A2A] py-6 px-4 z-50">
            <div className="mb-8 px-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center">
                  <span className="text-black font-black text-xs">C</span>
                </div>
                <div>
                  <div className="text-white font-black text-sm tracking-wide leading-tight">CARDOM</div>
                  <div className="text-orange-400 font-bold text-[10px] tracking-widest uppercase leading-tight">PARTNER</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                const active = pathname === path || pathname === `/partner${path}`
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#202020] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all w-full mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}
    </>
  )
}
