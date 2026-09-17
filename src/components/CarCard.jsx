import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion }   from 'framer-motion'
import {
  Heart,
  MapPin,
  Fuel,
  Gauge,
  Calendar,
  ArrowUpRight,
  Zap,
  BadgeCheck,
  Car,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useComparison } from '@/context/ComparisonContext'
import { isListingNew } from '@/utils/dateUtils'
import { cn } from '@/lib/utils'

// ─── Formatters (pure functions — easy to extract to lib/format.js later) ────

/**
 * Indian price notation:
 *   < 1 Cr  →  ₹XX L
 *   ≥ 1 Cr  →  ₹X.XX Cr
 */
function formatPrice(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  return `₹${(num / 100_000).toFixed(0)} L`
}

/** 12000 → "12K km", 800 → "800 km" */
function formatMileage(km) {
  if (typeof km === 'string') {
    if (km.toLowerCase().includes('km')) return km
    const parsed = parseInt(km.replace(/[^0-9]/g, ''), 10)
    if (isNaN(parsed)) return km
    km = parsed
  }
  return km >= 1000 ? `${Math.round(km / 1000)}K km` : `${km} km`
}

// ─── Badge colour map ─────────────────────────────────────────────────────────

const BADGE_CLASS = {
  Featured:  'bg-orange-500 text-white',
  'Hot Deal':'bg-red-500   text-white',
  Electric:  'bg-emerald-500 text-white',
}

// ─── Spec pill definition ─────────────────────────────────────────────────────

function specPills(car) {
  return [
    { Icon: Calendar, label: String(car.year) },
    { Icon: Gauge,    label: formatMileage(car.mileage) },
    { Icon: Fuel,     label: car.fuel },
    { Icon: Zap,      label: car.transmission === 'Automatic' ? 'Auto' : 'Manual' },
  ]
}

// ─── Image fallback ───────────────────────────────────────────────────────────

function ImageFallback({ brand, model }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#161616] to-[#0a0a0a] text-zinc-500">
      <Car className="w-9 h-9 text-orange-500/40" />
      <p className="text-[11px] text-zinc-500 font-medium">{brand} {model}</p>
    </div>
  )
}

// ─── CarCard ─────────────────────────────────────────────────────────────────

/**
 * CarCard — reusable car listing card.
 *
 * Props:
 *   car    {object}  — car data object (see src/data/cars.js for shape)
 *   delay  {number}  — Framer Motion entrance delay in seconds (for stagger)
 *
 * The data shape is intentionally identical to what a Supabase query returns,
 * so swapping mock data for live data requires only changing the data source.
 */
