import { Link, useLocation } from 'react-router-dom'
import { Home, Car, Wrench, CalendarCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Home',     to: '/',               icon: Home },
  { label: 'Cars',     to: '/cars',           icon: Car },
  { label: 'Services', to: '/services',       icon: Wrench },
  { label: 'Bookings', to: '/bookings',       icon: CalendarCheck },
  { label: 'Profile',  to: '/mobile-profile', icon: User },
]

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { unreadInquiriesCount = 0, unreadNotificationsCount = 0 } = useAuth()

  // Hide on car detail page on mobile to let sticky Call/Inquire actions take bottom prominence
  const isCarDetail = pathname.startsWith('/cars/') && pathname.split('/').length > 2
  const isSplash = pathname === '/splash'
  if (isCarDetail || isSplash) return null

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-[#111111]/98 backdrop-blur-2xl border-t border-[#222]',
        'shadow-[0_-2px_20px_rgba(0,0,0,0.6)]',
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-1 pt-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/'
              ? pathname === '/' || pathname === '/home'
              : item.to === '/mobile-profile'
              ? pathname === '/mobile-profile' || pathname === '/account' || pathname === '/profile'
              : pathname.startsWith(item.to)

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[58px]',
                isActive ? 'text-orange-500' : 'text-[#555]',
              )}
            >
              {/* Active background highlight */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-orange-500/8" />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive ? 'stroke-[2.2]' : 'stroke-[1.7]',
                  )}
                />
                {/* Notification badge */}
                {item.label === 'Profile' && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-orange-500 ring-2 ring-[#111111] flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {unreadInquiriesCount > 9 ? '9+' : unreadInquiriesCount}
                  </span>
                )}
                {item.label === 'Bookings' && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-orange-500 ring-2 ring-[#111111] flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 leading-none font-semibold tracking-tight',
                  isActive ? 'text-orange-500' : 'text-[#666]',
                )}
              >
                {item.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-orange-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
