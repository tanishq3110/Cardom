import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function MobileProfilePage() {
  const { user, profile, loading, signOut, isEmailVerified, favoriteIds = [] } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  if (!loading && !user) return <Navigate to="/login" replace />

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Cardom Member'
  const email = user?.email || 'user@cardom.in'
  const phone = profile?.phone || user?.phone || '+91 98765 43210'
  const location = profile?.location || 'Amritsar, PB'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#131313] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#ff6a00] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#131313] text-[#e5e2e1] flex flex-col pb-28 selection:bg-[#ff6a00] selection:text-black">
      {/* ── Fixed Top Header ── */}
      <header className="sticky top-0 z-40 bg-[#131313]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-safe">
        <div className="h-16 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-white tracking-tight">
              Account & Profile
            </span>
          </div>
          <Link
            to="/account"
            className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/5 flex items-center justify-center text-[#c6c6c7] hover:text-white transition-colors"
            title="Edit Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        </div>
      </header>

      {/* ── Main Scrollable Body ── */}
      <main className="max-w-lg mx-auto w-full px-4 pt-4 space-y-5">
        {/* ── Profile Header Hero Card ── */}
        <section className="relative overflow-hidden rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-xl">
          {/* Ambient telemetry glow */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ff6a00]/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-[#4ae176]/10 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col gap-4">
            {/* Avatar & Badges Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative group">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-[#2a2a2a] border border-white/10 shadow-md">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-[#ff6a00] to-amber-500 flex items-center justify-center text-black text-2xl font-black">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Edit Photo Button */}
                <Link
                  to="/account"
                  aria-label="Edit Profile"
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-[#ff6a00] text-black shadow-md active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">
                    photo_camera
                  </span>
                </Link>
              </div>

              {/* KYC & Membership */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ae176]/15 border border-[#4ae176]/30 px-3 py-1 text-[11px] font-bold text-[#4ae176]">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>{isEmailVerified ? 'KYC VERIFIED' : 'VERIFIED ID'}</span>
                </span>
                <div className="flex items-center gap-1.5 rounded-lg bg-[#2a2a2a] border border-white/5 px-2.5 py-1">
                  <span className="material-symbols-outlined text-[#ff6a00] text-[15px]">
                    stars
                  </span>
                  <span className="text-[11px] font-bold text-[#ff6a00] tracking-tight">
                    Cardom Elite Member
                  </span>
                </div>
              </div>
            </div>

            {/* Identity Info */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">{displayName}</h1>
                <Link
                  to="/account"
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a2a2a] text-[#c6c6c7] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>
              <div className="flex flex-col gap-1 text-xs text-[#c6c6c7] mt-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ff6a00]">call</span>
                  <span className="text-zinc-200">{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ff6a00]">mail</span>
                  <span className="text-[#c6c6c7] truncate">{email}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Stats Dashboard Grid ── */}
        <section>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {/* Stat 1: Saved */}
            <Link
              to="/favorites"
              className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 shadow-sm active:scale-[0.98] transition-transform hover:border-[#ff6a00]/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c6c6c7]">
                  Saved Cars
                </span>
                <span
                  className="material-symbols-outlined text-[#ff6a00] text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold text-white">
                  {favoriteIds.length || '4'}
                </span>
                <span className="text-[10px] text-[#4ae176] font-semibold">Active alerts</span>
              </div>
            </Link>

            {/* Stat 2: Inquiries */}
            <Link
              to="/bookings"
              className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 shadow-sm active:scale-[0.98] transition-transform hover:border-[#ff6a00]/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c6c6c7]">
                  Inquiries
                </span>
                <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                  calendar_month
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold text-white">2</span>
                <span className="text-[10px] text-[#c6c6c7]">1 test drive</span>
              </div>
            </Link>

            {/* Stat 3: My Garage */}
            <Link
              to="/my-listings"
              className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 shadow-sm active:scale-[0.98] transition-transform hover:border-[#ff6a00]/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c6c6c7]">
                  My Garage
                </span>
                <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                  directions_car
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold text-white">1</span>
                <span className="text-[10px] text-[#c6c6c7]">Live on sell</span>
              </div>
            </Link>

            {/* Stat 4: Rewards */}
            <div className="rounded-2xl bg-[#201f1f] border border-[#ff6a00]/30 p-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#ff6a00]">
                  Rewards
                </span>
                <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                  account_balance_wallet
                </span>
              </div>
              <div className="mt-1 flex flex-col">
                <span className="font-display text-lg font-bold text-white">₹15,000</span>
                <span className="text-[10px] text-[#4ae176] font-semibold flex items-center gap-0.5">
                  Cardom Cash
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Doorstep Inspection Status Banner ── */}
        <section>
          <div className="rounded-2xl bg-[#ff6a00]/10 border border-[#ff6a00]/25 p-3.5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#ff6a00] text-black flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">car_repair</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">
                  Listing Doorstep Inspection
                </span>
                <span className="text-[11px] text-[#c6c6c7]">
                  Tomorrow, 11:00 AM • Amritsar Studio
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-listings')}
              className="shrink-0 rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs text-white font-medium hover:bg-[#353534] transition-colors"
            >
              Details
            </button>
          </div>
        </section>

        {/* ── Section 1: My Garage & Activity ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#c6c6c7]">
              My Garage & Activity
            </h2>
            <span className="text-[11px] font-bold text-[#ff6a00]">4 Items</span>
          </div>

          <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 divide-y divide-white/5 overflow-hidden">
            <Link
              to="/my-listings"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] group-hover:bg-[#ff6a00]/15 flex items-center justify-center text-[#ff6a00] transition-colors">
                  <span className="material-symbols-outlined text-[22px]">sell</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">My Car Listings</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#ff6a00]/20 text-[9px] font-bold text-[#ff6a00]">
                      1 Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    View, manage & edit your published vehicle listings
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/bookings"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] group-hover:bg-[#4ae176]/15 flex items-center justify-center text-[#4ae176] transition-colors">
                  <span className="material-symbols-outlined text-[22px]">sports_score</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Inquiries & Test Drives</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#4ae176]/20 text-[9px] font-bold text-[#4ae176]">
                      SuperHub Slot
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Track confirmed showroom and doorstep appointments
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] group-hover:bg-[#ff6a00]/15 flex items-center justify-center text-white transition-colors">
                  <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white">Saved Cars & Price Alerts</span>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    {favoriteIds.length} tracked vehicles with real-time price drops
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/cars"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] group-hover:bg-[#ff6a00]/15 flex items-center justify-center text-[#c6c6c7] transition-colors">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white">Recently Viewed Vehicles</span>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Quickly revisit cars you recently inspected
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>
          </div>
        </section>

        {/* ── Section 2: Services & Financing ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#c6c6c7]">
              Services & Financing
            </h2>
            <span className="text-[11px] font-bold text-[#4ae176]">3 Active</span>
          </div>

          <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 divide-y divide-white/5 overflow-hidden">
            <Link
              to="/insurance"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-[#4ae176]">
                  <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Active Insurance Policy</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#201f1f] text-[9px] text-[#c6c6c7]">
                      Zero-Dep
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    HDFC ERGO Comprehensive • Active coverage
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/finance"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-[#ff6a00]">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Car Loan & Financing</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#ff6a00]/20 text-[9px] font-bold text-[#ff6a00]">
                      Pre-Approved
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Pre-approved credit line at 8.45% ROI
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/safety"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-[#4ae176]">
                  <span className="material-symbols-outlined text-[22px]">minor_crash</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Cardom Roadside Assist (RSA)</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#4ae176]/20 text-[9px] font-bold text-[#4ae176]">
                      24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Pan-India emergency SOS & towing support
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>
          </div>
        </section>

        {/* ── Section 3: Preferences & Support ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#c6c6c7]">
              Preferences & Support
            </h2>
          </div>

          <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 divide-y divide-white/5 overflow-hidden">
            <Link
              to="/notifications"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[22px]">tune</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white">Notification Preferences</span>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    WhatsApp alerts, SMS & push channels
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/account"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[22px]">shield</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white">Privacy & Account Security</span>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Change password & session authorization
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>

            <Link
              to="/contact"
              className="flex items-center justify-between p-3.5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] flex items-center justify-center text-[#ff6a00]">
                  <span className="material-symbols-outlined text-[22px]">support_agent</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white">24x7 Customer Concierge</span>
                  <p className="text-[11px] text-[#c6c6c7] truncate mt-0.5">
                    Instant WhatsApp support & toll-free care
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#c6c6c7] group-hover:text-white text-[18px]">
                chevron_right
              </span>
            </Link>
          </div>
        </section>

        {/* ── Sign Out Trigger ── */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#201f1f] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 py-3.5 px-4 text-rose-400 font-bold text-xs transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out of Cardom</span>
          </button>
          <p className="mt-3 text-center text-[10px] text-zinc-600 font-mono">
            Cardom Automotive Platform • Version 4.18.2
          </p>
        </section>
      </main>

      {/* ── Logout Confirmation Dialog ── */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">logout</span>
            </div>
            <div className="text-center">
              <h3 className="font-display text-base font-bold text-white">
                Sign Out of {displayName}?
              </h3>
              <p className="text-xs text-[#c6c6c7] mt-1 leading-relaxed">
                Are you sure you want to log out of your session? You can sign back in anytime.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-xs font-bold text-white transition-colors"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1"
              >
                {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
