import { useState, useEffect, useCallback } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Calendar,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Heart,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchMyListings, deleteCar, markCarAsSold, restoreCarListing } from '@/services/carsApi'
import { fetchBatchListingStats } from '@/services/carAnalyticsApi'
import { formatMetricCount } from '@/utils/dateUtils'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

// Indian currency formatter
function formatPrice(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  return `₹${(num / 100_000).toFixed(0)} Lakh`
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || 'active').toLowerCase()
  if (s === 'sold') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
        Sold
      </span>
    )
  }
  if (s === 'draft') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Active
    </span>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function ListingSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden animate-pulse flex flex-col sm:flex-row">
      <div className="w-full sm:w-56 h-44 bg-zinc-850 bg-zinc-900 flex-shrink-0" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-zinc-800 rounded" />
          <div className="h-3 w-24 bg-zinc-800/70 rounded" />
        </div>
        <div className="h-6 w-28 bg-zinc-800 rounded" />
        <div className="h-8 w-48 bg-zinc-800/50 rounded" />
      </div>
    </div>
  )
}

// ─── MyListingsPage ──────────────────────────────────────────────────────────
export function MyListingsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleting, setDeleting]           = useState(false)
  
  // Sold & Restore modal states
  const [soldTarget, setSoldTarget]       = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Listing Activity Statistics
  const [listingStats, setListingStats]   = useState({})
  const [statsLoading, setStatsLoading]   = useState(true)
  const [statsError, setStatsError]       = useState(false)

  const [notice, setNotice]               = useState('')

  // 1. Fetch user's listings & batch activity stats
  const loadListings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await fetchMyListings(user.id)
    setLoading(false)

    if (err) {
      setError(err.message || 'Unable to load your car listings.')
      setStatsLoading(false)
    } else {
      const items = data || []
      setListings(items)

      // Fetch batch stats for all user's listings in one single roundtrip
      const carIds = items.map((c) => c.id).filter(Boolean)
      if (carIds.length > 0) {
        setStatsLoading(true)
        setStatsError(false)
        fetchBatchListingStats(carIds)
          .then(({ data: statsMap, error: bErr }) => {
            setStatsLoading(false)
            if (bErr || !statsMap) {
              setStatsError(true)
            } else {
              setListingStats(statsMap)
            }
          })
          .catch((err) => {
            console.warn('[Cardom] Batch stats request error:', err)
            setStatsLoading(false)
            setStatsError(true)
          })
      } else {
        setStatsLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  // 2. Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return
    setDeleting(true)

    const { success, error: err } = await deleteCar(deleteTarget.id, user.id)
    setDeleting(false)

    if (success) {
      setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setListingStats((prev) => {
        const next = { ...prev }
        delete next[deleteTarget.id]
        return next
      })
      setDeleteTarget(null)
      setNotice('Listing deleted successfully.')
      setTimeout(() => setNotice(''), 3500)
    } else {
      alert(err?.message || 'Failed to delete listing. Please try again.')
    }
  }

  // 3. Handle Mark as Sold confirmation
  const handleConfirmMarkAsSold = async () => {
    if (!soldTarget || !user) return
    setUpdatingStatus(true)

    const { data, error: err } = await markCarAsSold(soldTarget.id, user.id)
    setUpdatingStatus(false)

    if (!err && data) {
      setListings((prev) =>
        prev.map((item) => (item.id === soldTarget.id ? { ...item, status: 'sold' } : item)),
      )
      setSoldTarget(null)
      setNotice('Vehicle marked as sold.')
      setTimeout(() => setNotice(''), 3500)

      // Refresh batch stats after status change
      const carIds = listings.map((c) => c.id).filter(Boolean)
      if (carIds.length > 0) {
        fetchBatchListingStats(carIds).then(({ data: statsMap }) => {
          if (statsMap) setListingStats(statsMap)
        })
      }
    } else {
      alert(err?.message || 'Failed to update vehicle status. Please try again.')
    }
  }

  // 4. Handle Restore Listing confirmation
  const handleConfirmRestoreListing = async () => {
    if (!restoreTarget || !user) return
    setUpdatingStatus(true)

    const { data, error: err } = await restoreCarListing(restoreTarget.id, user.id)
    setUpdatingStatus(false)

    if (!err && data) {
      setListings((prev) =>
        prev.map((item) => (item.id === restoreTarget.id ? { ...item, status: 'active' } : item)),
      )
      setRestoreTarget(null)
      setNotice('Listing restored to active marketplace.')
      setTimeout(() => setNotice(''), 3500)

      // Refresh batch stats after status change
      const carIds = listings.map((c) => c.id).filter(Boolean)
      if (carIds.length > 0) {
        fetchBatchListingStats(carIds).then(({ data: statsMap }) => {
          if (statsMap) setListingStats(statsMap)
        })
      }
    } else {
      alert(err?.message || 'Failed to restore vehicle listing. Please try again.')
    }
  }

  // Protected route check
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-20 max-w-6xl mx-auto w-full">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/[0.04] rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-3">
                <Car className="w-3.5 h-3.5" />
                Seller Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                My Vehicle Listings
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Manage your active car marketplace listings, updates, and sales
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
              </span>

              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-[0_0_16px_rgba(249,115,22,0.3)]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Sell Another Car
              </Link>
            </div>
          </div>

          {/* Feedback notice toast */}
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{notice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Content States ── */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 px-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] text-center max-w-lg mx-auto my-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Unable to Load Listings
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                {error}
              </p>
              <button
                type="button"
                onClick={loadListings}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </motion.div>
          ) : listings.length > 0 ? (
            <motion.div layout className="space-y-4">
              {listings.map((car) => (
                <div
                  key={car.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] hover:border-white/[0.14] transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch"
                >
                  {/* Image Preview */}
                  <div className="w-full sm:w-60 h-44 sm:h-auto bg-zinc-900 relative flex-shrink-0">
                    <img
                      src={car.image_url || car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={car.status} />
                    </div>
                  </div>

                  {/* Listing Details */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                            {car.brand}
                          </p>
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            {car.model}
                          </h3>
                        </div>
                        <p className="text-lg font-bold text-white">
                          {formatPrice(car.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {car.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {car.location}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span>{car.fuel}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{car.transmission}</span>
                      </div>

                      {/* Listing Activity Summary Metrics */}
                      <div className="flex items-center gap-3.5 text-xs pt-3 border-t border-white/[0.05] flex-wrap mt-3">
                        {statsLoading ? (
                          <div className="flex items-center gap-3 py-0.5">
                            <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-pulse" />
                            <span className="text-zinc-700">•</span>
                            <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-pulse" />
                            <span className="text-zinc-700">•</span>
                            <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-pulse" />
                          </div>
                        ) : statsError ? (
                          <div className="flex items-center gap-1.5 text-zinc-500 py-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[11px]">Analytics unavailable</span>
                          </div>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Eye className="w-3.5 h-3.5 text-orange-400" />
                              <span className="font-semibold text-white">
                                {formatMetricCount(listingStats[car.id]?.views || 0)}
                              </span>{' '}
                              Views
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Heart className="w-3.5 h-3.5 text-red-400" />
                              <span className="font-semibold text-white">
                                {formatMetricCount(listingStats[car.id]?.favorites || 0)}
                              </span>{' '}
                              Favorites
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="flex items-center gap-1 text-zinc-400">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-semibold text-white">
                                {formatMetricCount(listingStats[car.id]?.inquiries || 0)}
                              </span>{' '}
                              Inquiries
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-zinc-500">
                        Listing ID: {car.id.slice(0, 8)}...
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Mark as Sold or Restore Button */}
                        {car.status === 'sold' ? (
                          <button
                            type="button"
                            onClick={() => setRestoreTarget(car)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                            title="Restore vehicle to active marketplace"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore Listing
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSoldTarget(car)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                            title="Mark vehicle as sold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as Sold
                          </button>
                        )}

                        {/* View in Marketplace */}
                        <button
                          type="button"
                          onClick={() => navigate(`/cars/${car.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/my-listings/${car.id}/edit`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(car)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 text-orange-400">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No listings yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                List your first car and start tracking buyer interest.
              </p>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <PlusCircle className="w-4 h-4" />
                Sell Your Car
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Delete Confirmation Dialog Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#111111] p-6 shadow-2xl shadow-black space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Delete vehicle listing?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Are you sure you want to remove{' '}
                  <span className="text-white font-semibold">
                    {deleteTarget.brand} {deleteTarget.model}
                  </span>{' '}
                  from the Cardom marketplace? This action cannot be undone.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Mark as Sold Confirmation Dialog Modal ── */}
        {soldTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#111111] p-6 shadow-2xl shadow-black space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Mark this vehicle as sold?
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  It will no longer appear in the public marketplace for buyers, but will remain visible in your seller dashboard and existing inquiries will remain accessible.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300">
                  <span className="text-zinc-400">Target Vehicle:</span>{' '}
                  <span className="font-semibold text-white">
                    {soldTarget.brand} {soldTarget.model} ({soldTarget.year})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => setSoldTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleConfirmMarkAsSold}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Sold
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Restore Listing Confirmation Dialog Modal ── */}
        {restoreTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#111111] p-6 shadow-2xl shadow-black space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Restore this listing?
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  This vehicle will become active again and reappear in the public Cardom marketplace for prospective buyers.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300">
                  <span className="text-zinc-400">Target Vehicle:</span>{' '}
                  <span className="font-semibold text-white">
                    {restoreTarget.brand} {restoreTarget.model} ({restoreTarget.year})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => setRestoreTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleConfirmRestoreListing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore to Active
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

