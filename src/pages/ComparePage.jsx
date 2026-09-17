import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers,
  ArrowLeft,
  X,
  Plus,
  Car,
  Check,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useComparison } from '@/context/ComparisonContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

// Indian price notation
function formatPrice(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  return `₹${(num / 100_000).toFixed(0)} Lakh`
}

function formatMileage(km) {
  if (typeof km === 'string') {
    if (km.toLowerCase().includes('km')) return km
    const parsed = parseInt(km.replace(/[^0-9]/g, ''), 10)
    if (isNaN(parsed)) return km
    km = parsed
  }
  return km >= 1000 ? `${Math.round(km / 1000)}K km` : `${km} km`
}

export function ComparePage() {
  const navigate = useNavigate()
  const { compareCars, compareIds, removeCar, clearAll, carsLoading, maxAllowed } = useComparison()

  // Filter out any undefined/null entries
  const validCars = useMemo(() => {
    return (compareCars || []).filter(Boolean)
  }, [compareCars])

  // Comparison specifications rows (strictly actual DB columns only)
  const SPECIFICATIONS = [
    {
      id: 'price',
      label: 'Price',
      getValue: (c) => formatPrice(c.price),
      raw: (c) => c.price,
    },
    {
      id: 'year',
      label: 'Model Year',
      getValue: (c) => c.year,
      raw: (c) => c.year,
    },
    {
      id: 'mileage',
      label: 'Kilometers Driven',
      getValue: (c) => formatMileage(c.mileage),
      raw: (c) => c.mileage,
    },
    {
      id: 'fuel',
      label: 'Fuel Type',
      getValue: (c) => c.fuel || c.fuel_type || '—',
      raw: (c) => (c.fuel || c.fuel_type || '').toLowerCase(),
    },
    {
      id: 'transmission',
      label: 'Transmission',
      getValue: (c) => c.transmission || '—',
      raw: (c) => (c.transmission || '').toLowerCase(),
    },
    {
      id: 'location',
      label: 'Location / City',
      getValue: (c) => c.location || '—',
      raw: (c) => (c.location || '').toLowerCase(),
    },
    {
      id: 'status',
      label: 'Listing Status',
      getValue: (c) => (c.status === 'sold' ? 'Sold' : 'Active'),
      raw: (c) => c.status || 'active',
    },
  ]

  // Neutral check: whether values differ among the selected cars
  const isRowDifferent = (spec) => {
    if (validCars.length <= 1) return false
    const values = validCars.map((c) => String(spec.raw ? spec.raw(c) : spec.getValue(c) ?? '').trim())
    return new Set(values).size > 1
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
          {/* ── Top Header Strip ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to previous page
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Vehicle Comparison
                  </h1>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Neutral, side-by-side technical specification comparison
                  </p>
                </div>
              </div>
            </div>

            {validCars.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All
                </button>

                <Link
                  to="/cars"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  Browse More
                </Link>
              </div>
            )}
          </div>

          {/* ── Empty State ── */}
          {!carsLoading && validCars.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 text-orange-400">
                <Layers className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No cars to compare
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Select up to 3 cars from the marketplace to compare them side-by-side.
              </p>
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <Car className="w-4 h-4" />
                Browse Cars
              </Link>
            </motion.div>
          ) : (
            /* ── Comparison Table View ── */
            <div className="space-y-6">
              {/* Neutral Highlighting Legend */}
              <div className="flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Highlighted rows indicate differing specifications
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Showing {validCars.length} of {maxAllowed} vehicles
                </span>
              </div>

              {/* Horizontally scrollable container with sticky specification column */}
              <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
                  <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-[800px]">
                    {/* Header Row: Vehicle Overview / Image / Actions */}
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                        <th className="p-5 sm:p-6 w-48 sm:w-60 sticky left-0 z-20 bg-[#0d0d0d] border-r border-white/[0.08] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Vehicle
                        </th>

                        {validCars.map((car) => (
                          <th key={car.id} className="p-5 sm:p-6 min-w-[220px] max-w-[280px] align-top">
                            <div className="space-y-3">
                              {/* Vehicle Image Container */}
                              <div
                                className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 group"
                                style={{ aspectRatio: '16 / 10' }}
                              >
                                <img
                                  src={car.image_url || car.image || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'
                                  }}
                                />

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeCar(car.id)}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                                  title="Remove from comparison"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                {car.status === 'sold' && (
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-900/90 text-zinc-300 border border-zinc-700">
                                    Sold
                                  </span>
                                )}
                              </div>

                              {/* Title & Price */}
                              <div>
                                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                                  {car.brand}
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight truncate">
                                  {car.model}
                                </h3>
                                <p className="text-lg font-black text-white mt-1 tabular-nums">
                                  {formatPrice(car.price)}
                                </p>
                              </div>

                              {/* Action Link */}
                              <Link
                                to={`/cars/${car.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                              >
                                View Listing <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </th>
                        ))}

                        {/* If fewer than 3 cars, show add slot */}
                        {validCars.length < maxAllowed && (
                          <th className="p-5 sm:p-6 min-w-[200px] align-middle text-center border-l border-white/[0.04]">
                            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/40 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-zinc-400 mb-2">
                                <Plus className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-bold text-white mb-1">+ Add another car</p>
                              <p className="text-[11px] text-zinc-500 mb-3">Compare up to 3 cars</p>
                              <Link
                                to="/cars"
                                className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold transition-colors"
                              >
                                Add from Marketplace
                              </Link>
                            </div>
                          </th>
                        )}
                      </tr>
                    </thead>

                    {/* Specification Rows */}
                    <tbody className="divide-y divide-white/[0.06]">
                      {SPECIFICATIONS.map((spec) => {
                        const differs = isRowDifferent(spec)

                        return (
                          <tr
                            key={spec.id}
                            className={cn(
                              'transition-colors',
                              differs ? 'bg-orange-500/[0.02]' : 'hover:bg-white/[0.01]',
                            )}
                          >
                            {/* Sticky Left Column: Specification Label */}
                            <td
                              className={cn(
                                'p-4 sm:p-5 sticky left-0 z-10 bg-[#0d0d0d] border-r border-white/[0.08]',
                                'text-xs font-semibold text-zinc-300 flex items-center justify-between gap-2',
                              )}
                            >
                              <span>{spec.label}</span>
                              {differs && (
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono uppercase tracking-wider"
                                  title="Values differ across selected cars"
                                >
                                  Differs
                                </span>
                              )}
                            </td>

                            {/* Values per car */}
                            {validCars.map((car) => (
                              <td
                                key={car.id}
                                className={cn(
                                  'p-4 sm:p-5 text-sm',
                                  differs ? 'text-white font-semibold' : 'text-zinc-300 font-normal',
                                )}
                              >
                                <div className="flex items-center gap-1.5">
                                  {spec.id === 'status' ? (
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                                        car.status === 'sold'
                                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                                      )}
                                    >
                                      {spec.getValue(car)}
                                    </span>
                                  ) : (
                                    <span>{spec.getValue(car)}</span>
                                  )}
                                </div>
                              </td>
                            ))}

                            {/* Empty column placeholder if < 3 */}
                            {validCars.length < maxAllowed && (
                              <td className="p-4 sm:p-5 text-zinc-600 text-xs border-l border-white/[0.04]">
                                —
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

