import { useState, useEffect, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Car,
  Heart,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Eye,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { updateProfile } from '@/services/profileApi'
import { fetchMyListings, fetchCarsByIds } from '@/services/carsApi'
import { fetchSellerInquiryCounts } from '@/services/inquiriesApi'
import { fetchSellerAnalytics } from '@/services/carAnalyticsApi'
import { getRecentlyViewedIds } from '@/utils/recentlyViewed'
import { formatMetricCount } from '@/utils/dateUtils'
import { CarCard } from '@/components/CarCard'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { cn } from '@/lib/utils'

export function AccountPage() {
  const { user, profile, loading, refreshProfile, favoriteIds = [] } = useAuth()

  // Form State
  const [fullName, setFullName]     = useState('')
  const [phone, setPhone]           = useState('')
  const [location, setLocation]     = useState('')
  const [avatarUrl, setAvatarUrl]   = useState('')

  // UI Status State
  const [saving, setSaving]         = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError]           = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Sync state when profile or user loads
  useEffect(() => {
    if (profile || user) {
      const name = profile?.full_name || user?.user_metadata?.full_name || ''
      const ph   = profile?.phone || ''
      const loc  = profile?.location || ''
      const av   = profile?.avatar_url || ''

      setFullName(name)
      setPhone(ph)
      setLocation(loc)
      setAvatarUrl(av)
      setHasChanges(false)
    }
  }, [profile, user])

  // My Listings, Inquiries, and Seller Marketplace Analytics
  const [myListingsCount, setMyListingsCount] = useState(0)
  const [inquiriesCount, setInquiriesCount] = useState(0)
  const [recentlyViewedCars, setRecentlyViewedCars] = useState([])
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([])
  const [sellerStats, setSellerStats] = useState({
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalInquiries: 0,
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError]     = useState(null)

  const loadSellerAnalytics = useCallback(async () => {
    if (!user?.id) return
    setAnalyticsLoading(true)
    setAnalyticsError(null)

    try {
      const stats = await fetchSellerAnalytics(user.id)
      setAnalyticsLoading(false)
      if (stats?.error) {
        setAnalyticsError(stats.error)
      } else if (stats) {
        setSellerStats(stats)
      }
    } catch (err) {
      console.warn('[Cardom] fetchSellerAnalytics exception:', err)
      setAnalyticsLoading(false)
      setAnalyticsError(err)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchMyListings(user.id).then(({ data }) => {
        setMyListingsCount(data?.length || 0)
      })
      fetchSellerInquiryCounts(user.id).then(({ total }) => {
        setInquiriesCount(total || 0)
      })
      loadSellerAnalytics()
    }

    // Load recently viewed cars from localStorage
    const rvIds = getRecentlyViewedIds()
    setRecentlyViewedIds(rvIds)
    if (rvIds.length > 0) {
      fetchCarsByIds(rvIds).then(({ data }) => {
        if (data && data.length > 0) {
          setRecentlyViewedCars(data.slice(0, 4))
        }
      })
    }
  }, [user?.id, loadSellerAnalytics])

  // Track if user made edits
  const handleFieldChange = (setter, value) => {
    setter(value)
    setHasChanges(true)
    setSaveSuccess(false)
    setError('')
  }

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSaveSuccess(false)

    const { error: err } = await updateProfile(user.id, {
      full_name: fullName,
      phone,
      location,
      avatar_url: avatarUrl,
    })

    setSaving(false)

    if (err) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } else {
      setSaveSuccess(true)
      setHasChanges(false)
      await refreshProfile()
      setTimeout(() => setSaveSuccess(false), 4000)
    }
  }

  // 1. Protected Route check: If auth check finished and no user, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  // Format creation date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member'

  // User initials for avatar badge
  const initials = (fullName || user?.email || 'C')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-20 max-w-5xl mx-auto w-full">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/[0.04] rounded-full blur-[140px]" />
        </div>

        {loading ? (
          /* Loading skeleton */
          <div className="space-y-6 animate-pulse mt-8">
            <div className="h-44 rounded-3xl bg-[#111111] border border-white/[0.06]" />
            <div className="h-96 rounded-3xl bg-[#111111] border border-white/[0.06]" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* ── 1. Profile Header Hero ── */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b1b1b] to-[#0f0f0f] border-2 border-orange-500/30 flex items-center justify-center text-xl sm:text-2xl font-bold text-orange-400 shadow-[0_0_24px_rgba(249,115,22,0.18)]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || 'Avatar'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-orange-500 text-white shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                      {fullName || 'Cardom Driver'}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 border border-orange-500/30 text-orange-400">
                      <Sparkles className="w-3 h-3" />
                      Verified Account
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mt-1 truncate">
                    {user?.email}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Member since {memberSince}
                    </span>
                    {location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action CTA */}
                <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <Link
                    to="/cars"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 transition-colors"
                  >
                    <Car className="w-3.5 h-3.5 text-orange-400" />
                    Browse Cars
                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 2. Profile Edit Form Card ── */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 sm:p-8">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-bold text-white">Personal Information</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Update your personal profile and automotive preferences
                  </p>
                </div>

                {/* Save status notification */}
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Changes saved!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => handleFieldChange(setFullName, e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 bg-[#111111] border border-white/[0.08] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="block text-xs font-semibold text-zinc-300">
                        Email Address
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">Managed by Supabase</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-zinc-400 bg-white/[0.02] border border-white/[0.05] cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-xs font-semibold text-zinc-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => handleFieldChange(setPhone, e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 bg-[#111111] border border-white/[0.08] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label htmlFor="location" className="block text-xs font-semibold text-zinc-300">
                      City / Region
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => handleFieldChange(setLocation, e.target.value)}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 bg-[#111111] border border-white/[0.08] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="space-y-1.5">
                  <label htmlFor="avatarUrl" className="block text-xs font-semibold text-zinc-300">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    id="avatarUrl"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => handleFieldChange(setAvatarUrl, e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 bg-[#111111] border border-white/[0.08] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Enter an image link to customize your account avatar.
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-zinc-500">
                    {hasChanges ? 'You have unsaved changes' : 'Profile up to date'}
                  </p>

                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold',
                      'bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200',
                      'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── 3. Quick Buyer & Account Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/favorites"
                className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 hover:border-orange-500/30 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                    Saved Garage
                  </span>
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                </div>
                <p className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
                  {favoriteIds.length} {favoriteIds.length === 1 ? 'Car' : 'Cars'}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Shortlisted saved vehicles</p>
              </Link>

              <Link
                to="/my-inquiries"
                className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 hover:border-orange-500/30 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                    My Inquiries
                  </span>
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
                  {inquiriesCount} {inquiriesCount === 1 ? 'Inquiry' : 'Inquiries'}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Vehicle inquiries & chats</p>
              </Link>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Recently Viewed
                  </span>
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-lg font-bold text-white mt-2">
                  {recentlyViewedIds.length} {recentlyViewedIds.length === 1 ? 'Car' : 'Cars'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Explored on this device</p>
              </div>

              <Link
                to="/my-listings"
                className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-5 hover:border-orange-500/30 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                    My Listings
                  </span>
                  <Car className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
                  {myListingsCount} {myListingsCount === 1 ? 'Listing' : 'Listings'}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Manage vehicles you sell</p>
              </Link>
            </div>

            {/* ── 3.1 Recently Viewed Vehicles ── */}
            {recentlyViewedCars.length > 0 && (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Recently Viewed</h2>
                      <p className="text-xs text-zinc-400">
                        Vehicles you recently explored across the marketplace
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/cars"
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                  >
                    Browse All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentlyViewedCars.map((car, idx) => (
                    <CarCard key={car.id} car={car} delay={Math.min(idx * 0.05, 0.2)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── 4. Seller Marketplace Analytics (Feature 9) ── */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    <h2 className="text-lg font-bold text-white">Seller Marketplace Analytics</h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Performance summary across your vehicle listings and buyer engagement
                  </p>
                </div>
                <Link
                  to="/my-listings"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  Manage Listings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {analyticsLoading ? (
                /* Polished Loading Skeleton */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] animate-pulse space-y-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.05]" />
                      <div className="space-y-1.5">
                        <div className="h-7 w-16 bg-white/[0.08] rounded-md" />
                        <div className="h-3 w-20 bg-white/[0.04] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : analyticsError ? (
                /* Subtle Error State */
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] text-xs text-amber-300/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Analytics unavailable at this moment. Your vehicle listings and account remain fully active.</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadSellerAnalytics}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium transition-colors text-xs cursor-pointer whitespace-nowrap"
                  >
                    Retry Analytics
                  </button>
                </div>
              ) : !myListingsCount && !sellerStats.activeListings && !sellerStats.soldListings ? (
                /* Empty State */
                <div className="py-12 px-6 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] text-center max-w-md mx-auto my-2">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
                    <Car className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">No listings yet</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    List your first car and start tracking buyer interest.
                  </p>
                  <Link
                    to="/sell"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Sell Your Car
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                /* Polished Analytics Metrics Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {/* Active Listings */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] hover:border-orange-500/30 hover:bg-[#111111] transition-all duration-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-emerald-400/90 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                        {formatMetricCount(sellerStats.activeListings)}
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                        Active Listings
                      </p>
                      <div className="h-0.5 w-6 bg-orange-500/0 group-hover:bg-orange-500/60 rounded-full mt-2 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Sold Listings */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] hover:border-orange-500/30 hover:bg-[#111111] transition-all duration-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500">Archived</span>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                        {formatMetricCount(sellerStats.soldListings)}
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                        Sold Listings
                      </p>
                      <div className="h-0.5 w-6 bg-orange-500/0 group-hover:bg-orange-500/60 rounded-full mt-2 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Total Views */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] hover:border-orange-500/30 hover:bg-[#111111] transition-all duration-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-orange-400/80">Impressions</span>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                        {formatMetricCount(sellerStats.totalViews)}
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                        Total Views
                      </p>
                      <div className="h-0.5 w-6 bg-orange-500/0 group-hover:bg-orange-500/60 rounded-full mt-2 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Total Favorites */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] hover:border-orange-500/30 hover:bg-[#111111] transition-all duration-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-[10px] font-medium text-rose-400/80">Garage Saves</span>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                        {formatMetricCount(sellerStats.totalFavorites)}
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                        Total Favorites
                      </p>
                      <div className="h-0.5 w-6 bg-orange-500/0 group-hover:bg-orange-500/60 rounded-full mt-2 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Buyer Inquiries */}
                  <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] hover:border-orange-500/30 hover:bg-[#111111] transition-all duration-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-blue-400/80">Buyer Leads</span>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                        {formatMetricCount(sellerStats.totalInquiries)}
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                        Buyer Inquiries
                      </p>
                      <div className="h-0.5 w-6 bg-orange-500/0 group-hover:bg-orange-500/60 rounded-full mt-2 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
