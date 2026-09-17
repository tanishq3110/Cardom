import { useState, useEffect, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart,
  Car,
  RotateCcw,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchFavorites } from '@/services/favoritesApi'
import { fetchCars, fetchCarsByIds } from '@/services/carsApi'
import { getRecentlyViewedIds } from '@/utils/recentlyViewed'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { CarCard } from '@/components/CarCard'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

// ─── Loading Skeleton Card ───────────────────────────────────────────────────
function FavoriteSkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0d0d0d] border border-white/[0.07] animate-pulse">
      <div className="relative bg-zinc-900" style={{ aspectRatio: '16 / 10' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-2.5 w-16 bg-zinc-800/80 rounded" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="h-4 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-zinc-800/40 rounded-lg" />
          ))}
        </div>
        <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-800/70 rounded" />
          <div className="h-3 w-16 bg-zinc-800/70 rounded" />
        </div>
      </div>
    </div>
  )
}

// ─── FavoritesPage Component ─────────────────────────────────────────────────
export function FavoritesPage() {
  const { user, loading: authLoading, favoriteIds } = useAuth()
  const [favoriteCars, setFavoriteCars] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  // 1. Fetch user's saved cars
  const loadFavoriteCars = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      // Query favorites from Supabase
      const { data, carIds, error: favError } = await fetchFavorites(user.id)
      if (favError) {
        // If table doesn't exist yet, show clean message
        if (favError.code === 'PGRST205' || favError.code === '42P01') {
          setError('The favorites table is not created in Supabase yet. Please run the provided SQL script.')
        } else {
          setError(favError.message || 'Unable to load your saved vehicles.')
        }
        setLoading(false)
        return
      }

      // Check if cars were populated in joined query
      const joinedCars = data.map((item) => item.car).filter(Boolean)
      if (joinedCars.length === carIds.length && carIds.length > 0) {
        setFavoriteCars(joinedCars)
        setLoading(false)
        return
      }

      // If joined cars weren't populated or some were missing, fetch all cars and match
      if (carIds.length > 0) {
        const { data: allCars } = await fetchCars()
        const matched = (allCars || []).filter((c) => carIds.includes(String(c.id)))
        setFavoriteCars(matched)
      } else {
        setFavoriteCars([])
      }
    } catch (err) {
      console.error('[Cardom Favorites] Load error:', err)
      setError('An unexpected error occurred while loading your saved cars.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFavoriteCars()
  }, [loadFavoriteCars])

  // 2. Fetch Recently Viewed Cars from localStorage (max 8)
  useEffect(() => {
    const rvIds = getRecentlyViewedIds()
    if (rvIds && rvIds.length > 0) {
      fetchCarsByIds(rvIds).then(({ data }) => {
        if (data && data.length > 0) {
          setRecentlyViewed(data.slice(0, 8))
        }
      })
    }
  }, [])

  // Keep list in sync if user un-favorites a car directly from this page
  useEffect(() => {
    setFavoriteCars((prev) => prev.filter((c) => favoriteIds.includes(String(c.id))))
  }, [favoriteIds])

  // Protected route check
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-20 max-w-7xl mx-auto w-full">
        {/* Background visual elements */}
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/[0.04] rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* ── Header Strip ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-3">
                <Heart className="w-3.5 h-3.5 fill-current" />
                Personal Garage
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Saved Vehicles
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Your shortlisted vehicles ready for comparison, test drives, or booking
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                {favoriteCars.length} {favoriteCars.length === 1 ? 'Car' : 'Cars'} Saved
              </span>

              <Link
                to="/cars"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-[0_0_16px_rgba(249,115,22,0.3)]"
              >
                <Car className="w-3.5 h-3.5" />
                Browse More
              </Link>
            </div>
          </div>

          {/* ── Content View ── */}
          {loading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <FavoriteSkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 px-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] text-center max-w-lg mx-auto my-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Unable to Load Saved Cars
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                {error}
              </p>
              <button
                type="button"
                onClick={loadFavoriteCars}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            </motion.div>
          ) : favoriteCars.length > 0 ? (
            /* Populated Grid */
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {favoriteCars.map((car, index) => (
                <CarCard
                  key={car.id}
                  car={car}
                  delay={Math.min(index * 0.06, 0.24)}
                />
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 text-orange-400">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No saved cars yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Save cars you&apos;re interested in and find them here.
              </p>
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <Car className="w-4 h-4" />
                Browse Cars
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* ── Recently Viewed Section ── */}
          {recentlyViewed.length > 0 && (
            <div className="pt-10 mt-10 border-t border-white/[0.08] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Recently Viewed
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Vehicles you recently explored across the marketplace
                  </p>
                </div>
                <Link
                  to="/cars"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentlyViewed.map((car, idx) => (
                  <CarCard key={car.id} car={car} delay={Math.min(idx * 0.05, 0.2)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

