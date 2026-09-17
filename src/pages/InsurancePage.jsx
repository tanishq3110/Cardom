import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  FileCheck2,
  FileText,
  ChevronDown,
  Car,
  Zap,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'

// ─── 1. Coverage Types ──────────────────────────────────────────────────────

const COVERAGE_TYPES = [
  {
    Icon: ShieldCheck,
    title: 'Comprehensive',
    description: 'Protection for your vehicle against accidents, theft, natural events, fire, and third-party liabilities.',
  },
  {
    Icon: ShieldAlert,
    title: 'Third-Party',
    description: 'Meet mandatory third-party coverage requirements while protecting yourself against legal liability on the road.',
  },
  {
    Icon: Sparkles,
    title: 'Zero Depreciation',
    description: 'Reduce depreciation impact on eligible claims and repairs so you receive full replacement cost on parts.',
  },
  {
    Icon: Layers,
    title: 'Add-On Protection',
    description: 'Extend your coverage with options designed around your needs, including engine protection and key replacement.',
  },
]

// ─── 2. Mock Insurance Plans ────────────────────────────────────────────────

const SAMPLE_PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    tagline: 'Basic Regulatory Compliance',
    samplePrice: '₹3,890',
    features: [
      'Mandatory third-party liability cover',
      'Basic roadside assistance (towing)',
      'Digital instant policy generation',
      '24/7 customer support helpline',
    ],
    accent: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'Balanced Full-Spectrum Cover',
    samplePrice: '₹8,950',
    features: [
      'Comprehensive own-damage protection',
      '24/7 Emergency roadside assistance',
      'Personal accident cover (up to ₹15 Lakh)',
      'Cashless digital claims at 5,000+ garages',
      'Zero paperwork renewal',
    ],
    accent: true,
  },
  {
    id: 'complete',
    name: 'Complete',
    tagline: 'Maximized Automotive Shield',
    samplePrice: '₹14,400',
    features: [
      'All Plus features included',
      'Zero depreciation on metal and plastic parts',
      'Engine & gearbox water-ingress protection',
      'Consumables & tyre repair cover',
      'Return to invoice (full ex-showroom claim)',
    ],
    accent: false,
  },
]

// ─── 3. Claims & Support Blocks ─────────────────────────────────────────────

const SUPPORT_BLOCKS = [
  {
    Icon: FileCheck2,
    title: 'Digital Claims',
    description: 'Keep your claim information organized in one place with photo uploads, live inspection tracking, and instant updates.',
  },
  {
    Icon: PhoneCall,
    title: 'Roadside Assistance',
    description: 'Connect your vehicle protection directly with 24/7 nationwide roadside support for towing, jumpstarts, and flat tyres.',
  },
  {
    Icon: FileText,
    title: 'Policy Management',
    description: 'Keep policy details, add-on endorsements, and renewal reminders easily accessible across all your vehicles.',
  },
]

// ─── 4. How It Works Steps ──────────────────────────────────────────────────

const PROCESS_STEPS = [
  { number: '01', title: 'Enter Your Vehicle', desc: 'Provide your car brand, model, and registration details.' },
  { number: '02', title: 'Compare Coverage', desc: 'Review side-by-side protection plans tailored for your vehicle.' },
  { number: '03', title: 'Select Your Protection', desc: 'Customize add-ons and choose the policy that matches your driving.' },
  { number: '04', title: 'Manage Your Policy', desc: 'Access policy documents, digital renewals, and claims anytime.' },
]

