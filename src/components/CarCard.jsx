import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Check, Layers } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useComparison } from '@/context/ComparisonContext'
import { isListingNew } from '@/utils/dateUtils'
import { cn } from '@/lib/utils'

function formatPriceLakh(amount) {
  const num = Number(amount) || 0
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  return `₹${(num / 100000).toFixed(2)} Lakh`
}

function formatMileage(km) {
  if (!km) return '24,000 km'
  if (typeof km === 'string') {
    if (km.toLowerCase().includes('km')) return km
    const parsed = parseInt(km.replace(/[^0-9]/g, ''), 10)
    if (isNaN(parsed)) return km
    km = parsed
  }
  return km >= 1000 ? `${(km / 1000).toFixed(0)}K km` : `${km} km`
}

function calculateEmi(amount) {
  const num = Number(amount) || 0
  const lakhs = num / 100000
  const emi = Math.round(lakhs * 1240)
  return emi > 0 ? emi.toLocaleString('en-IN') : '14,850'
}

export function CarCard({ car, delay = 0 }) {
  const navigate = useNavigate()
  const { user, isCarFavorite, toggleCarFavorite } = useAuth()
  const { isInCompare, toggleCar } = useComparison()
  const favorited = isCarFavorite ? isCarFavorite(car.id) : false
  const inCompare = isInCompare ? isInCompare(car.id) : false
  const [imgError, setImgError] = useState(false)

  const imageSrc =
    !imgError && (car.image_url || car.image || car.images?.[0])
      ? car.image_url || car.image || car.images?.[0]
      : '/cars/bmw-3-series.jpg'

  const formattedPrice = formatPriceLakh(car.price)
  const emiVal = calculateEmi(car.price)
  const scoreVal = car.score || '9.4'

  return (
    <motion.article
      onClick={() => navigate(`/cars/${car.id}`)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-[#1c1b1b] border border-white/10 hover:border-[#ff6a00]/40',
        'shadow-xl transition-all duration-300 cursor-pointer',
      )}
    >
      {/* ── 16:10 Image Container ── */}
      <div className="relative aspect-[16/10] bg-[#0e0e0e] overflow-hidden">
        <img
          src={imageSrc}
          alt={`${car.brand || ''} ${car.model || ''}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] via-transparent to-black/30" />

        {/* Top Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e0e]/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#4ae176]" />
          <span>CARDOM VERIFIED {scoreVal}</span>
        </div>

        {/* Favorite Heart Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={async (e) => {
            e.stopPropagation()
            if (!user) {
              navigate('/login')
              return
            }
            if (toggleCarFavorite) {
              await toggleCarFavorite(car.id)
            }
          }}
          aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full z-20 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/30 transition-all"
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-all',
              favorited ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:text-white',
            )}
          />
        </motion.button>

        {/* Compare Tag */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation()
            if (toggleCar) toggleCar(car.id)
          }}
          aria-label="Add to comparison"
          className={cn(
            'absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all backdrop-blur-md',
            inCompare
              ? 'bg-[#ff6a00] text-black shadow-md font-bold'
              : 'bg-black/60 text-zinc-300 border border-white/15 hover:text-white',
          )}
        >
          {inCompare ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Comparing</span>
            </>
          ) : (
            <>
              <Layers className="w-3 h-3 text-[#ff6a00]" />
              <span>Compare</span>
            </>
          )}
        </motion.button>

        {/* New listing status chip */}
        {isListingNew(car.created_at) && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff6a00] text-black">
            NEW
          </span>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Location */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-white leading-tight line-clamp-1">
                {car.year || '2021'} {car.brand} {car.model}
              </h3>
              <p className="text-xs text-[#c6c6c7] mt-0.5 line-clamp-1">
                {car.variant || '1.5 Turbo Dual-Clutch'}
              </p>
            </div>
            {car.location && (
              <span className="text-[10px] text-[#c6c6c7] flex items-center gap-0.5 bg-[#201f1f] border border-white/5 px-2 py-0.5 rounded-md flex-shrink-0">
                <span className="material-symbols-outlined text-[13px] text-[#ff6a00]">
                  location_on
                </span>
                <span className="truncate max-w-[90px]">{car.location}</span>
              </span>
            )}
          </div>

          {/* 3-Col Key Specs */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-[#201f1f] text-center border border-white/5 mt-3">
            <div>
              <p className="text-[10px] text-[#c6c6c7]">Odometer</p>
              <p className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                {formatMileage(car.mileage)}
              </p>
            </div>
            <div className="border-x border-white/5">
              <p className="text-[10px] text-[#c6c6c7]">Fuel & Gear</p>
              <p className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                {car.fuel || car.fuel_type || 'Petrol'} • {car.transmission === 'Automatic' ? 'Auto' : 'Manual'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#c6c6c7]">Ownership</p>
              <p className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                {car.ownership || '1st Owner'}
              </p>
            </div>
          </div>
        </div>

        <div>
          {/* Price & EMI */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-black text-white">
                {formattedPrice}
              </span>
              <span className="text-[11px] text-[#c6c6c7]">
                EMI from ₹{emiVal}/mo
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#4ae176] bg-[#4ae176]/10 border border-[#4ae176]/20 px-2 py-0.5 rounded">
              7 Days Return
            </span>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 mt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/cars/${car.id}`)
              }}
              className="py-2 px-3 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-xs font-bold text-[#e5e2e1] transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-[#ff6a00]">
                directions_car
              </span>
              <span>Test Drive</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/cars/${car.id}`)
              }}
              className="py-2 px-3 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-xs font-bold text-black transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>View Details</span>
              <span className="material-symbols-outlined text-sm font-bold">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
