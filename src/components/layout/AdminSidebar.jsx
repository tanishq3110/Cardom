import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  AlertOctagon,
  GitPullRequest,
  Users,
  Briefcase,
  Car,
  Layers,
  MapPin,
  CreditCard,
  Star,
  Globe,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export function AdminSidebar({ isCollapsed, onToggleCollapse, activeSosCount = 0 }) {
  const navSections = [
    {
      title: 'Operations Command',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Operations', path: '/live-rides', icon: Radio, highlight: true },
        {
          name: 'SOS & Safety',
          path: '/safety',
          icon: AlertOctagon,
          badge: activeSosCount > 0 ? activeSosCount : null,
          badgeVariant: 'danger',
        },
        { name: 'Smart Dispatch', path: '/dispatch', icon: GitPullRequest },
      ],
    },
    {
      title: 'Ecosystem Management',
      items: [
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Partners', path: '/partners', icon: Briefcase },
        { name: 'Marketplace Cars', path: '/cars', icon: Car },
        { name: 'Unified Leads', path: '/leads', icon: Layers },
        { name: 'Ride Operations', path: '/rides', icon: MapPin },
        { name: 'Payment Records', path: '/payments', icon: CreditCard },
        { name: 'Ratings & Reviews', path: '/reviews', icon: Star },
      ],
    },
    {
      title: 'Platform & Audits',
      items: [
        { name: 'Public Website', path: '/website', icon: Globe },
        { name: 'Notifications & Push', path: '/notifications', icon: Bell },
        { name: 'Business Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Admin Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        { name: 'Settings & Admins', path: '/settings', icon: Settings },
      ],
    },
  ]

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0E0E0E] border-r border-[#222222] transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#222222] flex items-center justify-between px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black text-lg shadow-md shadow-orange-500/20">
              C
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-wider flex items-center gap-2">
                CARDOM <span className="text-[10px] bg-orange-500/15 border border-orange-500/30 text-orange-400 px-1.5 py-0.5 rounded font-mono">ADMIN</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">Operations Center</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-orange-500 flex items-center justify-center font-black text-black text-lg">
            C
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1C1C1C] transition-colors ${
            isCollapsed ? 'mx-auto mt-2 hidden' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/10'
                          : 'text-zinc-400 hover:text-white hover:bg-[#1A1A1A]'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`} />
                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.name}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                              item.badgeVariant === 'danger'
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-[#2A2A2A] text-zinc-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer (when collapsed) */}
      {isCollapsed && (
        <div className="p-3 border-t border-[#222222] flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1C1C1C] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