// ─── 5. FAQ Questions & Answers ─────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "What's the difference between comprehensive and third-party insurance?",
    answer: "Third-party insurance is legally mandatory and covers injury, death, and property damages caused to others. Comprehensive insurance covers both third-party liabilities as well as damages to your own vehicle resulting from road accidents, theft, natural calamities, or vandalism.",
  },
  {
    question: "What information do I need to get a quote?",
    answer: "To receive an accurate estimate, you typically only need your vehicle's make, model, registration year, fuel type, city of registration, and the status of your existing policy.",
  },
  {
    question: "Can I add roadside assistance?",
    answer: "Yes. Roadside assistance is available as a bundled feature or add-on, granting 24/7 on-demand help for towing, flat tyre assistance, battery jumpstarts, emergency fuel delivery, and lockout support.",
  },
  {
    question: "Can I manage my policy through Cardom?",
    answer: "Cardom is engineered as a unified automotive ecosystem. Once connected, your active policies, renewal countdowns, digital claim filings, and inspection certificates can be managed directly in one central dashboard.",
  },
  {
    question: "How does the claims process work?",
    answer: "Digital claims allow you to submit photos of vehicle damage, choose from thousands of cashless partner service workshops, schedule vehicle pickup, and track claims through transparent digital updates.",
  },
]

// ─── Abstract Insurance Hero SVG Visual ─────────────────────────────────────

function InsuranceHeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto flex items-center justify-center">
      {/* Diffuse orange aura */}
      <div className="absolute inset-4 rounded-full bg-orange-500/15 blur-[80px] pointer-events-none" />

      <svg viewBox="0 0 500 500" className="w-full h-full object-contain relative z-10" fill="none">
        <defs>
          <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="shield-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Concentric radar rings */}
        <circle cx="250" cy="250" r="215" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="250" cy="250" r="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="250" cy="250" r="120" stroke="rgba(249,115,22,0.15)" strokeWidth="1" strokeDasharray="3 4" />

        {/* Radial tick marks */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15) * (Math.PI / 180)
          const x1 = 250 + 215 * Math.cos(angle)
          const y1 = 250 + 215 * Math.sin(angle)
          const len = i % 3 === 0 ? 12 : 6
          const x2 = 250 + (215 - len) * Math.cos(angle)
          const y2 = 250 + (215 - len) * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 3 === 0 ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={i % 3 === 0 ? '1.5' : '1'}
            />
          )
        })}

        {/* Outer Tech Shield Outline */}
        <path
          d="M 250 110 
             L 360 150 
             C 360 270, 310 350, 250 390 
             C 190 350, 140 270, 140 150 
             Z"
          fill="url(#shield-fill)"
          stroke="url(#shield-grad)"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner Shield Contour */}
        <path
          d="M 250 135 
             L 335 168 
             C 335 260, 295 325, 250 360 
             C 205 325, 165 260, 165 168 
             Z"
          stroke="rgba(249,115,22,0.3)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Vehicle Silhouette inside Shield */}
        <path
          d="M 195 270 
             C 210 250, 235 240, 250 240 
             C 265 240, 290 250, 305 270 
             L 315 285 L 185 285 Z"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          fill="rgba(255,255,255,0.05)"
        />
        <circle cx="210" cy="285" r="7" stroke="#f97316" strokeWidth="2" fill="#0d0d0d" />
        <circle cx="290" cy="285" r="7" stroke="#f97316" strokeWidth="2" fill="#0d0d0d" />

        {/* Telemetry data tags */}
        <g transform="translate(180, 75)">
          <rect width="140" height="24" rx="6" fill="#121212" stroke="rgba(249,115,22,0.4)" strokeWidth="1" />
          <text x="70" y="16" fill="#f97316" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            ZERO-DEP VERIFIED
          </text>
        </g>

        <g transform="translate(70, 410)">
          <circle cx="8" cy="8" r="4" fill="#10b981" />
          <text x="18" y="12" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
            24/7 CLAIMS NETWORK ACTIVE
          </text>
        </g>
      </svg>
    </div>
  )
}

// ─── Main InsurancePage Component ───────────────────────────────────────────

