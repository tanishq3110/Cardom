import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Check,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Star,
  Package,
  Cpu,
  Trash2,
  Plus,
  Minus,
  X,
  Sparkles,
  Zap,
  Info,
  Car,
  AlertCircle,
  Clock,
  Layers,
  Disc,
  Wrench,
  BatteryCharging,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import {
  VEHICLE_DATABASE,
  PART_CATEGORIES,
  MOCK_PRODUCTS,
  WHY_CARDOM_PARTS,
  HOW_IT_WORKS_STEPS,
  PARTS_FAQS,
} from '@/data/partsData'
import { cn } from '@/lib/utils'

export function SparePartsPage() {
  // ─── Vehicle Compatibility State ──────────────────────────────────────────
  const [selectedBrand, setSelectedBrand] = useState('BMW')
  const [selectedModel, setSelectedModel] = useState(VEHICLE_DATABASE.BMW.models[0])
  const [selectedYear, setSelectedYear] = useState('2023')
  const [selectedVariant, setSelectedVariant] = useState(VEHICLE_DATABASE.BMW.variants[0])
  const [vehicleActive, setVehicleActive] = useState(false)
  const [activeVehicleInfo, setActiveVehicleInfo] = useState(null)

  // ─── Marketplace Filter State ─────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('All Parts')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recommended')

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [modalProduct, setModalProduct] = useState(null)

  // ─── Cart State ───────────────────────────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([
    { product: MOCK_PRODUCTS[0], quantity: 1 }, // Default 1 item in cart for realistic preview
  ])
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

  // ─── FAQ Accordion State ──────────────────────────────────────────────────
  const [activeFaq, setActiveFaq] = useState(0)

  // Handle Brand Change and reset model/variants
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand)
    const brandData = VEHICLE_DATABASE[brand]
    if (brandData) {
      setSelectedModel(brandData.models[0])
      setSelectedVariant(brandData.variants[0])
    }
  }

  // Handle Find Compatible Parts
  const handleApplyVehicle = (e) => {
    e.preventDefault()
    setVehicleActive(true)
    setActiveVehicleInfo({
      brand: selectedBrand,
      model: selectedModel,
      year: selectedYear,
      variant: selectedVariant,
    })
    // Smooth scroll to marketplace
    document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Cart Management
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const estimatedTax = Math.round(subtotal * 0.18) // 18% GST standard
  const grandTotal = subtotal + estimatedTax

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All Parts' || prod.category.toLowerCase() === selectedCategory.toLowerCase()

      // Search query match
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.brand.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query) ||
        prod.category.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'popular') return b.reviews - a.reviews
      if (sortBy === 'newest') return b.id.localeCompare(a.id)
      return b.rating - a.rating // recommended
    })
  }, [selectedCategory, searchQuery, sortBy])

  // Featured 4 demo picks
  const featuredPicks = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, 4)
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-96 -left-40 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-80 -right-40 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* ─── 1. HERO — PARTS DISCOVERY ───────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Package className="w-3.5 h-3.5" />
                <span>Spare Parts Marketplace</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.1]">
                The Right Part for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">Your Car.</span>
              </h1>

              {/* Supporting text */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                Discover compatible automotive components, compare verified OEM and performance parts, and keep your vehicle primed for the open highway.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Find Parts</span>
                </button>

                <button
                  type="button"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-xl text-sm font-semibold border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>

              {/* Floating Cart Trigger on Mobile / Fast Access */}
              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-400">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:border-orange-500/50 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cart ({cartTotalItems})</span>
                </button>
                <span className="text-zinc-600">|</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Catalog Synced • 12,000+ Verified SKUs
                </span>
              </div>
            </div>

            {/* Right: Futuristic Exploded Parts Blueprint Canvas */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/80 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col justify-between">
                <BorderBeam size={220} duration={10} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Telemetry Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    <span>EXPLODED SCHEMATIC CAD</span>
                  </div>
                  <span className="text-orange-400 font-bold">SPEC: ISO-9001</span>
                </div>

                {/* Blueprint Exploded Components SVG Canvas */}
                <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
                  <svg className="absolute inset-0 w-full h-full stroke-orange-500/25" viewBox="0 0 400 300" fill="none">
                    {/* Concentric Rotating Calibration Rings */}
                    <circle cx="200" cy="150" r="110" strokeDasharray="4 6" strokeWidth="0.8" />
                    <circle cx="200" cy="150" r="80" strokeWidth="1" stroke="rgba(249,115,22,0.4)" />
                    <circle cx="200" cy="150" r="50" strokeDasharray="2 4" strokeWidth="0.8" />
                    <circle cx="200" cy="150" r="20" strokeWidth="1.2" stroke="#f97316" />

                    {/* Exploded Axis Lines */}
                    <line x1="200" y1="30" x2="200" y2="270" strokeDasharray="3 3" strokeWidth="0.6" />
                    <line x1="40" y1="150" x2="360" y2="150" strokeDasharray="3 3" strokeWidth="0.6" />

                    {/* Brake Disc Silhouette (Center Left) */}
                    <g transform="translate(130, 80) scale(0.7)">
                      <circle cx="100" cy="100" r="45" stroke="#f97316" strokeWidth="2" />
                      <circle cx="100" cy="100" r="25" stroke="#f97316" strokeWidth="1.2" />
                      <circle cx="100" cy="100" r="10" stroke="#f97316" strokeWidth="1" />
                      {/* Rotor holes */}
                      <circle cx="80" cy="80" r="3" fill="#f97316" />
                      <circle cx="120" cy="80" r="3" fill="#f97316" />
                      <circle cx="80" cy="120" r="3" fill="#f97316" />
                      <circle cx="120" cy="120" r="3" fill="#f97316" />
                    </g>

                    {/* Connecting callout lines */}
                    <path d="M 120 70 L 60 40 L 40 40" stroke="#f97316" strokeWidth="1.2" />
                    <path d="M 270 90 L 330 60 L 360 60" stroke="#f97316" strokeWidth="1.2" />
                    <path d="M 260 220 L 320 250 L 360 250" stroke="#f97316" strokeWidth="1.2" />
                    <path d="M 110 210 L 60 250 L 30 250" stroke="#f97316" strokeWidth="1.2" />
                  </svg>

                  {/* Component HUD callouts */}
                  <div className="absolute top-4 left-4 bg-black/80 border border-orange-500/40 rounded px-2 py-1 text-[9px] font-mono text-orange-300">
                    <div>#BRK-9902: ROTOR DISC</div>
                    <div className="text-[8px] text-zinc-400">348mm VENTED</div>
                  </div>

                  <div className="absolute top-8 right-4 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-zinc-300">
                    <div>#ENG-4410: AIR FILTER</div>
                    <div className="text-[8px] text-orange-400">HIGH-FLOW CFM</div>
                  </div>

                  <div className="absolute bottom-6 right-6 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-zinc-300">
                    <div>#ELE-8080: AGM BATTERY</div>
                    <div className="text-[8px] text-emerald-400">80Ah / 800 CCA</div>
                  </div>

                  <div className="absolute bottom-6 left-6 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-zinc-300">
                    <div>#SUS-4190: CONTROL ARM</div>
                    <div className="text-[8px] text-orange-400">FORGED ALLOY</div>
                  </div>

                  {/* Center Rotating Reticle */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                    className="w-24 h-24 rounded-full border border-orange-500/40 border-dashed pointer-events-none"
                  />
                </div>

                {/* Floating Diagnostic Card: Cardom Parts Network */}
                <div className="rounded-xl border border-orange-500/40 bg-orange-500/[0.06] p-3.5">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-bold mb-2">
                    Cardom Parts Network
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Compatibility</div>
                      <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">READY</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Categories</div>
                      <div className="text-xs font-bold font-mono text-orange-400 mt-0.5">08 CORE</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Digital Catalog</div>
                      <div className="text-xs font-bold font-mono text-white mt-0.5">CONNECTED</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. VEHICLE COMPATIBILITY SELECTOR ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="rounded-3xl border-2 border-orange-500/50 bg-[#0c0c0c]/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_40px_rgba(249,115,22,0.18)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-orange-400">
                  PRECISION FITMENT GUARANTEE
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                  Start With Your Vehicle
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Select your vehicle specifications to filter parts confirmed for direct bolt-on compatibility.
                </p>
              </div>

              {vehicleActive && activeVehicleInfo && (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Active: {activeVehicleInfo.brand} {activeVehicleInfo.model} ({activeVehicleInfo.year})
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleApplyVehicle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Brand */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                    1. Brand / Make
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {Object.keys(VEHICLE_DATABASE).map((brand) => (
                      <option key={brand} value={brand} className="bg-[#141414]">
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                    2. Model Generation
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {VEHICLE_DATABASE[selectedBrand]?.models.map((model) => (
                      <option key={model} value={model} className="bg-[#141414]">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                    3. Model Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {VEHICLE_DATABASE[selectedBrand]?.years.map((year) => (
                      <option key={year} value={year} className="bg-[#141414]">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                    4. Powertrain Variant
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full bg-[#141414] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {VEHICLE_DATABASE[selectedBrand]?.variants.map((v) => (
                      <option key={v} value={v} className="bg-[#141414]">
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-zinc-500">
                  Filters catalog down to 100% verified compatible parts with zero fitment guesswork.
                </p>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Find Compatible Parts</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ─── 3. SMART COMPATIBILITY EXPERIENCE ─────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8 relative overflow-hidden">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400">
                AI CHASSIS MAPPING
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mt-1">
                Compatibility You Can Trust.
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Interactive demonstration of Cardom’s digital part-to-vehicle matching matrix.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left: Your Vehicle */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">YOUR VEHICLE</span>
                <div className="text-base font-bold text-white">
                  {vehicleActive && activeVehicleInfo ? `${activeVehicleInfo.brand} ${activeVehicleInfo.model}` : 'BMW 3 Series'}
                </div>
                <div className="text-xs text-orange-400 font-mono mt-0.5">
                  {vehicleActive && activeVehicleInfo ? `${activeVehicleInfo.year} • ${activeVehicleInfo.variant}` : '2021 • 2.0L Petrol'}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chassis VIN Verified (Demo)</span>
                </div>
              </div>

              {/* Center: Animated Orange Compatibility Bridge */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>COMPATIBILITY MATCHED</span>
                </div>

                <div className="w-full flex items-center justify-center relative">
                  <div className="w-full h-0.5 bg-gradient-to-r from-orange-500/20 via-orange-500 to-orange-500/20" />
                  <div className="absolute w-8 h-8 rounded-full bg-black border border-orange-500 flex items-center justify-center text-orange-400 shadow-[0_0_15px_#f97316]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  FITMENT: CONFIRMED
                </div>
              </div>

              {/* Right: Compatible Part */}
              <div className="p-4 rounded-xl border border-orange-500/40 bg-orange-500/[0.04] text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-orange-400 block mb-1">COMPATIBLE PART</span>
                <div className="text-base font-bold text-white">Front Ceramic Brake Pad Set</div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">Brembo Sport • SKU #BRK-BREM-7701</div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>OEM Precision Bolt-On Tolerance</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 text-center mt-6 italic">
              *Demo simulation. Final production compatibility will directly query factory OEM engineering schematics upon backend launch.
            </p>
          </div>
        </section>

        {/* ─── 4. PART CATEGORIES (8 Blocks) ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              CURATED REPERTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              Browse by Component Category
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Explore 8 dedicated automotive systems engineered for routine maintenance, repairs, and track upgrades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PART_CATEGORIES.map((cat) => {
              const Icon = cat.Icon
              const isActive = selectedCategory === cat.name
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name)
                    document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={cn(
                    'text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group cursor-pointer h-44',
                    isActive
                      ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                      : 'border-white/10 bg-[#0d0d0d] hover:border-white/25 hover:bg-white/[0.02]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isActive ? 'bg-orange-500 text-black' : 'bg-white/5 text-orange-400 group-hover:scale-105'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{cat.count}</span>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1 group-hover:text-orange-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{cat.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-500">
                    <span className="text-[10px] font-mono text-orange-400">View Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── 5. POPULAR THIS WEEK (DEMO PICKS) ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400">
                FEATURED HIGHLIGHTS
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                Popular This Week <span className="text-xs font-mono text-zinc-500 font-normal">[DEMO PICKS]</span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Showcase of high-demand performance consumables and direct replacement assemblies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPicks.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-black/60 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-black">
                      {product.discount}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/70 text-zinc-300 border border-white/10">
                      {product.category}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-orange-400 mb-1">{product.brand}</div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">{product.name}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">{product.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-base font-bold font-mono text-white">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs font-mono text-zinc-500 line-through ml-2">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalProduct(product)}
                      className="py-2 rounded-lg border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 text-xs font-medium transition-colors text-center"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="py-2 rounded-lg bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 6. PARTS MARKETPLACE ────────────────────────────────────────── */}
        <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400">
                  DIGITAL INVENTORY
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                  DEMO CATALOG
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                Explore Automotive Parts
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Browse precision-matched components designed for routine maintenance, powertrain repairs, and track upgrades.
              </p>
            </div>

            {/* Active Vehicle Compatibility Indicator */}
            {vehicleActive && activeVehicleInfo && (
              <div className="p-3 rounded-xl bg-orange-500/[0.08] border border-orange-500/40 text-xs text-orange-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>
                    Fitment filtered for: <strong>{activeVehicleInfo.brand} {activeVehicleInfo.model}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVehicleActive(false)
                    setActiveVehicleInfo(null)
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Search, Category Bar & Sort Controls */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts, brands, or part numbers (e.g. Brembo, BRK-BREM, Oil Filter)..."
                  className="w-full bg-[#111] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#111] border border-white/15 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Catalog</option>
                </select>
              </div>
            </div>

            {/* Horizontal Scrollable Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['All Parts', ...PART_CATEGORIES.map((c) => c.name)].map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border',
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-black font-bold shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20'
                    )}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 rounded-2xl border border-white/10 bg-[#0d0d0d] text-center max-w-md mx-auto my-8">
              <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">No parts matched your criteria</h4>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Try adjusting your search keywords or switching category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All Parts')
                  setSearchQuery('')
                }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300 group"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black/60 mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-black">
                        {product.discount}
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/80 text-zinc-300 border border-white/10">
                        {product.sku}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span className="text-orange-400">{product.brand}</span>
                      <span>{product.stock}</span>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1 line-clamp-1 group-hover:text-orange-300 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                      {product.description}
                    </p>

                    {/* Compatibility snippet */}
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] text-zinc-400 font-mono line-clamp-1 mb-3">
                      <span className="text-emerald-400 font-bold">Fit:</span> {product.compatibilityText}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-3 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-base font-bold font-mono text-white">₹{product.price.toLocaleString()}</span>
                        <span className="text-xs font-mono text-zinc-500 line-through ml-2">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-zinc-500 text-[10px]">({product.reviews})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalProduct(product)}
                        className="py-2.5 rounded-lg border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 text-xs font-medium transition-colors text-center"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="py-2.5 rounded-lg bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.3)] cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── 7. WHY CARDOM PARTS (4 Cards) ───────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
                ENGINEERED QUALITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
                Why Cardom Spare Parts
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Built to eliminate grey-market counterfeit parts, incorrect vehicle fitments, and hidden pricing markups.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_CARDOM_PARTS.map((feature, idx) => {
                const Icon = feature.Icon
                return (
                  <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">{feature.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 8. HOW IT WORKS (4-Step Timeline) ───────────────────────────── */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              ORDERING PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              How Cardom Parts Works
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Structured discovery connected directly with verified automotive distribution hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors group relative"
              >
                <div className="text-4xl font-bold font-mono text-orange-500/30 group-hover:text-orange-500 transition-colors mb-3">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 9. FREQUENTLY ASKED QUESTIONS (8 Items) ─────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              AUTHENTICATION & FULFILLMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {PARTS_FAQS.map((faq, index) => {
              const isOpen = activeFaq === index
              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-orange-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-4',
                        isOpen && 'rotate-180 text-orange-400'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── 10. FINAL CTA ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                KEEP YOUR CAR READY
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                Find the Part. Keep Moving.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                From routine maintenance to unexpected repairs, Cardom brings vehicle parts and automotive services together.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)] cursor-pointer"
                >
                  Find Parts
                </button>
                <Link
                  to="/service"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors"
                >
                  Book a Service
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── PRODUCT DETAIL MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {modalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-orange-500/60 bg-[#0d0d0d] p-6 sm:p-8 shadow-[0_0_60px_rgba(249,115,22,0.3)] relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                onClick={() => setModalProduct(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Product Image */}
                <div>
                  <div className="h-60 rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative mb-3">
                    <img
                      src={modalProduct.image}
                      alt={modalProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-black">
                      {modalProduct.discount}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 text-center">
                    SKU: {modalProduct.sku}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                      {modalProduct.brand} • {modalProduct.category}
                    </span>
                    <h3 className="text-xl font-heading font-bold text-white mt-1">
                      {modalProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{modalProduct.rating} Rating</span>
                      <span className="text-zinc-500">({modalProduct.reviews} verified reviews)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-2xl font-bold font-mono text-white">
                      ₹{modalProduct.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-mono text-zinc-500 line-through ml-2">
                      ₹{modalProduct.originalPrice.toLocaleString()}
                    </span>
                    <span className="ml-2 text-xs font-mono text-emerald-400">
                      {modalProduct.stock}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {modalProduct.description}
                  </p>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
                    <div className="font-mono text-[11px] text-orange-400 mb-1">Direct Fitment:</div>
                    <div className="text-zinc-300 text-[11px]">{modalProduct.compatibilityText}</div>
                  </div>
                </div>
              </div>

              {/* Specifications Table */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 mb-3">
                  Engineering Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(modalProduct.specs).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">{key}</div>
                      <div className="font-medium text-white mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalProduct(null)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(modalProduct)
                    setModalProduct(null)
                  }}
                  className="flex-1 py-3 rounded-xl bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── SHOPPING CART DRAWER ────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border-l border-white/15 p-6 flex flex-col justify-between z-10 shadow-2xl overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                    <h3 className="font-heading font-bold text-base text-white">Your Cart</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-400">
                      {cartTotalItems} items
                    </span>
                  </div>

                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Items List */}
                {cart.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400">
                    <Package className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                    <p className="text-sm font-semibold text-white">Your cart is empty</p>
                    <p className="text-xs text-zinc-500 mt-1">Explore our catalog to add automotive parts.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover bg-black"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono text-orange-400">{item.product.brand}</div>
                          <h4 className="text-xs font-semibold text-white truncate">{item.product.name}</h4>
                          <div className="text-xs font-mono font-bold text-white mt-1">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1 bg-black/40">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Checkout */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Estimated Tax (18% GST)</span>
                      <span className="font-mono text-zinc-300">₹{estimatedTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                      <span>Estimated Total</span>
                      <span className="font-mono text-orange-400">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutModalOpen(true)}
                    className="w-full py-3.5 rounded-xl bg-orange-500 text-black font-bold text-xs tracking-wider uppercase hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHECKOUT PLACEHOLDER MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-orange-500/60 bg-[#0d0d0d] p-6 sm:p-8 shadow-[0_0_60px_rgba(249,115,22,0.35)] relative text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 mx-auto">
                <Info className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-heading font-bold text-white">
                Checkout Integration Coming Soon
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2 mb-6">
                Payments, order processing, and supplier fulfillment will be connected after the Cardom backend is integrated.
              </p>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-300 mb-6 flex justify-between">
                <span>Demo Cart Value:</span>
                <span className="text-orange-400 font-bold">₹{grandTotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-full py-3 rounded-xl bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 transition-colors"
              >
                Understood, Return to Catalog
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

