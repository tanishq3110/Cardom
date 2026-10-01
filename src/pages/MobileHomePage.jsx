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
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCars } from '@/services/carsApi'
import { cn } from '@/lib/utils'

// ─── Service grid items ───────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'buy',
    label: 'Buy Cars',
    to: '/cars',
    icon: Car,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
  },
  {
    id: 'sell',
    label: 'Sell Car',
    to: '/sell',
    icon: Tag,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.25)',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    to: '/insurance',
    icon: Shield,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'finance',
    label: 'Finance',
    to: '/finance',
    icon: CreditCard,
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.25)',
  },
  {
    id: 'service',
    label: 'Service',
    to: '/service',
    icon: Wrench,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    id: 'ride',
    label: 'Ride Booking',
    to: '/ride',
    icon: Navigation,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
  },
]

// ─── Compact Car Card for horizontal scroll ───────────────────────────────────
function FeaturedCarCard({ car }) {
  const navigate = useNavigate()
  const price = car.price
    ? `₹${Number(car.price / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/cars/${car.id}`)}
      className="flex-shrink-0 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Car image */}
      <div className="relative h-32 bg-[#141414]">
        {car.images?.[0] ? (
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-10 h-10 text-zinc-700" />
          </div>
        )}
        {/* Popular badge */}
        {car.featured && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
            Popular
          </span>
        )}
        {/* Heart */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white font-bold text-sm leading-tight truncate">
          {car.brand} {car.model}
        </p>
        <p className="text-[#A1A1AA] text-[11px] mt-0.5">
          {car.year && `${car.year} • `}
          {car.fuel_type && `${car.fuel_type} • `}
          {car.transmission}
        </p>
        <p className="text-orange-400 font-bold text-sm mt-1.5">{price}</p>
      </div>
    </motion.div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-52 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-32 bg-[#252525]" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-[#2A2A2A] rounded w-3/4" />
        <div className="h-2.5 bg-[#252525] rounded w-1/2" />
        <div className="h-3.5 bg-[#2A2A2A] rounded w-2/5" />
      </div>
    </div>
  )
}

// ─── MobileHomePage ───────────────────────────────────────────────────────────
export function MobileHomePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const displayName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCars({ limit: 10, sortBy: 'newest' }).then(({ data, error: err }) => {
      if (!mounted) return
      if (err) setError(err.message)
      else setCars(data || [])
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/cars?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/cars')
    }
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-24">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          {/* Location */}
          <button className="flex items-center gap-1.5 text-sm font-medium text-white">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span>{profile?.location || 'Select City'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500 rotate-90" />
          </button>

          {/* Right: Bell + Avatar */}
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <Link to="/account">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_16px_rgba(249,115,22,0.3)]">
                {(profile?.full_name || user?.email || 'C')[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4">
          {/* ── Hero / Brand ── */}
          <div className="pt-5 pb-2">
            <p className="text-[#A1A1AA] text-sm">
              Hi, {displayName} 👋
            </p>
            <h1 className="text-3xl font-black text-white mt-1 leading-tight">
              Find Your<br />
              <span className="text-orange-500">Perfect Ride</span>
            </h1>
            <p className="text-[#A1A1AA] text-xs mt-1.5 leading-relaxed">
              Buy • Sell • Finance • Insurance • Service • More
            </p>
          </div>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cars, brands, models..."
                  className="w-full pl-10 pr-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-13 h-13 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.35)] active:scale-95 transition-transform px-4"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>

          {/* ── Services Grid ── */}
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {SERVICES.map((service) => {
                const Icon = service.icon
                return (
                  <Link
                    key={service.id}
                    to={service.to}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                    style={{
                      background: service.bg,
                      border: `1px solid ${service.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: service.bg, border: `1px solid ${service.border}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: service.color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-white text-center leading-tight px-1">
                      {service.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Featured Cars ── */}
        <div className="mt-7">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Featured Cars</h2>
            <Link
              to="/cars"
              className="text-orange-400 text-xs font-semibold flex items-center gap-0.5"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal scroll */}
          <div className="pl-4 flex gap-3 overflow-x-auto no-scrollbar pb-2 pr-4">
            {loading ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400 py-4">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Unable to load cars
              </div>
            ) : cars.length > 0 ? (
              cars.map((car) => <FeaturedCarCard key={car.id} car={car} />)
            ) : (
              <div className="text-sm text-zinc-500 py-6">No cars available</div>
            )}
          </div>
        </div>

        {/* ── Quick Ride CTA ── */}
        <div className="px-4 mt-6">
          <Link
            to="/ride"
            className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Book a Ride</p>
                <p className="text-[#A1A1AA] text-[11px] mt-0.5">Economy, Comfort or XL</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <span className="text-xs font-semibold">Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* ── Services Section ── */}
        <div className="px-4 mt-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Our Services</h2>
            <Link to="/service" className="text-orange-400 text-xs font-semibold flex items-center gap-0.5">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Insurance', desc: 'Get the best insurance plans', to: '/insurance', icon: Shield, color: '#3B82F6' },
              { label: 'Finance', desc: 'Flexible loan options', to: '/finance', icon: CreditCard, color: '#A855F7' },
              { label: 'Service & Repair', desc: 'Expert care for your vehicle', to: '/service', icon: Wrench, color: '#F97316' },
              { label: 'Sell Your Car', desc: 'List and sell your car fast', to: '/sell', icon: Tag, color: '#22C55E' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex flex-col gap-2.5 active:scale-[0.98] transition-transform hover:border-[#333]"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">{item.label}</p>
                    <p className="text-[#A1A1AA] text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