export function InsurancePage() {
  const quoteRef = useRef(null)

  // Quick Quote State
  const [quoteData, setQuoteData] = useState({
    brand: '',
    model: '',
    year: '2023',
    fuel: 'Petrol',
    city: '',
    previousStatus: 'Active Policy',
  })
  const [quoteReady, setQuoteReady] = useState(false)
  const [selectedPlanModal, setSelectedPlanModal] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const scrollToQuote = () => {
    if (quoteRef.current) {
      quoteRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleQuoteSubmit = (e) => {
    e.preventDefault()
    if (!quoteData.brand.trim() || !quoteData.model.trim()) return
    setQuoteReady(true)
    scrollToQuote()
  }

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        {/* ── 1. Hero Section ── */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 left-1/3 w-[600px] h-[350px] rounded-full bg-orange-500/[0.08] blur-[120px]"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline & CTAs */}
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-6">
                  <Shield className="w-3.5 h-3.5" />
                  Auto Insurance
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                  Protect Every{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Mile.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10">
                  Find coverage that fits your car, your driving, and the way you
                  use it. Seamless comparisons, transparent add-ons, and instant
                  digital claims.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ShimmerButton
                    size="lg"
                    onClick={scrollToQuote}
                    className="w-full sm:w-auto min-w-[190px] shadow-[0_0_24px_rgba(249,115,22,0.3)]"
                  >
                    Check Your Coverage
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>

                  <a
                    href="#coverage-types"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 text-center transition-colors"
                  >
                    Explore Protection
                  </a>
                </div>
              </div>

              {/* Right Column: Abstract Shield Visual */}
              <div className="lg:col-span-5">
                <InsuranceHeroVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Coverage Types ── */}
        <section id="coverage-types" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Comprehensive Shield Options
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Protection Built Around{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Your Drive.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COVERAGE_TYPES.map(({ Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className={cn(
                    'group relative p-6 rounded-2xl border border-white/[0.07] bg-[#0d0d0d]',
                    'hover:border-orange-500/30 hover:shadow-[0_0_24px_rgba(249,115,22,0.1)]',
                    'transition-all duration-300',
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.07] group-hover:bg-orange-500/10 group-hover:border-orange-500/25 flex items-center justify-center text-zinc-400 group-hover:text-orange-400 transition-colors mb-5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Insurance Comparison (Demo/Sample Plans) ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Sample Plan Architectures
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Compare Before{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  You Choose.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Sample demo tiers for illustrative comparison. Pricing and coverage vary by vehicle profile and insurer.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {SAMPLE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-3xl p-8 flex flex-col justify-between',
                    'border transition-all duration-300',
                    plan.accent
                      ? 'border-orange-500/50 bg-[#120e0b] shadow-[0_0_36px_rgba(249,115,22,0.15)]'
                      : 'border-white/[0.08] bg-[#0c0c0c] hover:border-white/20',
                  )}
                >
                  {plan.accent && (
                    <BorderBeam duration={10} colorFrom="#f97316" colorTo="transparent" />
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.accent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white">
                          Popular
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mb-6">
                      {plan.tagline}
                    </p>

                    <div className="mb-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                        Sample Illustrative Estimate
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-white">
                          {plan.samplePrice}
                        </span>
                        <span className="text-xs text-zinc-500">/year*</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(plan)}
                    className={cn(
                      'w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200',
                      plan.accent
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_16px_rgba(249,115,22,0.4)]'
                        : 'border border-white/10 bg-white/[0.03] text-zinc-200 hover:text-white hover:border-orange-500/40',
                    )}
                  >
                    View Plan Details
                  </button>
                </div>
              ))}
            </div>

            {/* Disclaimer notice */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Info className="w-3.5 h-3.5" />
              <span>*UI demo values for conceptual demonstration only. Not actual market insurance policy prices.</span>
            </div>
          </div>
        </section>

        {/* ── 4. Quick Quote Form ── */}
        <section ref={quoteRef} id="quote-form" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Instant Online Calculator
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Get a Quick{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Estimate.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Input your car specifications to review potential coverage architectures.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {quoteReady ? (
                /* ── Polished Estimate State ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 sm:p-10 rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#16120d] via-[#0e0e0e] to-[#080808] text-center shadow-2xl relative"
                >
                  <BorderBeam duration={8} colorFrom="#f97316" colorTo="transparent" />

                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-orange-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Your estimate is ready.
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
                    Connect Cardom&apos;s insurance services to receive personalized
                    coverage options tailored to your vehicle profile.
                  </p>

                  <div className="max-w-md mx-auto p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-left mb-6 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vehicle:</span>
                      <span className="font-semibold text-white">
                        {quoteData.brand} {quoteData.model} ({quoteData.year})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fuel & Location:</span>
                      <span className="text-zinc-300">
                        {quoteData.fuel} · {quoteData.city || 'All India'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Policy Profile:</span>
                      <span className="text-orange-400">{quoteData.previousStatus}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setQuoteReady(false)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      Calculate Another Car
                    </button>
                    <Link
                      to="/cars"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-medium border border-white/10 text-zinc-300 hover:text-white transition-colors"
                    >
                      Explore Cars
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* ── Quick Quote Form ── */
                <form
                  onSubmit={handleQuoteSubmit}
                  className="p-6 sm:p-10 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl space-y-6 text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        Car Brand *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BMW, Mercedes, Porsche"
                        value={quoteData.brand}
                        onChange={(e) => setQuoteData({ ...quoteData, brand: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        Car Model *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. M3, 911 Carrera"
                        value={quoteData.model}
                        onChange={(e) => setQuoteData({ ...quoteData, model: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        Registration Year
                      </label>
                      <select
                        value={quoteData.year}
                        onChange={(e) => setQuoteData({ ...quoteData, year: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                      >
                        {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
                          <option key={yr} value={yr} className="bg-[#111111] text-white">
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        Fuel Type
                      </label>
                      <select
                        value={quoteData.fuel}
                        onChange={(e) => setQuoteData({ ...quoteData, fuel: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        City of Registration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, New Delhi"
                        value={quoteData.city}
                        onChange={(e) => setQuoteData({ ...quoteData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">
                        Previous Insurance Status
                      </label>
                      <select
                        value={quoteData.previousStatus}
                        onChange={(e) => setQuoteData({ ...quoteData, previousStatus: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Active Policy">Active Policy</option>
                        <option value="Expired < 90 Days">Expired &lt; 90 Days</option>
                        <option value="Expired > 90 Days">Expired &gt; 90 Days</option>
                        <option value="Brand New Car">Brand New Car</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                    <ShimmerButton size="md" className="w-full sm:w-auto min-w-[180px]">
                      Get Estimate
                      <ArrowRight className="w-4 h-4" />
                    </ShimmerButton>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── 5. Claims & Support Section ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Integrated Emergency Services
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Support When{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  You Need It.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUPPORT_BLOCKS.map(({ Icon, title, description }, index) => (
                <div
                  key={title}
                  className="p-8 rounded-2xl border border-white/[0.07] bg-[#0c0c0c] flex flex-col text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. How It Works Timeline ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Frictionless Coverage
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                How It{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Works.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="p-6 rounded-2xl border border-white/[0.07] bg-[#0d0d0d] flex flex-col text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-orange-500/40">
                      {step.number}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. FAQ Accordion ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Answers & Insights
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Questions.
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="text-sm font-semibold text-white">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-orange-400 transition-transform duration-200 flex-shrink-0',
                          isOpen ? 'rotate-180' : '',
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 8. Final CTA ── */}
        <section className="py-24 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Drive With{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                More Confidence.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-8">
              Explore protection options for the road ahead with Cardom&apos;s digital coverage platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ShimmerButton size="md" onClick={scrollToQuote} className="w-full sm:w-auto">
                Check Your Coverage
                <ArrowRight className="w-4 h-4" />
              </ShimmerButton>

              <Link
                to="/cars"
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors text-center"
              >
                Explore Cars
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Plan Details Modal (Demo UI) */}
      <AnimatePresence>
        {selectedPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlanModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-2xl z-10 text-left"
            >
              <h3 className="text-lg font-bold text-white mb-1">
                {selectedPlanModal.name} Plan Architecture
              </h3>
              <p className="text-xs text-orange-400 mb-4">{selectedPlanModal.tagline}</p>

              <div className="space-y-2 mb-6">
                {selectedPlanModal.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlanModal(null)}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Close Plan Overview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

