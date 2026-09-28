import { Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePartnerAuth } from '@/context/PartnerAuthContext'
import {
  LayoutDashboard, FileText, Wrench, User, Settings, LogOut
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/partner/dashboard' },
  { label: 'Leads', icon: FileText, path: '/partner/leads' },
  { label: 'Services', icon: Wrench, path: '/partner/services' },
  { label: 'Profile', icon: User, path: '/partner/profile' },
  { label: 'Settings', icon: Settings, path: '/partner/settings' },
]

export function PartnerHeader({ title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { partnerUser, partnerSignOut } = usePartnerAuth()
  const { pathname } = useLocation()
  const initials = partnerUser?.email?.[0]?.toUpperCase() || 'P'

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
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#202020] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
            </button>
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
            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                const active = pathname === path
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
              onClick={partnerSignOut}
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
