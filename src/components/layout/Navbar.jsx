import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronDown,
  Zap,
  Car,
  LogOut,
  User,
  Heart,
  MessageSquare,
  ArrowLeftRight,
  ArrowLeft,
  Plus,
  Bell,
  Search,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useComparison } from '@/context/ComparisonContext'
import { cn } from '@/lib/utils'

function getMobilePageTitle(pathname) {
  if (pathname === '/cars') return 'Marketplace'
  if (pathname.startsWith('/cars/')) return 'Vehicle Details'
  if (pathname === '/sell') return 'List Your Vehicle'
  if (pathname === '/my-listings') return 'My Listings'
  if (pathname.includes('/edit')) return 'Edit Listing'
  if (pathname === '/favorites') return 'Saved Vehicles'
  if (pathname === '/compare') return 'Compare Vehicles'
  if (pathname === '/service') return 'Services & Repairs'
  if (pathname === '/insurance') return 'Car Insurance'
  if (pathname === '/finance') return 'Auto Finance & EMI'
  if (pathname === '/subscription') return 'Car Subscription'
  if (pathname === '/roadside') return 'Roadside Assist'
  if (pathname === '/parts') return 'Spare Parts'
  if (pathname === '/bookings') return 'My Bookings'
  if (pathname === '/ride' || pathname === '/ride-booking') return 'Ride Booking'
  if (pathname === '/account' || pathname === '/profile') return 'My Account'
  if (pathname === '/my-inquiries') return 'Inquiries'
  if (pathname === '/about') return 'About Cardom'
  if (pathname === '/how-it-works') return 'How It Works'
  if (pathname === '/contact') return 'Help & Support'
  if (pathname === '/terms') return 'Terms of Service'
  if (pathname === '/privacy') return 'Privacy Policy'
  if (pathname === '/cookies') return 'Cookie Policy'
  if (pathname === '/login') return 'Sign In'
  if (pathname === '/signup') return 'Create Account'
  if (pathname === '/reset-password') return 'Reset Password'
  return 'Cardom'
}

