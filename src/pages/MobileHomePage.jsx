import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { fetchCars } from '@/services/carsApi'
import { cn } from '@/lib/utils'

// Fallback showroom cars for instant display if database is loading/empty
const SHOWROOM_FALLBACK_CARS = [
  {
    id: 'demo-bmw-3',
    brand: 'BMW',
    model: '3 Series 330i M Sport',
    year: '2021',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    mileage: '32,500 km',
    price: 3250000,
    location: 'Amritsar SuperHub',
    images: ['/cars/bmw-3-series.jpg'],
    score: 9.6,
    owners: '1st Owner',
  },
  {
    id: 'demo-creta',
    brand: 'Hyundai',
    model: 'Creta SX(O) Executive',
    year: '2022',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    mileage: '24,100 km',
    price: 1485000,
    location: 'Ludhiana SuperHub',
    images: ['/cars/luxury-suv.jpg'],
    score: 9.4,
    owners: '1st Owner',
  },
  {
    id: 'demo-xuv',
    brand: 'Mahindra',
    model: 'XUV700 AX7 Luxury AWD',
    year: '2022',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    mileage: '28,000 km',
    price: 1890000,
    location: 'Chandigarh SuperHub',
    images: ['/hero-banner-car.jpg'],
    score: 9.5,
    owners: '1st Owner',
  },
  {
    id: 'demo-tata-nexon',
    brand: 'Tata',
    model: 'Nexon EV Empowered Plus',
    year: '2023',
    fuel_type: 'Electric',
    transmission: 'Automatic',
    mileage: '14,200 km',
    price: 1540000,
    location: 'Jalandhar SuperHub',
    images: ['/hero-car.jpg'],
    score: 9.7,
    owners: '1st Owner',
  },
]

// Popular Indian automotive brands
const POPULAR_BRANDS = [
  { name: 'Tata', icon: 'directions_car' },
  { name: 'Mahindra', icon: 'local_shipping' },
  { name: 'Maruti', icon: 'speed' },
  { name: 'Hyundai', icon: 'commute' },
  { name: 'Kia', icon: 'electric_car' },
  { name: 'Toyota', icon: 'car_repair' },
  { name: 'Honda', icon: 'minor_crash' },
  { name: 'BMW', icon: 'stars' },
]

// Quick filter tags matching Stitch
const QUICK_TAGS = [
  { label: 'EV Cars', filter: 'Electric' },
  { label: 'Compact SUV', filter: 'SUV' },
  { label: 'Hot Deals', filter: 'Hot Deals' },
  { label: '1st Owner', filter: '1st Owner' },
  { label: 'Sunroof', filter: 'Sunroof' },
  { label: 'Under ₹10L', filter: '1000000' },
]

// Shop by budget brackets
const BUDGET_BRACKETS = [
  { label: 'Under ₹5L', max: 500000 },
  { label: '₹5 – 10L', min: 500000, max: 1000000, popular: true },
  { label: '₹10 – 20L', min: 1000000, max: 2000000 },
  { label: 'Above ₹20L', min: 2000000 },
]

