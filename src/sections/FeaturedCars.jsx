import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Car, ArrowRight, SlidersHorizontal, AlertTriangle } from 'lucide-react'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { GridPattern }   from '@/components/vengeance/GridPattern'
import { CarCard }       from '@/components/CarCard'
import { fetchCars }     from '@/services/carsApi'
import { cn } from '@/lib/utils'

// ─── Number of columns used for stagger delay calculation ────────────────────
const GRID_COLS = 3   // matches lg:grid-cols-3

// ─── Reusable section divider ─────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 mb-20">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.07]" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 ring-4 ring-orange-500/10 flex-shrink-0" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.07]" />
    </div>
  )
}

// ─── Filter pills (visual only — filtering is a future feature) ───────────────

const FILTER_PILLS = ['All', 'New', 'Electric', 'SUV', 'Sedan', 'Sports']

function FilterPills() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTER_PILLS.map((label, i) => (
        <button
          key={label}
          disabled={label !== 'All'}   // only "All" is active for now
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
            i === 0
              // Active pill
              ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
              // Inactive pill
              : 'border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-orange-500/30 hover:text-zinc-300 cursor-not-allowed opacity-60',
          )}
        >
          {label}
        </button>
      ))}
      {/* Placeholder "Filters" button */}
      <button
        disabled
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/[0.07] text-zinc-600 opacity-50 cursor-not-allowed"
        title="Advanced filters coming soon"
      >
        <SlidersHorizontal className="w-3 h-3" />
        Filters
      </button>
    </div>
  )
}

// ─── FeaturedCars ─────────────────────────────────────────────────────────────

export function FeaturedCars() {
  const headerRef = useRef(null)
  const isInView  = useInView(headerRef, { once: true, margin: '-80px' })
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadCars() {
      setLoading(true)
      const { data, error: err } = await fetchCars()
      if (!isMounted) return
      if (err) {
        if (err.code === '42501') {
          setError('Permission denied on table public.cars. Please run "GRANT SELECT ON public.cars TO anon;" in your Supabase SQL Editor.')
        } else {
          setError(err.message || 'Unable to load cars')
        }
      } else {
        setCars(data || [])
      }
      setLoading(false)
    }
    loadCars()
    return () => { isMounted = false }
  }, [])

  return (
    <section
      id="featured-cars"
      aria-label="Featured Cars"
      className="relative bg-[#080808] py-24 sm:py-32 overflow-hidden"
    >
      {/* ── Background ── */}
      <GridPattern
        squareSize={36}
        strokeWidth={0.3}
        className="text-white/[0.015] fill-none"
      />

      {/* Top-right ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 w-[520px] h-[380px] rounded-full bg-orange-500/[0.05] blur-[130px] translate-x-1/3"
      />
      {/* Bottom-left counter-glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[350px] rounded-full bg-orange-500/[0.04] blur-[100px] -translate-x-1/3"
      />
      {/* Section top-edge line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Divider ── */}
        <SectionDivider />

        {/* ── Section header ── */}
        <div ref={headerRef} className="mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
                'text-[11px] font-semibold tracking-widest uppercase',
                'border border-orange-500/20 bg-orange-500/[0.07] text-orange-400',
              )}>
                <Car className="w-3 h-3" />
                Featured Collection
              </span>
            </div>

            {/* Heading row — two-col on desktop */}
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-16 mb-8">
              <h2 className={cn(
                'text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight',
                'text-white mb-4 lg:mb-0 max-w-sm',
              )}>
                Find Your{' '}
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                  Next Drive
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed max-w-sm lg:text-right">
                Explore handpicked cars from trusted sellers,
                all in one place.
              </p>
            </div>

            {/* Filter pills row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <FilterPills />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Car grid ────────────────────────────────────────────────
            Layout:
              mobile (< sm)   : 1 col
              tablet (sm–lg)  : 2 cols
              desktop (≥ lg)  : 3 cols

            Stagger delay: position within the current row × 0.1 s
              index % GRID_COLS → 0, 0.1, 0.2, 0, 0.1, 0.2 …
        ──────────────────────────────────────────────────────────── */}
        {/* ── Car grid ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl bg-[#0d0d0d] border border-white/[0.07] animate-pulse"
              >
                <div className="relative bg-zinc-900" style={{ aspectRatio: '16 / 10' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                </div>
                <div className="flex flex-col flex-1 p-5 gap-4">
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 bg-zinc-800 rounded" />
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-8 bg-zinc-800/40 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 px-6 rounded-2xl border border-red-500/20 bg-red-500/[0.03] text-center max-w-md mx-auto my-6">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-300 mb-2">{error}</p>
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {cars.map((car, index) => (
              <CarCard
                key={car.id}
                car={car}
                delay={(index % GRID_COLS) * 0.10}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 rounded-2xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-6">
            <Car className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No cars currently available.</p>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/cars">
            <ShimmerButton size="md">
              View All Cars
              <ArrowRight className="w-4 h-4" />
            </ShimmerButton>
          </Link>
          <span className="text-xs text-zinc-700">
            {cars.length} listings available
          </span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080808] to-transparent"
      />
    </section>
  )
}