// ─── Navigation config ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Buy', href: '/cars' },
  { label: 'Sell', href: '/sell' },
  {
    label: 'Services',
    href: '#',
    children: [
      { label: 'Insurance',         href: '/insurance', desc: 'Get instant car insurance' },
      { label: 'Finance',           href: '/finance', desc: 'Flexible auto loans' },
      { label: 'Service & Repair',  href: '/service', desc: 'Book verified service & repair' },
      { label: 'Detailing',         href: '#', desc: 'Professional car detailing' },
      { label: 'Roadside Assist',   href: '/roadside', desc: '24/7 emergency roadside support' },
    ],
  },
  { label: 'Spare Parts', href: '/parts' },
  { label: 'Subscriptions', href: '/subscription' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const dropdownVariants = {
  hidden:  { opacity: 0, y: 6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
  exit:    { opacity: 0, y: 6, scale: 0.97,
    transition: { duration: 0.12 },
  },
}

export function Navbar() {
  const { pathname } = useLocation()
  const { user, profile, loading: authLoading, signOut, unreadInquiriesCount = 0 } = useAuth()
  const { compareCount = 0 } = useComparison()
  const navigate = useNavigate()
  const [scrolled,       setScrolled]       = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [userMenuOpen,   setUserMenuOpen]   = useState(false)
  const closeTimer = useRef(null)
  const userMenuRef = useRef(null)

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Scroll detection — glass effect kicks in after 20px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Dropdown hover helpers with a short close delay (prevents flickering)
  const openDropdown  = (label) => {
    clearTimeout(closeTimer.current)
    setActiveDropdown(label)
  }
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 100)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_2px_24px_rgba(0,0,0,0.6)]'
          : 'bg-[#080808]/75 backdrop-blur-xl border-b border-white/[0.04]',
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Native Mobile App Header (lg:hidden) ── */}
        <div className="flex lg:hidden items-center justify-between h-14 w-full">
          {pathname === '/' ? (
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                  <Zap className="w-3.5 h-3.5 text-white fill-white" strokeWidth={0} />
                </div>
                <span className="text-white font-bold text-base tracking-tight">
                  Card<span className="text-orange-500">om</span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                {compareCount > 0 && (
                  <Link
                    to="/compare"
                    className="relative p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-orange-400"
                    aria-label="Compare"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {compareCount}
                    </span>
                  </Link>
                )}
                <Link
                  to="/account"
                  className="relative p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white"
                  aria-label="Profile"
                >
                  <User className="w-4 h-4" />
                  {unreadInquiriesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#080808]" />
                  )}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1)
                  } else {
                    navigate('/')
                  }
                }}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-95 transition-transform cursor-pointer"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[210px] text-center">
                {getMobilePageTitle(pathname)}
              </h1>

              <div className="flex items-center gap-1.5 min-w-[32px] justify-end">
                {pathname === '/cars' ? (
                  <Link
                    to="/compare"
                    className="relative w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300"
                    aria-label="Compare"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                    {compareCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {compareCount}
                      </span>
                    )}
                  </Link>
                ) : pathname === '/my-listings' ? (
                  <Link
                    to="/sell"
                    className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 active:scale-95"
                    aria-label="Add Listing"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/account"
                    className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white"
                    aria-label="Account"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop Navigation Bar (hidden lg:flex) ── */}
        <div className="hidden lg:flex items-center justify-between h-[70px]">

          {/* ── Logo ── */}
          <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center',
              'shadow-[0_0_14px_rgba(249,115,22,0.4)]',
              'group-hover:shadow-[0_0_22px_rgba(249,115,22,0.6)]',
              'transition-shadow duration-300',
            )}>
              <Zap className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight leading-none">
              Card<span className="text-orange-500">om</span>
            </span>
          </a>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && openDropdown(link.label)}
                onMouseLeave={() => link.children && closeDropdown()}
              >
                <a
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium',
                    'text-zinc-400 hover:text-white',
                    'hover:bg-white/[0.05] transition-all duration-200',
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform duration-200 opacity-60',
                        activeDropdown === link.label && 'rotate-180 opacity-100',
                      )}
                    />
                  )}
                </a>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className={cn(
                        'absolute top-[calc(100%+8px)] left-0 w-56 z-50',
                        'rounded-xl border border-white/[0.08]',
                        'bg-[#111111] shadow-2xl shadow-black/60',
                        'p-1.5',
                      )}
                      onMouseEnter={() => openDropdown(link.label)}
                      onMouseLeave={() => closeDropdown()}
                    >
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className={cn(
                            'flex flex-col px-3 py-2.5 rounded-lg',
                            'text-zinc-400 hover:text-white',
                            'hover:bg-white/[0.06] transition-colors duration-150',
                          )}
                        >
                          <span className="text-sm font-medium">{child.label}</span>
                          {child.desc && (
                            <span className="text-xs text-zinc-600 mt-0.5 group-hover:text-zinc-400">
                              {child.desc}
                            </span>
                          )}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ── Desktop Auth CTAs ── */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {authLoading ? (
              // Prevent flash while loading auth state
              <div className="w-20 h-8 rounded-lg bg-white/[0.04] animate-pulse" />
            ) : user ? (
              // ── Logged in — user menu ──
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    'text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200',
                    userMenuOpen && 'bg-white/[0.05] text-white',
                  )}
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    {unreadInquiriesCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#080808]" />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 opacity-50 transition-transform duration-200', userMenuOpen && 'rotate-180 opacity-100')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className={cn(
                        'absolute top-[calc(100%+8px)] right-0 w-52 z-50',
                        'rounded-xl border border-white/[0.08]',
                        'bg-[#111111] shadow-2xl shadow-black/60 p-1.5',
                      )}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {profile?.full_name || user.user_metadata?.full_name || 'Cardom Driver'}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
                          'text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors',
                        )}
                      >
                        <User className="w-4 h-4 text-orange-400" />
                        My Account
                      </Link>

                      <Link
                        to="/my-listings"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
                          'text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors',
                        )}
                      >
                        <Car className="w-4 h-4 text-orange-400" />
                        My Listings
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
                          'text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors',
                        )}
                      >
                        <Heart className="w-4 h-4 text-red-400" />
                        Saved Cars
                      </Link>

                      <Link
                        to="/compare"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                          'text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                          <span>Compare</span>
                        </div>
                        {compareCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold leading-none">
                            {compareCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/my-inquiries"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                          'text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-orange-400" />
                          <span>Inquiries</span>
                        </div>
                        {unreadInquiriesCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                            {unreadInquiriesCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false)
                          await signOut()
                          navigate('/')
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mt-0.5',
                          'text-zinc-400 hover:text-red-400 hover:bg-red-500/[0.05] transition-colors',
                        )}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // ── Logged out — login / signup ──
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className={cn(
                    'group relative inline-flex items-center gap-2 overflow-hidden',
                    'px-4 py-2 rounded-lg text-sm font-semibold',
                    'bg-orange-500 text-white',
                    'hover:bg-orange-600 transition-all duration-200',
                    'hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]',
                    'active:scale-[0.97]',
                  )}
                >
                  <span className={cn(
                    'pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg]',
                    'bg-gradient-to-r from-transparent via-white/20 to-transparent',
                    'group-hover:translate-x-full group-hover:transition-transform group-hover:duration-700',
                  )} />
                  <span className="relative z-10">Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