export function MobileHomePage() {
  const { user, profile, unreadNotificationsCount = 0 } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBudget, setActiveBudget] = useState('₹5 – 10L')

  useEffect(() => {
    window.scrollTo(0, 0)
    let mounted = true
    fetchCars({ limit: 8, sortBy: 'newest' })
      .then(({ data, error }) => {
        if (!mounted) return
        if (!error && data && data.length > 0) {
          setCars(data)
        } else {
          setCars(SHOWROOM_FALLBACK_CARS)
        }
      })
      .catch(() => {
        if (mounted) setCars(SHOWROOM_FALLBACK_CARS)
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

  const formatPriceLakh = (amount) => {
    const num = Number(amount) || 0
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`
    }
    return `₹${(num / 100000).toFixed(2)} Lakh`
  }

  const calculateEmi = (amount) => {
    const num = Number(amount) || 0
    // Rough estimate: ~₹1,240 per lakh for 7 years @ 8.5%
    const lakhs = num / 100000
    const emi = Math.round(lakhs * 1240)
    return emi > 0 ? emi.toLocaleString('en-IN') : '14,850'
  }

  const displayLocation = profile?.location || 'Amritsar, PB'

  return (
    <div className="min-h-dvh bg-[#131313] text-[#e5e2e1] pb-24 selection:bg-[#ff6a00] selection:text-black">
      {/* ── Fixed Top Header Bar ── */}
      <header className="sticky top-0 inset-x-0 z-40 bg-[#131313]/90 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff6a00] flex items-center justify-center shadow-[0_0_14px_rgba(255,106,0,0.5)]">
              <span className="material-symbols-outlined text-[20px] text-black font-black">
                electric_bolt
              </span>
            </div>
            <span className="font-display text-xl font-black text-white tracking-tight">
              CARDOM
            </span>
          </Link>

          {/* Location Selector Chip */}
          <button
            onClick={() => navigate('/cars')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] transition-colors border border-white/5 text-xs text-[#e5e2e1] font-medium"
          >
            <span className="material-symbols-outlined text-[#ff6a00] text-[16px]">
              location_on
            </span>
            <span className="truncate max-w-[110px]">{displayLocation}</span>
            <span className="material-symbols-outlined text-[#c6c6c7] text-[14px]">
              expand_more
            </span>
          </button>

          {/* Right Action Icons: Notification Bell & Profile Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] transition-colors border border-white/5"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff6a00] ring-2 ring-[#131313]" />
              )}
            </button>

            <Link
              to="/mobile-profile"
              className="w-10 h-10 rounded-full overflow-hidden bg-[#201f1f] border border-[#ff6a00]/30 flex items-center justify-center text-xs font-bold text-white shadow-sm"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#ff6a00] to-amber-500 flex items-center justify-center font-black text-black">
                  {(profile?.full_name || user?.email || 'C')[0].toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Column ── */}
      <main className="max-w-lg mx-auto px-4 pt-3 space-y-6">
        {/* ── Search Bar Module with Mic & Filters ── */}
        <section>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-[#201f1f] border border-white/10 rounded-2xl p-1.5 shadow-lg focus-within:border-[#ff6a00] transition-colors"
          >
            <div className="flex items-center flex-1 pl-2.5">
              <span className="material-symbols-outlined text-[#c6c6c7] text-[22px] mr-2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 3,450+ verified pre-owned cars..."
                className="w-full bg-transparent text-xs text-white placeholder-[#888888] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/cars')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#c6c6c7] hover:text-white transition-colors"
              title="Voice Search"
            >
              <span className="material-symbols-outlined text-[19px]">mic</span>
            </button>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-[#ff6a00] text-black flex items-center justify-center shadow-[0_2px_10px_rgba(255,106,0,0.3)] transition-transform active:scale-95"
              title="Apply Filters"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">tune</span>
            </button>
          </form>

          {/* Quick Filter Horizontal Scroll Rail */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 -mx-4 px-4">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.label}
                onClick={() => navigate(`/cars?q=${encodeURIComponent(tag.filter)}`)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-white/5 text-[11px] font-medium text-[#c6c6c7] hover:text-white transition-colors active:scale-95"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Certified Pre-Owned Studio Hero Card ── */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1b1b] via-[#201f1f] to-[#0e0e0e] border border-white/10 shadow-2xl p-5">
          {/* Ambient Glow */}
          <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#ff6a00]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#4ae176] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ae176]">
              100% Quality Assured Studio
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl font-black text-white leading-tight">
            Certified Pre-Owned Studio
          </h2>
          <p className="text-xs text-[#c6c6c7] mt-1 leading-relaxed max-w-[85%]">
            Every car digitally inspected with 180+ point safety check, 7-day money-back guarantee, and 1-year pan-India warranty.
          </p>

          {/* 3 Quick Value Badges */}
          <div className="grid grid-cols-3 gap-2 py-3.5 my-2 border-y border-white/5">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[#ff6a00] text-[18px]">
                verified
              </span>
              <span className="text-[10px] text-white font-bold mt-1">180+ Point</span>
              <span className="text-[9px] text-[#c6c6c7]">Inspection</span>
            </div>
            <div className="flex flex-col items-center text-center border-x border-white/5">
              <span className="material-symbols-outlined text-[#4ae176] text-[18px]">
                published_with_changes
              </span>
              <span className="text-[10px] text-white font-bold mt-1">7 Days Return</span>
              <span className="text-[9px] text-[#c6c6c7]">100% Refund</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[#ff6a00] text-[18px]">
                assignment_turned_in
              </span>
              <span className="text-[10px] text-white font-bold mt-1">Free RC Transfer</span>
              <span className="text-[9px] text-[#c6c6c7]">Doorstep Pickup</span>
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => navigate('/cars')}
              className="py-2.5 px-4 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <span>Explore Showroom</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="py-2.5 px-4 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ff6a00]">
                calculate
              </span>
              <span>Value My Car</span>
            </button>
          </div>
        </section>

        {/* ── Popular Brands 4-Column Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-extrabold text-white tracking-tight">
              Popular Brands
            </h3>
            <Link
              to="/cars"
              className="text-xs text-[#ff6a00] font-bold hover:underline flex items-center gap-0.5"
            >
              View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {POPULAR_BRANDS.map((brand) => (
              <button
                key={brand.name}
                onClick={() => navigate(`/cars?brand=${encodeURIComponent(brand.name)}`)}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-[#1c1b1b] border border-white/5 hover:border-[#ff6a00]/40 active:scale-95 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#201f1f] group-hover:bg-[#ff6a00]/10 border border-white/5 group-hover:border-[#ff6a00]/30 flex items-center justify-center text-[#ff6a00] transition-colors mb-1.5">
                  <span className="material-symbols-outlined text-[22px]">
                    {brand.icon}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#e5e2e1] group-hover:text-white truncate">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Shop by Budget Rail ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-extrabold text-white tracking-tight">
              Shop by Budget
            </h3>
            <span className="text-[11px] text-[#c6c6c7]">Curated price brackets</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4">
            {BUDGET_BRACKETS.map((bracket) => {
              const isSelected = activeBudget === bracket.label
              return (
                <button
                  key={bracket.label}
                  onClick={() => {
                    setActiveBudget(bracket.label)
                    navigate(
                      `/cars?${bracket.min ? `min_price=${bracket.min}&` : ''}${
                        bracket.max ? `max_price=${bracket.max}` : ''
                      }`
                    )
                  }}
                  className={cn(
                    'flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all relative',
                    isSelected
                      ? 'bg-[#ff6a00] text-black border-[#ff6a00] shadow-md shadow-orange-500/20'
                      : 'bg-[#1c1b1b] text-[#e5e2e1] border-white/10 hover:border-white/20'
                  )}
                >
                  {bracket.popular && !isSelected && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-[#ff6a00] text-[9px] font-black text-black">
                      POPULAR
                    </span>
                  )}
                  {bracket.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Cardom Certified Vehicles Carousel ── */}
        <section className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-base font-extrabold text-white tracking-tight">
                Cardom Certified Studio
              </h3>
              <p className="text-[11px] text-[#c6c6c7]">
                Ready for immediate delivery & free doorstep test drive
              </p>
            </div>
            <Link
              to="/cars"
              className="text-xs text-[#ff6a00] font-bold hover:underline flex items-center gap-0.5"
            >
              All Cars <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {(cars.length > 0 ? cars.slice(0, 4) : SHOWROOM_FALLBACK_CARS).map((car, idx) => {
              const imageSrc =
                car.images?.[0] || car.image_url || '/cars/bmw-3-series.jpg'
              const formattedPrice = formatPriceLakh(car.price)
              const emiVal = calculateEmi(car.price)

              return (
                <motion.article
                  key={car.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  onClick={() => navigate(`/cars/${car.id}`)}
                  className="rounded-2xl bg-[#1c1b1b] border border-white/10 overflow-hidden shadow-xl group cursor-pointer hover:border-[#ff6a00]/40 transition-all"
                >
                  {/* 16:10 Image Container */}
                  <div className="relative aspect-[16/10] bg-[#0e0e0e] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/cars/bmw-3-series.jpg'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] via-transparent to-black/30" />

                    {/* Top verified badge pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e0e]/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#4ae176]" />
                      <span>CARDOM VERIFIED {car.score || '9.4'}/10</span>
                    </div>

                    {/* Quick location tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[13px] text-[#ff6a00]">
                        location_on
                      </span>
                      <span>{car.location || displayLocation}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display text-base font-bold text-white line-clamp-1">
                          {car.year || '2021'} {car.brand} {car.model}
                        </h4>
                        <p className="text-xs text-[#c6c6c7] mt-0.5">
                          {car.variant || '1.5 Turbo Dual-Clutch'}
                        </p>
                      </div>
                    </div>

                    {/* 3-Col Key Specs */}
                    <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-[#201f1f] text-center border border-white/5">
                      <div>
                        <p className="text-[10px] text-[#c6c6c7]">Odometer</p>
                        <p className="text-xs font-bold text-white font-mono mt-0.5">
                          {car.mileage || '32,500 km'}
                        </p>
                      </div>
                      <div className="border-x border-white/5">
                        <p className="text-[10px] text-[#c6c6c7]">Fuel & Gear</p>
                        <p className="text-xs font-bold text-white font-mono mt-0.5">
                          {car.fuel_type || car.fuel || 'Petrol'} • {car.transmission === 'Automatic' ? 'Auto' : 'Manual'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#c6c6c7]">Ownership</p>
                        <p className="text-xs font-bold text-white font-mono mt-0.5">
                          {car.owners || '1st Owner'}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-lg font-black text-white">
                            {formattedPrice}
                          </span>
                          <span className="text-[11px] text-[#c6c6c7]">
                            EMI ₹{emiVal}/mo
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#4ae176] bg-[#4ae176]/10 border border-[#4ae176]/20 px-2 py-0.5 rounded">
                        7 Days Return
                      </span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/cars/${car.id}`)
                        }}
                        className="py-2 px-3 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-xs font-bold text-[#e5e2e1] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm text-[#ff6a00]">
                          description
                        </span>
                        <span>Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/cars/${car.id}`)
                        }}
                        className="py-2 px-3 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-xs font-bold text-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">
                          directions_car
                        </span>
                        <span>Book Drive</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        {/* ── Fast Ride Booking Shortcut ── */}
        <section>
          <Link
            to="/ride"
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#201f1f] to-[#1c1b1b] border border-[#ff6a00]/30 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff6a00]/15 border border-[#ff6a00]/30 flex items-center justify-center text-[#ff6a00] group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(255,106,0,0.2)]">
                <span className="material-symbols-outlined text-[22px]">navigation</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-sm">Need a Fast Ride?</p>
                <p className="text-[#c6c6c7] text-[11px]">
                  Economy, Comfort & XL rides available across Punjab
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#ff6a00] font-bold text-xs">
              <span>Book</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </Link>
        </section>

        {/* ── Why 4.8L+ Indians Choose Cardom Trust Cards ── */}
        <section className="pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-extrabold text-white tracking-tight">
              Why 4.8L+ Indians Choose Cardom
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-xl bg-[#1c1b1b] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#201f1f] flex items-center justify-center text-[#ff6a00] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">180+ Point Digital Check</h4>
                <p className="text-[11px] text-[#c6c6c7] mt-0.5">
                  Engine compression, chassis integrity, and zero flood damage check.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1b1b] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#201f1f] flex items-center justify-center text-[#4ae176] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">7 Days Money Back Guarantee</h4>
                <p className="text-[11px] text-[#c6c6c7] mt-0.5">
                  Drive it for a week. If you don't love it, return it with 100% refund.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1b1b] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#201f1f] flex items-center justify-center text-[#ff6a00] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1-Year Pan-India Warranty</h4>
                <p className="text-[11px] text-[#c6c6c7] mt-0.5">
                  Comprehensive engine & gearbox coverage across 400+ cities.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1b1b] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#201f1f] flex items-center justify-center text-[#4ae176] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zero Hidden Charges</h4>
                <p className="text-[11px] text-[#c6c6c7] mt-0.5">
                  Transparent fixed pricing including free RC transfer and paperwork.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
