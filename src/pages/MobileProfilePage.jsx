import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  User,
  ShieldCheck,
  BookOpen,
  Car,
  Heart,
  MapPin,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
  LogOut,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

// ─── Menu item ────────────────────────────────────────────────────────────────
function MenuItem({ icon: Icon, label, to, onClick, color = '#A1A1AA', badge, danger }) {
  const cls = cn(
    'flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-[#1E1E1E]',
    danger ? 'text-red-400' : 'text-white',
  )
  const inner = (
    <>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: danger ? '#EF4444' : color }} />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
          {badge}
        </span>
      )}
      {!danger && <ChevronRight className="w-4 h-4 text-[#444]" />}
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cls, 'w-full text-left')}>
        {inner}
      </button>
    )
  }
  return (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  )
}

function MenuSection({ children, title }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden">
      {title && (
        <p className="text-[10px] text-[#555] font-bold uppercase tracking-widest px-4 pt-3 pb-1">
          {title}
        </p>
      )}
      <div className="divide-y divide-[#1E1E1E]">{children}</div>
    </div>
  )
}

// ─── MobileProfilePage ────────────────────────────────────────────────────────
export function MobileProfilePage() {
  const { user, profile, loading, signOut, isEmailVerified, favoriteIds = [] } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  if (!loading && !user) return <Navigate to="/login" replace />

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Cardom User'
  const email = user?.email || ''
  const location = profile?.location || ''

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
      <div className="min-h-dvh bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Profile</h1>
        <Link to="/account">
          <Settings className="w-5 h-5 text-[#A1A1AA]" />
        </Link>
      </div>

      <div className="flex-1 px-4 pt-5 space-y-4">
        {/* ── Avatar + Name Card ── */}
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-black shadow-[0_0_24px_rgba(249,115,22,0.35)]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {isEmailVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#111] flex items-center justify-center border border-[#1E1E1E]">
                <CheckCircle2 className="w-4 h-4 text-green-400 fill-green-400/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white truncate leading-tight">{displayName}</h2>
            </div>
            <p className="text-[#A1A1AA] text-xs mt-0.5 truncate">{email}</p>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                <span className="text-[11px] text-[#A1A1AA]">{location}</span>
              </div>
            )}
            {/* Verified badge */}
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 border border-green-500/25 text-green-400">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/25 text-amber-400">
                Unverified
              </span>
            )}
          </div>
        </div>

        {/* ── Account section ── */}
        <MenuSection title="Account">
          <MenuItem icon={User} label="My Profile" to="/account" color="#F97316" />
          <MenuItem icon={BookOpen} label="My Bookings" to="/bookings" color="#3B82F6" />
          <MenuItem icon={Car} label="My Listings" to="/my-listings" color="#22C55E" />
          <MenuItem icon={Heart} label="Favorites" to="/favorites" color="#EF4444" badge={favoriteIds.length} />
          <MenuItem icon={MapPin} label="Saved Addresses" to="/account" color="#A855F7" />
        </MenuSection>

        {/* ── Support section ── */}
        <MenuSection title="Support">
          <MenuItem icon={Bell} label="Notifications" to="/account" color="#F59E0B" />
          <MenuItem icon={HelpCircle} label="Help & Support" to="/contact" color="#06B6D4" />
          <MenuItem icon={Settings} label="Settings" to="/account" color="#A1A1AA" />
        </MenuSection>

        {/* ── Sign Out ── */}
        <MenuSection>
          <MenuItem
            icon={signingOut ? Loader2 : LogOut}
            label={signingOut ? 'Signing out...' : 'Sign Out'}
            onClick={handleSignOut}
            danger
          />
        </MenuSection>

        {/* Version */}
        <p className="text-center text-[10px] text-[#333] pb-2">
          Cardom v1.0.0
        </p>
      </div>
    </div>
  )
}
