import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Bell,
  Search,
  Car,
  Tag,
  Shield,
  CreditCard,
  Wrench,
  Navigation,
  ArrowRight,
  Heart,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCars } from '@/services/carsApi'
import { cn } from '@/lib/utils'

// ─── Curated High-Resolution Studio Automotive Images ─────────────────────────
const FALLBACK_CAR_IMAGES = [
  '/cars/bmw-3-series.jpg',
  '/cars/luxury-suv.jpg',
  '/hero-banner-car.jpg',
  '/hero-car.jpg',
]

// ─── 6 Services matching Reference Design ─────────────────────────────────────
const SERVICES = [
  { id: 'buy', label: 'Buy Cars', to: '/cars', icon: Car },
  { id: 'sell', label: 'Sell Car', to: '/sell', icon: Tag },
  { id: 'insurance', label: 'Insurance', to: '/insurance', icon: Shield },
  { id: 'finance', label: 'Finance', to: '/finance', icon: CreditCard },
  { id: 'service', label: 'Service', to: '/service', icon: Wrench },
  { id: 'ride', label: 'Ride Booking', to: '/ride', icon: Navigation },
]

// ─── Compact Featured Car Card ────────────────────────────────────────────────
function FeaturedCarCard({ car, index = 0 }) {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)

  const imageSrc =
    car.images?.[0] && car.images[0].startsWith('http')
      ? car.images[0]
      : FALLBACK_CAR_IMAGES[index % FALLBACK_CAR_IMAGES.length]

  const formatPrice = (val) => {
    if (!val) return '₹ 32,50,000'
    const num = Number(val)
    if (isNaN(num)) return '₹ 32,50,000'
    return `₹ ${num.toLocaleString('en-IN')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => navigate(`/cars/${car.id || ''}`)}
      className="flex-shrink-0 w-64 bg-[#141414] border border-[#242424] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-orange-500/30 group shadow-lg"
    >
      {/* Car Image Container with Gradient Overlay */}
      <div className="relative h-36 bg-[#0D0D0D] overflow-hidden">
        <img
          src={imageSrc}
          alt={`${car.brand || 'Luxury'} ${car.model || 'Car'}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = FALLBACK_CAR_IMAGES[index % FALLBACK_CAR_IMAGES.length]
          }}
        />

        {/* Ambient Dark Gradient on bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/20" />

        {/* "Popular" Badge */}
        <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(249,115,22,0.4)] tracking-wide">
          Popular
        </span>

        {/* Heart Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-90"
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5 transition-colors',
              isLiked ? 'text-red-500 fill-red-500' : 'text-white'
            )}
          />
        </button>
      </div>

      {/* Info Container */}
      <div className="p-3.5 pt-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm truncate leading-snug">
              {car.brand || 'BMW'} {car.model || '3 Series'}
            </h3>
            <p className="text-[#888888] text-[11px] font-medium mt-0.5">
              {car.year || '2021'} • {car.fuel_type || 'Petrol'} • {car.transmission || 'Automatic'}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#222222] flex items-center justify-between">
          <span className="text-white font-extrabold text-sm tracking-tight">
            {formatPrice(car.price)}
          </span>
          <span className="text-orange-400 text-[11px] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Fallback Curated Cars (Shows instant rich showroom if DB is loading/empty) ──
const SHOWROOM_FALLBACK_CARS = [
  {
    id: 'demo-bmw-3',
    brand: 'BMW',
    model: '3 Series',
    year: '2021',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    price: 3250000,
    featured: true,
  },
  {
    id: 'demo-creta',
    brand: 'Hyundai',
    model: 'Creta SX(O)',
    year: '2022',
    fuel_type: 'Diesel',
    transmission: 'Manual',
    price: 1375000,
    featured: true,
  },
  {
    id: 'demo-xuv',
    brand: 'Mahindra',
    model: 'XUV700 AX7',
    year: '2022',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    price: 1890000,
    featured: true,
  },
]

