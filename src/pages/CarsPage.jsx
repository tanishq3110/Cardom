import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Car,
  ChevronDown,
  Filter,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { CarCard } from '@/components/CarCard'
import { fetchCars, fetchDistinctBrands, fetchCarsByIds } from '@/services/carsApi'
import { getRecentlyViewedIds } from '@/utils/recentlyViewed'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function CarCardSkeleton() {
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

// ─── Constants & Options ──────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [
  CURRENT_YEAR,
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 4,
  CURRENT_YEAR - 5,
  CURRENT_YEAR - 6,
  CURRENT_YEAR - 8,
  CURRENT_YEAR - 10,
  CURRENT_YEAR - 15,
]

const FUEL_OPTIONS = [
  { label: 'All Fuel Types', value: 'All' },
  { label: 'Petrol', value: 'Petrol' },
  { label: 'Diesel', value: 'Diesel' },
  { label: 'Electric', value: 'Electric' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'CNG', value: 'CNG' },
]

const TRANSMISSION_OPTIONS = [
  { label: 'All Transmissions', value: 'All' },
  { label: 'Automatic', value: 'Automatic' },
  { label: 'Manual', value: 'Manual' },
  { label: 'AMT', value: 'AMT' },
  { label: 'CVT', value: 'CVT' },
  { label: 'DCT', value: 'DCT' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Year: Newest', value: 'year_desc' },
  { label: 'Year: Oldest', value: 'year_asc' },
  { label: 'Mileage: Low to High', value: 'mileage_asc' },
  { label: 'Mileage: High to Low', value: 'mileage_desc' },
]

const ITEMS_PER_PAGE = 12

// ─── Helper for Rupee formatting ──────────────────────────────────────────────
function formatLakhsHelper(lakhs) {
  const num = Number(lakhs)
  if (!num || isNaN(num) || num <= 0) return ''
  if (num >= 100) {
    return `₹${(num / 100).toFixed(2)} Cr`
  }
  return `₹${num.toLocaleString('en-IN')} Lakh`
}

// ─── CarsPage Component ──────────────────────────────────────────────────────

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initial values from URL query parameters
  const initialQ = searchParams.get('q') || searchParams.get('search') || ''
  const initialBrand = searchParams.get('brand') || 'All'
  const initialMinPrice = searchParams.get('minPrice') || ''
  const initialMaxPrice = searchParams.get('maxPrice') || ''
  const initialMinYear = searchParams.get('minYear') || 'all'
  const initialMaxYear = searchParams.get('maxYear') || 'all'
  const initialFuel = searchParams.get('fuel') || 'All'
  const initialTransmission = searchParams.get('transmission') || 'All'
  const initialLocation = searchParams.get('location') || ''
  const initialSort = searchParams.get('sort') || 'newest'
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1

  // Filter & Search States
  const [searchInput, setSearchInput] = useState(initialQ)
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ)
  const [selectedBrand, setSelectedBrand] = useState(initialBrand)
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [selectedMinYear, setSelectedMinYear] = useState(initialMinYear)
  const [selectedMaxYear, setSelectedMaxYear] = useState(initialMaxYear)
  const [selectedFuel, setSelectedFuel] = useState(initialFuel)
  const [selectedTransmission, setSelectedTransmission] = useState(initialTransmission)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [sortBy, setSortBy] = useState(initialSort)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Dynamic Brands State
  const [availableBrands, setAvailableBrands] = useState(['All'])

  // Mobile Filter Drawer Toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Data, Loading, & Error States
  const [cars, setCars] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentlyViewedCars, setRecentlyViewedCars] = useState([])

  // Request race-condition counter
  const requestIdRef = useRef(0)

  // ── 0. Fetch Recently Viewed Cars (max 8) from localStorage ──
  useEffect(() => {
    let isMounted = true
    const ids = getRecentlyViewedIds()
    if (ids && ids.length > 0) {
      fetchCarsByIds(ids).then(({ data }) => {
        if (isMounted && data && data.length > 0) {
          setRecentlyViewedCars(data.slice(0, 8))
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [])

  // ── 1. Fetch Dynamic Brands from public.cars ──
  useEffect(() => {
    let isMounted = true
    async function loadBrands() {
      const { data } = await fetchDistinctBrands()
      if (isMounted && data && data.length > 0) {
        setAvailableBrands(['All', ...data])
      }
    }
    loadBrands()
    return () => {
      isMounted = false
    }
  }, [])

  // ── 2. Debounce Search Input (350ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ── 3. Synchronize URL query parameters ──
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedBrand && selectedBrand !== 'All') params.set('brand', selectedBrand)
    if (minPrice) params.set('minPrice', String(minPrice))
    if (maxPrice) params.set('maxPrice', String(maxPrice))
    if (selectedMinYear && selectedMinYear !== 'all') params.set('minYear', String(selectedMinYear))
    if (selectedMaxYear && selectedMaxYear !== 'all') params.set('maxYear', String(selectedMaxYear))
    if (selectedFuel && selectedFuel !== 'All') params.set('fuel', selectedFuel)
    if (selectedTransmission && selectedTransmission !== 'All') {
      params.set('transmission', selectedTransmission)
    }
    if (selectedLocation && selectedLocation.trim()) {
      params.set('location', selectedLocation.trim())
    }
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', String(currentPage))

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true })
    }
  }, [
    debouncedSearch,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedMinYear,
    selectedMaxYear,
    selectedFuel,
    selectedTransmission,
    selectedLocation,
    sortBy,
    currentPage,
    searchParams,
    setSearchParams,
  ])

  // ── 4. Main Data Fetching ──
  const loadCars = useCallback(async () => {
    const currentReqId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    const filters = {
      search: debouncedSearch,
      brand: selectedBrand,
      minPrice,
      maxPrice,
      minYear: selectedMinYear,
      maxYear: selectedMaxYear,
      fuel: selectedFuel,
      transmission: selectedTransmission,
      location: selectedLocation,
      sortBy,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }

    const result = await fetchCars(filters)

    // Prevent race conditions where an older request resolves after a newer one
    if (currentReqId !== requestIdRef.current) return

    if (result.error) {
      setError('Unable to load cars.')
      setCars([])
      setTotalCount(0)
    } else {
      setCars(result.data || [])
      setTotalCount(result.count ?? (result.data ? result.data.length : 0))
    }

    setLoading(false)
  }, [
    debouncedSearch,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedMinYear,
    selectedMaxYear,
    selectedFuel,
    selectedTransmission,
    selectedLocation,
    sortBy,
    currentPage,
  ])

  useEffect(() => {
    loadCars()
  }, [loadCars])

  // ── Active Filter Count ──
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (debouncedSearch) count++
    if (selectedBrand !== 'All') count++
    if (minPrice !== '') count++
    if (maxPrice !== '') count++
    if (selectedMinYear !== 'all') count++
    if (selectedMaxYear !== 'all') count++
    if (selectedFuel !== 'All') count++
    if (selectedTransmission !== 'All') count++
    if (selectedLocation.trim() !== '') count++
    return count
  }, [
    debouncedSearch,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedMinYear,
    selectedMaxYear,
    selectedFuel,
    selectedTransmission,
    selectedLocation,
  ])

  // ── Reset All Filters ──
  const handleClearFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setSelectedBrand('All')
    setMinPrice('')
    setMaxPrice('')
    setSelectedMinYear('all')
    setSelectedMaxYear('all')
    setSelectedFuel('All')
    setSelectedTransmission('All')
    setSelectedLocation('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  // ── Pagination Math ──
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  // ── Filter Controls Component (Reused on Desktop & Mobile Drawer) ──
  const FilterControls = () => (
    <div className="space-y-6 text-left">
      {/* Brand Filter */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Brand
          </label>
          {selectedBrand !== 'All' && (
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('All')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                setSelectedBrand(b)
                setCurrentPage(1)
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                selectedBrand === b
                  ? 'bg-orange-500 text-white font-semibold shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:text-white',
              )}
            >
              {b === 'All' ? 'All Brands' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Price Range (₹ Lakhs)
          </label>
          {(minPrice !== '' || maxPrice !== '') && (
            <button
              type="button"
              onClick={() => {
                setMinPrice('')
                setMaxPrice('')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min Lakhs"
                value={minPrice !== '' ? minPrice / 100000 : ''}
                onChange={(e) => {
                  const val = e.target.value
                  setMinPrice(val !== '' ? Number(val) * 100000 : '')
                  setCurrentPage(1)
                }}
                className="w-full pl-6 pr-2 py-2 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            {minPrice !== '' && (
              <p className="text-[10px] text-orange-400/90 font-mono mt-1">
                {formatLakhsHelper(minPrice / 100000)}
              </p>
            )}
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max Lakhs"
                value={maxPrice !== '' ? maxPrice / 100000 : ''}
                onChange={(e) => {
                  const val = e.target.value
                  setMaxPrice(val !== '' ? Number(val) * 100000 : '')
                  setCurrentPage(1)
                }}
                className="w-full pl-6 pr-2 py-2 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            {maxPrice !== '' && (
              <p className="text-[10px] text-orange-400/90 font-mono mt-1">
                {formatLakhsHelper(maxPrice / 100000)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Model Year Range (Min / Max Year) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Model Year
          </label>
          {(selectedMinYear !== 'all' || selectedMaxYear !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedMinYear('all')
                setSelectedMaxYear('all')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Min Year */}
          <div className="relative">
            <select
              value={selectedMinYear}
              onChange={(e) => {
                setSelectedMinYear(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full appearance-none px-3 py-2 rounded-lg text-xs bg-black/60 border border-white/10 text-zinc-200 cursor-pointer focus:outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-[#111111] text-white">
                Min: Any
              </option>
              {YEAR_OPTIONS.map((yr) => (
                <option key={`min-${yr}`} value={yr} className="bg-[#111111] text-white">
                  From {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Max Year */}
          <div className="relative">
            <select
              value={selectedMaxYear}
              onChange={(e) => {
                setSelectedMaxYear(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full appearance-none px-3 py-2 rounded-lg text-xs bg-black/60 border border-white/10 text-zinc-200 cursor-pointer focus:outline-none focus:border-orange-500"
            >
              <option value="all" className="bg-[#111111] text-white">
                Max: Any
              </option>
              {YEAR_OPTIONS.map((yr) => (
                <option key={`max-${yr}`} value={yr} className="bg-[#111111] text-white">
                  Up to {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Fuel Type
          </label>
          {selectedFuel !== 'All' && (
            <button
              type="button"
              onClick={() => {
                setSelectedFuel('All')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FUEL_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setSelectedFuel(f.value)
                setCurrentPage(1)
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                selectedFuel === f.value
                  ? 'bg-orange-500 text-white font-semibold shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Transmission
          </label>
          {selectedTransmission !== 'All' && (
            <button
              type="button"
              onClick={() => {
                setSelectedTransmission('All')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TRANSMISSION_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setSelectedTransmission(t.value)
                setCurrentPage(1)
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                selectedTransmission === t.value
                  ? 'bg-orange-500 text-white font-semibold shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Location
          </label>
          {selectedLocation.trim() !== '' && (
            <button
              type="button"
              onClick={() => {
                setSelectedLocation('')
                setCurrentPage(1)
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="City or state... (e.g. Delhi)"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-8 pr-8 py-2 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
          />
          {selectedLocation && (
            <button
              type="button"
              onClick={() => {
                setSelectedLocation('')
                setCurrentPage(1)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Clear All Filters Button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-orange-400 border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Background Grid & Ambient Glow ── */}
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-orange-500/[0.07] blur-[120px]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── 1. Marketplace Header ── */}
          <div className="max-w-3xl mb-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-4">
              <Car className="w-3.5 h-3.5" />
              Automotive Marketplace
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
              Find Your{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                Next Drive.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mb-6">
              Explore verified performance, luxury, and electric vehicles with real-time filtering,
              transparent pricing, and authenticated ownership.
            </p>

            {/* Prominent Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setDebouncedSearch(searchInput.trim())
                setCurrentPage(1)
              }}
              className="relative max-w-2xl"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by brand or model..."
                className={cn(
                  'w-full pl-12 pr-20 py-3.5 rounded-xl text-sm font-medium',
                  'bg-[#111111]/90 border border-white/10 text-white placeholder:text-zinc-500',
                  'shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
                  'focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500',
                  'transition-all duration-200',
                )}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setDebouncedSearch('')
                    setCurrentPage(1)
                  }}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* ── 2. Results Header + Sort Controls ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 mb-6 border-y border-white/[0.06]">
            {/* Results Count */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {loading ? 'Searching...' : `${totalCount} ${totalCount === 1 ? 'car' : 'cars'} found`}
              </span>
              {!loading && activeFilterCount > 0 && (
                <span className="text-xs text-orange-400 font-mono">
                  ({activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Mobile Filter Button & Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className={cn(
                  'lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold',
                  'border border-white/10 bg-[#111111] text-zinc-300 hover:text-white hover:border-orange-500/40',
                  'transition-colors cursor-pointer',
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 hidden md:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setCurrentPage(1)
                    }}
                    className={cn(
                      'appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-medium',
                      'bg-[#111111] border border-white/10 text-zinc-200 cursor-pointer',
                      'focus:outline-none focus:border-orange-500',
                      'transition-colors',
                    )}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Active Filter Chips ── */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-left">
              <span className="text-xs text-zinc-500 mr-1">Applied:</span>

              {/* Search Query Chip */}
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <span>Search: &ldquo;{debouncedSearch}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setDebouncedSearch('')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Brand Chip */}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <span>{selectedBrand}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand('All')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Price Range Chip */}
              {(minPrice !== '' || maxPrice !== '') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <span>
                    {minPrice !== '' && maxPrice !== ''
                      ? `${formatLakhsHelper(minPrice / 100000)} – ${formatLakhsHelper(maxPrice / 100000)}`
                      : minPrice !== ''
                        ? `Min ${formatLakhsHelper(minPrice / 100000)}`
                        : `Max ${formatLakhsHelper(maxPrice / 100000)}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('')
                      setMaxPrice('')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Year Chip */}
              {(selectedMinYear !== 'all' || selectedMaxYear !== 'all') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <span>
                    {selectedMinYear !== 'all' && selectedMaxYear !== 'all'
                      ? `${selectedMinYear} – ${selectedMaxYear}`
                      : selectedMinYear !== 'all'
                        ? `${selectedMinYear}+`
                        : `Up to ${selectedMaxYear}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMinYear('all')
                      setSelectedMaxYear('all')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Fuel Chip */}
              {selectedFuel !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <span>{selectedFuel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFuel('All')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Transmission Chip */}
              {selectedTransmission !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <span>{selectedTransmission}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTransmission('All')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Location Chip */}
              {selectedLocation.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-zinc-200">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span>{selectedLocation}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation('')
                      setCurrentPage(1)
                    }}
                    className="hover:text-white ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Clear All Action */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold ml-1 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {/* ── 4. Main Grid Layout (Left: Desktop Filters, Right: Cars) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Left Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-24 p-5 rounded-2xl border border-white/[0.07] bg-[#0c0c0c]/90 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <FilterControls />
            </aside>

            {/* Right Side Vehicle Results Grid */}
            <div className="lg:col-span-9">
              {loading ? (
                /* ── Loading Skeleton State ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CarCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                /* ── Error State ── */
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 px-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] text-center max-w-lg mx-auto my-10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Unable to load cars.</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                    We could not retrieve marketplace listings right now. Please try again.
                  </p>
                  <button
                    type="button"
                    onClick={loadCars}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </motion.div>
              ) : cars.length > 0 ? (
                /* ── Cars Listing ── */
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cars.map((car, index) => (
                      <CarCard key={car.id} car={car} delay={Math.min(index * 0.05, 0.25)} />
                    ))}
                  </div>

                  {/* ── Pagination Controls ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-8 pb-4 border-t border-white/[0.06]">
                      <button
                        type="button"
                        disabled={currentPage <= 1 || loading}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1))
                          window.scrollTo({ top: 300, behavior: 'smooth' })
                        }}
                        className={cn(
                          'inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                          'border border-white/10 bg-[#111111] text-zinc-300 hover:text-white hover:border-orange-500/40',
                          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10',
                        )}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>

                      <span className="text-xs font-medium text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                        <span className="text-white font-semibold">{totalPages}</span>
                      </span>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                          window.scrollTo({ top: 300, behavior: 'smooth' })
                        }}
                        className={cn(
                          'inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                          'border border-white/10 bg-[#111111] text-zinc-300 hover:text-white hover:border-orange-500/40',
                          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/10',
                        )}
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Empty State ── */
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-12"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
                    <Car className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No vehicles found</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer shadow-[0_0_16px_rgba(249,115,22,0.3)]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Recently Viewed Vehicles Section ── */}
          {recentlyViewedCars.length > 0 && (
            <section className="mt-16 pt-10 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Recently Viewed
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Vehicles you previously inspected on Cardom
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {recentlyViewedCars.map((rvCar, idx) => (
                  <CarCard key={rvCar.id} car={rvCar} delay={Math.min(idx * 0.05, 0.25)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ── Mobile Filter Drawer (Slide-Over) ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0d0d0d] border-l border-white/10 z-50 p-6 overflow-y-auto lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">Filter Cars</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <FilterControls />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex-shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-orange-500 text-white text-center hover:bg-orange-600 transition-colors cursor-pointer shadow-[0_0_16px_rgba(249,115,22,0.3)]"
                >
                  Apply Filters ({totalCount} results)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
