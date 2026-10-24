import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Plus, CalendarCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { unreadInquiriesCount = 0, unreadNotificationsCount = 0 } = useAuth()

  // Hide on car detail page on mobile to let sticky Call/Inquire actions take bottom prominence
  const isCarDetail = pathname.startsWith('/cars/') && pathname.split('/').length > 2
  const isSplash = pathname === '/splash'
  if (isCarDetail || isSplash) return null

  const isHome = pathname === '/' || pathname === '/home'
  const isExplore = pathname.startsWith('/cars')
  const isSell = pathname.startsWith('/sell')
  const isBookings = pathname.startsWith('/bookings') || pathname.startsWith('/rides') || pathname.startsWith('/ride')
  const isProfile = pathname === '/mobile-profile' || pathname === '/account' || pathname === '/profile'

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 md:hidden',
        'bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/10',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.7)]',
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-all',
            isHome ? 'text-[#ff6a00] font-semibold' : 'text-[#c6c6c7] hover:text-[#e5e2e1]',
          )}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight">Home</span>
        </Link>

        {/* Explore */}
        <Link
          to="/cars"
          className={cn(
            'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-all',
            isExplore ? 'text-[#ff6a00] font-semibold' : 'text-[#c6c6c7] hover:text-[#e5e2e1]',
          )}
        >
          <Compass className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight">Explore</span>
        </Link>

        {/* Center Sell Action */}
        <Link
          to="/sell"
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-all group -mt-1"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md',
              isSell
                ? 'bg-[#ff6a00] text-black shadow-orange-500/30 ring-2 ring-[#ff6a00]/40'
                : 'bg-[#2a2a2a] border border-[#ff6a00]/40 text-[#ff6a00] group-hover:scale-105',
            )}
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span className="text-[11px] font-medium text-[#ff6a00] mt-0.5 tracking-tight">Sell</span>
        </Link>

        {/* Bookings & Rides */}
        <Link
          to="/bookings"
          className={cn(
            'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-all relative',
            isBookings ? 'text-[#ff6a00] font-semibold' : 'text-[#c6c6c7] hover:text-[#e5e2e1]',
          )}
        >
          <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight">Bookings</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute 1 top-1 right-2 min-w-[14px] h-3.5 rounded-full bg-[#ff6a00] text-black text-[9px] font-bold flex items-center justify-center px-0.5">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link
          to="/mobile-profile"
          className={cn(
            'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] transition-all relative',
            isProfile ? 'text-[#ff6a00] font-semibold' : 'text-[#c6c6c7] hover:text-[#e5e2e1]',
          )}
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight">Profile</span>
          {unreadInquiriesCount > 0 && (
            <span className="absolute 1 top-1 right-2 min-w-[14px] h-3.5 rounded-full bg-[#ff6a00] text-black text-[9px] font-bold flex items-center justify-center px-0.5">
              {unreadInquiriesCount > 9 ? '9+' : unreadInquiriesCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