// ─── MobileHomePage Component ─────────────────────────────────────────────────
export function MobileHomePage() {
  const { user, profile, unreadNotificationsCount = 0 } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Always start scrolled to the very top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let mounted = true
    fetchCars({ limit: 6, sortBy: 'newest' })
      .then(({ data, error }) => {
        if (!mounted) return
        if (!error && data && data.length > 0) {
          setCars(data)
        } else {
          setCars(SHOWROOM_FALLBACK_CARS)
        }
      })
      .catch(() => {
        if (mounted) {
          setCars(SHOWROOM_FALLBACK_CARS)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/cars?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/cars')
    }
  }

  const displayLocation = profile?.location || 'Amritsar'

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white pb-32 selection:bg-orange-500/30">
      {/* ── Top Bar (Location Selector + Notifications + User Avatar) ── */}
      <div className="bg-[#0A0A0A] px-4 pt-11 pb-2">
        <div className="flex items-center justify-between">
          {/* Location Chip */}
          <button
            onClick={() => navigate('/cars')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 bg-[#161616] border border-[#262626] px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>{displayLocation}</span>
            <ChevronRight className="w-3 h-3 text-zinc-500 rotate-90" />
          </button>

          {/* Right: Notification Bell + Profile Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-transform"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-[#0A0A0A]">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-[#0A0A0A] opacity-0" />
              )}
            </button>

            <Link to="/mobile-profile">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-[0_0_14px_rgba(249,115,22,0.4)] border border-orange-400/30 active:scale-95 transition-transform">
                {(profile?.full_name || user?.email || 'C')[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </div>

        {/* Brand Logo Row */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.5)]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight font-sans">
            Cardom
          </span>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="px-4 pt-2 space-y-4">
        {/* ── Hero Banner Card with Glowing Car & Amber Ambience ── */}
        <div className="relative rounded-3xl overflow-hidden border border-[#282828] bg-[#121212] shadow-2xl min-h-[160px] flex items-center">
          {/* Ambient Orange Glow Effect */}
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-500/25 blur-[70px] pointer-events-none"
          />

          {/* Background Car Graphic positioned on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-[58%] pointer-events-none overflow-hidden flex items-center justify-end">
            <img
              src="/hero-banner-car.jpg"
              alt="Luxury Sports Car"
              className="w-full h-full object-cover object-left opacity-95 scale-105"
            />
            {/* Smooth gradient blend into the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-5 pr-2 max-w-[62%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400 mb-2 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Automotive Hub
            </span>
            <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
              Find Your<br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Perfect Ride
              </span>
            </h1>
            <p className="text-[#A1A1AA] text-[11px] font-medium mt-1.5 leading-relaxed">
              Buy • Sell • Finance • Insurance<br />
              Service • More
            </p>
          </div>
        </div>

        {/* ── Search Bar with Orange Icon Button ── */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars, brands, models..."
              className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#242424] rounded-2xl text-xs font-medium text-white placeholder:text-[#555555] focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-11 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.35)] flex-shrink-0"
          >
            <Search className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </form>

        {/* ── 6 Service Grid (2 rows x 3 cols, Dark Cohesive Aesthetic) ── */}
        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.id}
                to={s.to}
                className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl bg-[#141414] border border-[#222222] hover:border-orange-500/40 active:scale-[0.96] transition-all group shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              >
                {/* Rounded Icon Squircle */}
                <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] border border-[#2C2C2C] group-hover:border-orange-500/50 group-hover:bg-orange-500/10 flex items-center justify-center transition-all mb-2 shadow-inner">
                  <Icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-zinc-200 text-center leading-tight tracking-tight">
                  {s.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* ── Featured Cars Horizontal Showcase ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Featured Cars
            </h2>
            <Link
              to="/cars"
              className="text-orange-400 text-xs font-bold flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-smooth">
            {(cars.length > 0 ? cars : SHOWROOM_FALLBACK_CARS).map((car, idx) => (
              <FeaturedCarCard key={car.id || idx} car={car} index={idx} />
            ))}
          </div>
        </div>

        {/* ── Quick Ride Banner (Matching Reference Flow) ── */}
        <div className="pt-1">
          <Link
            to="/ride"
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#161616] to-[#121212] border border-orange-500/25 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                <Navigation className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-extrabold text-sm">Need a Fast Ride?</p>
                <p className="text-[#888888] text-[11px] font-medium">Economy, Comfort & XL rides available now</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-400 font-bold text-xs">
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