export function CarCard({ car, delay = 0 }) {
  const navigate = useNavigate()
  const { user, isCarFavorite, toggleCarFavorite } = useAuth()
  const { isInCompare, toggleCar } = useComparison()
  const favorited = isCarFavorite(car.id)
  const inCompare = isInCompare(car.id)
  const [imgError,  setImgError]  = useState(false)

  return (
    <motion.article
      onClick={() => navigate(`/cars/${car.id}`)}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-[#0d0d0d] border border-white/[0.07]',
        'hover:border-orange-500/30',
        'hover:shadow-[0_0_0_1px_rgba(249,115,22,0.08),0_20px_60px_rgba(0,0,0,0.65),0_0_36px_rgba(249,115,22,0.07)]',
        'transition-[border-color,box-shadow] duration-300',
        'cursor-pointer',
      )}
    >
      {/* ─────────────────────── IMAGE BLOCK ──────────────────────── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>

        {/* Car image with CSS zoom on group-hover */}
        {imgError ? (
          <ImageFallback brand={car.brand} model={car.model} />
        ) : (
          <img
            src={car.image_url || car.image}
            alt={`${car.year} ${car.brand || car.make || ''} ${car.model || ''}`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={cn(
              'w-full h-full object-cover',
              'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'group-hover:scale-[1.06]',
            )}
          />
        )}

        {/* Gradient overlay — stronger at bottom so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/10 to-transparent" />

        {/* Top-accent line — orange gradient on hover */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500/70 transition-all duration-500"
        />

        {/* ── Status / Badge ── */}
        {car.status === 'sold' ? (
          <span
            className="absolute top-3 left-3 inline-flex items-center px-2.5 py-[5px] rounded-full text-[10px] font-bold tracking-wider uppercase leading-none bg-zinc-900/90 text-zinc-300 border border-zinc-700 shadow-lg backdrop-blur-sm"
          >
            Sold
          </span>
        ) : car.badge ? (
          <span
            className={cn(
              'absolute top-3 left-3 inline-flex items-center gap-1',
              'px-2.5 py-[5px] rounded-full text-[11px] font-semibold leading-none',
              BADGE_CLASS[car.badge] ?? 'bg-orange-500 text-white',
            )}
          >
            {car.badge === 'Electric' && <Zap className="w-2.5 h-2.5 fill-current" strokeWidth={0} />}
            {car.badge === 'Featured' && <BadgeCheck className="w-2.5 h-2.5" strokeWidth={2.5} />}
            {car.badge}
          </span>
        ) : (car.status === 'active' || !car.status) && isListingNew(car.created_at) ? (
          <span
            className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-[5px] rounded-full text-[10px] font-bold tracking-wider leading-none bg-orange-500 text-white shadow-lg shadow-orange-500/25"
          >
            <Sparkles className="w-2.5 h-2.5" />
            NEW
          </span>
        ) : null}

        {/* ── Favourite button ── */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={async (e) => {
            e.stopPropagation()
            if (!user) {
              navigate('/login')
              return
            }
            await toggleCarFavorite(car.id)
          }}
          aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
          aria-pressed={favorited}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full z-20',
            'flex items-center justify-center',
            'bg-black/55 backdrop-blur-sm',
            'border border-white/[0.12] hover:border-white/25',
            'transition-all duration-200',
          )}
        >
          <Heart
            className={cn(
              'w-[15px] h-[15px] transition-all duration-200',
              favorited
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-white/70 hover:text-white',
            )}
          />
        </motion.button>

        {/* ── Compare button ── */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation()
            toggleCar(car.id)
          }}
          aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
          aria-pressed={inCompare}
          className={cn(
            'absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-semibold',
            'flex items-center gap-1 transition-all duration-200 backdrop-blur-md cursor-pointer',
            inCompare
              ? 'bg-orange-500 text-white shadow-[0_0_14px_rgba(249,115,22,0.4)] border border-orange-400'
              : 'bg-black/60 text-zinc-300 border border-white/15 hover:bg-black/80 hover:text-white hover:border-orange-500/40',
          )}
        >
          {inCompare ? (
            <>
              <Check className="w-3 h-3 text-white stroke-[2.5]" />
              <span>Comparing</span>
            </>
          ) : (
            <>
              <Layers className="w-3 h-3 text-orange-400" />
              <span>Compare</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ─────────────────────── CARD BODY ────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* ── Brand / Model / Price ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-orange-400/75 tracking-[0.12em] uppercase mb-1">
              {car.brand}
            </p>
            <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-1">
              {car.model}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[17px] font-bold text-white tabular-nums leading-tight">
              {formatPrice(car.price)}
            </p>
            <p className="text-[10px] text-zinc-700 mt-0.5">ex-showroom</p>
          </div>
        </div>

        {/* ── Spec pills — 2×2 grid ── */}
        <div className="grid grid-cols-2 gap-1.5">
          {specPills(car).map(({ Icon, label }) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg',
                'bg-white/[0.03] border border-white/[0.05]',
                'group-hover:border-white/[0.08] transition-colors duration-300',
                'text-zinc-500 text-xs',
              )}
            >
              <Icon className="w-3 h-3 flex-shrink-0 text-zinc-700 group-hover:text-zinc-600 transition-colors" strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Location + CTA ── */}
        <div className={cn(
          'flex items-center justify-between',
          'pt-3 border-t border-white/[0.05]',
          'mt-auto',
        )}>
          <div className="flex items-center gap-1.5 text-zinc-600 text-[12px] min-w-0">
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{car.location}</span>
          </div>

          <div className={cn(
            'flex items-center gap-1 text-[12px] font-medium flex-shrink-0',
            'text-zinc-600 group-hover:text-orange-400',
            'transition-colors duration-200',
          )}>
            <span>View Details</span>
            <ArrowUpRight
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

