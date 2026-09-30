import { Link, useLocation } from 'react-router-dom'
import { Home, Car, Wrench, CalendarCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Home',     to: '/',         icon: Home },
  { label: 'Cars',     to: '/cars',     icon: Car },
  { label: 'Services', to: '/service',  icon: Wrench },
  { label: 'Bookings', to: '/bookings', icon: CalendarCheck },
  { label: 'Profile',  to: '/account',  icon: User },
]

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { unreadInquiriesCount = 0 } = useAuth()

  // Hide on car detail page on mobile to let sticky Call/Inquire actions take bottom prominence
  const isCarDetail = pathname.startsWith('/cars/') && pathname.split('/').length > 2
  if (isCarDetail) return null

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/[0.08]',
        'shadow-[0_-4px_25px_rgba(0,0,0,0.7)]',
        'pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 px-2'
      )}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/'
              ? pathname === '/'
              : pathname.startsWith(item.to) || (item.to === '/account' && pathname === '/profile')

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[58px]',
                isActive
                  ? 'text-orange-500 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  )}
                />
                {/* Notification indicator for Profile/Bookings if any */}
                {item.label === 'Profile' && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0a0a0a]" />
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1 tracking-tight leading-none transition-all',
                isActive ? 'text-orange-400 font-bold' : 'text-zinc-400 font-medium'
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
