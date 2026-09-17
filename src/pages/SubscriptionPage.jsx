import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Repeat2,
  Calendar,
  CreditCard,
  Wrench,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Info,
  Car,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'

// ─── 1. Why Subscribe Features ──────────────────────────────────────────────

const WHY_SUBSCRIBE_FEATURES = [
  {
    Icon: Calendar,
    title: 'Flexible Commitment',
    description: 'Choose a subscription period that works for your personal or business plans without years of lock-in.',
  },
  {
    Icon: CreditCard,
    title: 'One Monthly Payment',
    description: 'Keep your recurring vehicle costs organized in one simple monthly charge with clear digital invoices.',
  },
  {
    Icon: Wrench,
    title: 'Maintenance Support',
    description: 'Explore subscription experiences that can include routine servicing, wear-and-tear support, and breakdown assistance.',
  },
  {
    Icon: RefreshCw,
    title: 'Change When You Need',
    description: 'Switch vehicles when your lifestyle or driving requirements change, subject to applicable plan terms.',
  },
]

// ─── 2. Sample Subscription Plans (Clearly Demo) ────────────────────────────

const SAMPLE_PLANS = [
  {
    id: 'city',
    name: 'City Drive',
    category: 'Compact & Hatchback',
    samplePrice: '₹24,999',
    tenure: 'From 3 to 24 Months',
    features: [
      'Compact & urban vehicle category',
      'Routine maintenance support included',
      '24/7 Roadside assistance coverage',
      'Flexible tenure renewal or return',
      'Digital insurance management support',
    ],
    detailedNote: 'Engineered for daily urban commutes with maximum agility and minimal parking footprint.',
  },
  {
    id: 'premium',
    name: 'Everyday Premium',
    category: 'Sedan & Compact SUV',
    samplePrice: '₹39,999',
    tenure: 'From 6 to 24 Months',
    features: [
      'Premium sedan and crossover category',
      'Comprehensive maintenance support',
      'Priority 24/7 emergency roadside assistance',
      'Digital documentation and paperless renewals',
      'Option to upgrade vehicle every 12 months',
    ],
    detailedNote: 'Ideal for executives and families seeking refined cabin comfort and enhanced road presence.',
  },
  {
    id: 'executive',
    name: 'Executive Drive',
    category: 'Full-Size Luxury SUV',
    samplePrice: '₹59,999',
    tenure: 'From 6 to 36 Months',
    features: [
      'Full-size premium SUV category',
      'All-inclusive scheduled servicing & consumables',
      'Dedicated concierge and doorstep service pickup',
      'Enhanced roadside support and replacement car option',
      'Flexible vehicle options across the executive fleet',
    ],
    detailedNote: 'Uncompromising luxury and performance with top-tier convenience and concierge assistance.',
  },
]

// ─── 3. Feature Inclusion Matrix ────────────────────────────────────────────

const INCLUSION_MATRIX = [
  { feature: 'Vehicle access', status: 'Included', note: 'Full driving access to your subscribed vehicle' },
  { feature: 'Digital documentation', status: 'Included', note: 'Paperless registration, digital RC, and insurance copies' },
  { feature: 'Maintenance support', status: 'May be included', note: 'Periodic scheduled service and wear-and-tear (plan dependent)' },
  { feature: 'Roadside assistance', status: 'May be included', note: '24/7 emergency towing, jumpstart, and flat tyre service' },
  { feature: 'Insurance coverage', status: 'Depends on plan', note: 'Comprehensive or third-party protection as selected' },
  { feature: 'Vehicle change', status: 'Depends on plan', note: 'Option to switch to another vehicle category upon term completion' },
]

// ─── 4. How It Works Steps ──────────────────────────────────────────────────

const PROCESS_STEPS = [
  { number: '01', title: 'Choose a Vehicle', desc: 'Explore vehicles that match your requirements from our curated fleet.' },
  { number: '02', title: 'Select a Subscription', desc: 'Review the available subscription structure, duration, and monthly terms.' },
  { number: '03', title: 'Complete the Process', desc: 'Provide the required verification information when services are connected.' },
  { number: '04', title: 'Start Driving', desc: 'Access your subscribed vehicle according to the applicable plan terms.' },
]

// ─── 5. Comparison: Ownership vs Subscription ───────────────────────────────

const OWNERSHIP_POINTS = [
  'Large upfront purchase or hefty initial down payment',
  'Long-term loan commitment typically spanning 5 to 7 years',
  'Sole responsibility for depreciation and future resale value',
  'Ownership-related unscheduled repair and maintenance costs',
  'Comprehensive credit checks and financing approval required',
]

const SUBSCRIPTION_POINTS = [
  'Recurring monthly payment model with zero hefty down payment',
  'Flexible commitment with term options starting from 3 months',
  'Vehicle access without the burdens of ownership or resale losses',
  'Maintenance, servicing, and roadside care may be bundled into plan',
  'Terms and eligibility criteria vary based on provider guidelines',
]

// ─── 6. FAQ Items ───────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'What is a car subscription?',
    answer: 'A car subscription is a modern automotive access model that lets you drive a vehicle for a predetermined monthly fee. Unlike traditional ownership or multi-year leasing, subscriptions offer shorter commitment periods and often bundle maintenance and roadside support.',
  },
  {
    question: 'How is a subscription different from buying a car?',
    answer: 'When you buy a car, you own the asset, assume full depreciation risk, pay a significant upfront amount, and manage separate insurance and maintenance expenses. A subscription provides vehicle access through a recurring fee without asset ownership.',
  },
  {
    question: 'Can I change my subscription duration?',
    answer: 'Yes. Most subscription frameworks allow you to extend, renew, or end your tenure upon conclusion of your selected initial duration, subject to provider terms.',
  },
  {
    question: 'Does the subscription include insurance?',
    answer: 'Insurance coverage varies by plan and provider. Many subscription tiers bundle comprehensive or third-party motor insurance directly into the monthly payment.',
  },
  {
    question: 'Does maintenance come with the subscription?',
    answer: 'Depending on the specific plan chosen, routine periodic servicing, preventive inspections, and consumables may be bundled into the monthly fee.',
  },
  {
    question: 'Can I switch vehicles?',
    answer: 'Certain premium subscription tiers permit switching to a different car model or category upon tenure milestones or seasonal needs, subject to fleet availability.',
  },
]

// ─── Abstract Subscription Hero SVG Visual ──────────────────────────────────

function SubscriptionHeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto flex items-center justify-center">
      {/* Diffuse orange aura */}
      <div className="absolute inset-4 rounded-full bg-orange-500/15 blur-[80px] pointer-events-none" />

      <svg viewBox="0 0 500 500" className="w-full h-full object-contain relative z-10" fill="none">
        <defs>
          <linearGradient id="sub-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Concentric orbital rings */}
        <circle cx="250" cy="250" r="215" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="250" cy="250" r="165" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="250" cy="250" r="115" stroke="rgba(249,115,22,0.15)" strokeWidth="1" strokeDasharray="3 4" />

        {/* Dynamic orbital track ellipse */}
        <ellipse cx="250" cy="250" rx="200" ry="120" stroke="url(#orbit-grad)" strokeWidth="1.5" strokeDasharray="6 8" />

        {/* Repeat / Subscription Cycle Nodes */}
        <g transform="translate(420, 235)">
          <circle cx="15" cy="15" r="14" fill="#141414" stroke="#f97316" strokeWidth="1.5" />
          <path d="M 11 15 L 19 15 M 16 11 L 19 15 L 16 19" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform="translate(50, 235)">
          <circle cx="15" cy="15" r="14" fill="#141414" stroke="#f97316" strokeWidth="1.5" />
          <path d="M 19 15 L 11 15 M 14 11 L 11 15 L 14 19" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

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

        {/* Aerodynamic Sports Car Silhouette */}
        <path
          d="M 90 285 
             C 130 285, 160 275, 190 250 
             C 220 225, 270 205, 320 205 
             C 370 205, 410 235, 430 265 
             L 450 285"
          stroke="url(#sub-line-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Ground track */}
        <line x1="70" y1="300" x2="460" y2="300" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeDasharray="6 8" />

        {/* Wheels */}
        <path d="M 140 300 A 26 26 0 0 1 192 300" stroke="rgba(249,115,22,0.7)" strokeWidth="2" fill="none" />
        <circle cx="166" cy="300" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        <path d="M 340 300 A 26 26 0 0 1 392 300" stroke="rgba(249,115,22,0.7)" strokeWidth="2" fill="none" />
        <circle cx="366" cy="300" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Telemetry Status Badges */}
        <g transform="translate(165, 95)">
          <rect width="170" height="24" rx="6" fill="#121212" stroke="rgba(249,115,22,0.4)" strokeWidth="1" />
          <text x="85" y="16" fill="#f97316" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            FLEXIBLE MONTHLY PROTOCOL
          </text>
        </g>

        <g transform="translate(70, 410)">
          <circle cx="8" cy="8" r="4" fill="#10b981" />
          <text x="20" y="12" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
            ZERO DOWN PAYMENT REQUIRED
          </text>
        </g>
      </svg>
    </div>
  )
}

// ─── Calculator Pricing Presets ─────────────────────────────────────────────

const CATEGORY_BASE_PRICES = {
  Compact: 22000,
  Sedan: 32000,
  SUV: 42000,
  Premium: 65000,
}

const DURATION_FACTORS = {
  3: 1.05,  // Short term
  6: 1.0,   // Baseline
  12: 0.92, // 8% saving
  24: 0.85, // 15% saving
}

// ─── Main SubscriptionPage Component ────────────────────────────────────────

export function SubscriptionPage() {
  const plansRef = useRef(null)
  const processRef = useRef(null)

  // Calculator State
  const [selectedCategory, setSelectedCategory] = useState('Sedan')
  const [selectedDuration, setSelectedDuration] = useState(6)
  const [selectedPlanModal, setSelectedPlanModal] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Calculate live estimates
  const calculation = useMemo(() => {
    const base = CATEGORY_BASE_PRICES[selectedCategory] || 32000
    const factor = DURATION_FACTORS[selectedDuration] || 1.0
    const monthlyCost = Math.round(base * factor)
    const totalCost = monthlyCost * selectedDuration

    return {
      monthlyCost,
      totalCost,
      duration: selectedDuration,
      category: selectedCategory,
    }
  }, [selectedCategory, selectedDuration])

  const handleResetCalculator = () => {
    setSelectedCategory('Sedan')
    setSelectedDuration(6)
  }

  const scrollToPlans = () => {
    if (plansRef.current) {
      plansRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToProcess = () => {
    if (processRef.current) {
      processRef.current.scrollIntoView({ behavior: 'smooth' })
    }
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
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-6">
                  <Repeat2 className="w-3.5 h-3.5" />
                  Car Subscription
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                  Drive More.{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Commit Less.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10">
                  Get access to a car without the long-term commitment of traditional ownership.
                  Simple monthly subscriptions with maintenance, roadside support, and vehicle flexibility.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/cars" className="w-full sm:w-auto">
                    <ShimmerButton
                      size="lg"
                      className="w-full sm:w-auto min-w-[190px] shadow-[0_0_24px_rgba(249,115,22,0.3)]"
                    >
                      Explore Cars
                      <ArrowRight className="w-4 h-4" />
                    </ShimmerButton>
                  </Link>

                  <button
                    type="button"
                    onClick={scrollToProcess}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 text-center transition-colors"
                  >
                    How It Works
                  </button>
                </div>
              </div>

              {/* Right Column: Abstract Subscription Visual */}
              <div className="lg:col-span-5">
                <SubscriptionHeroVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Why Subscribe Features ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Modern Automotive Freedom
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                A Different Way to{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Drive.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY_SUBSCRIBE_FEATURES.map(({ Icon, title, description }, index) => (
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
                    'transition-all duration-300 text-left',
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

        {/* ── 3. Subscription Plans (Sample Demo) ── */}
        <section ref={plansRef} id="subscription-plans" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border border-orange-500/30 bg-orange-500/10 text-orange-400 mb-3">
                SAMPLE PLANS — UI DEMONSTRATION ONLY
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Choose Your{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Drive.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Sample conceptual subscription tiers for interface preview. Actual plans and pricing depend on future provider integrations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {SAMPLE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-3xl p-8 flex flex-col justify-between border border-white/[0.08] bg-[#0c0c0c] hover:border-orange-500/30 transition-all duration-300 text-left"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 block mb-1">
                      {plan.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6 font-mono">
                      Tenure: {plan.tenure}
                    </p>

                    <div className="mb-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                        Sample Demo Cost
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-white font-mono">
                          {plan.samplePrice}
                        </span>
                        <span className="text-xs text-zinc-500">/ month*</span>
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
                    className="w-full py-3 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.03] text-zinc-200 hover:text-white hover:border-orange-500/40 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Info className="w-3.5 h-3.5" />
              <span>*Figures represent sample UI values for demonstration purposes only. Not actual market offers.</span>
            </div>
          </div>
        </section>

        {/* ── 4. Subscription Calculator ── */}
        <section id="calculator" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Interactive Monthly Estimation
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                See What Your Monthly Drive{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Could Look Like.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Select your preferred vehicle category and subscription term to calculate an illustrative monthly projection.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Inputs (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] space-y-6 text-left">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-2.5">
                    Vehicle Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Compact', 'Sedan', 'SUV', 'Premium'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl text-xs font-medium text-center transition-all duration-200',
                          selectedCategory === cat
                            ? 'bg-orange-500 text-white font-semibold shadow-[0_0_14px_rgba(249,115,22,0.4)]'
                            : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:text-white',
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-2.5">
                    Subscription Duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[3, 6, 12, 24].map((mo) => (
                      <button
                        key={mo}
                        type="button"
                        onClick={() => setSelectedDuration(mo)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl text-xs font-medium text-center transition-all duration-200',
                          selectedDuration === mo
                            ? 'bg-orange-500 text-white font-semibold shadow-[0_0_14px_rgba(249,115,22,0.4)]'
                            : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:text-white',
                        )}
                      >
                        {mo} Months
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetCalculator}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Calculator
                  </button>
                </div>
              </div>

              {/* Right Output Card (5 cols) */}
              <div className="lg:col-span-5 relative p-6 sm:p-8 rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#16120d] via-[#0e0e0e] to-[#080808] shadow-2xl flex flex-col justify-between text-left">
                <BorderBeam duration={10} colorFrom="#f97316" colorTo="transparent" />

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                    Estimated Monthly Cost
                  </span>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                      ₹{calculation.monthlyCost.toLocaleString()}
                    </span>
                    <span className="text-xs text-orange-400 font-medium">/ month</span>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Selected Vehicle:</span>
                      <span className="font-semibold text-white">{calculation.category} Category</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Commitment Period:</span>
                      <span className="text-zinc-300 font-mono">{calculation.duration} Months</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                      <span className="text-zinc-300 font-medium">Est. Total Cost:</span>
                      <span className="font-bold text-orange-400 font-mono">
                        ₹{calculation.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    *Illustrative estimate only. Does not represent an active binding offer or final contractual rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. What's Included Feature Matrix ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Comprehensive Package Details
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                More Than Just the{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Keys.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Transparent breakdown of features and support services that may be included.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {INCLUSION_MATRIX.map((row) => (
                  <div key={row.feature} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="sm:w-1/3">
                      <span className="text-sm font-semibold text-white block">
                        {row.feature}
                      </span>
                    </div>

                    <div className="sm:w-1/4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          row.status === 'Included'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                        )}
                      >
                        {row.status === 'Included' && <Check className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </div>

                    <div className="sm:w-5/12">
                      <span className="text-xs text-zinc-400">
                        {row.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. How It Works Timeline ── */}
        <section ref={processRef} id="how-it-works" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Frictionless Subscription
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Your Next Car,{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Simplified.
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

        {/* ── 7. Subscription vs Ownership ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative bg-[#070707]">
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Comparative Assessment
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Ownership Isn&apos;t the{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Only Way.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Consider each model objectively based on your timeline and driving habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Traditional Ownership */}
              <div className="p-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-lg font-bold text-white">Traditional Ownership</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-6">
                    Conventional vehicle purchasing with full asset title and long-term financial engagement.
                  </p>
                  <div className="space-y-3">
                    {OWNERSHIP_POINTS.map((pt) => (
                      <div key={pt} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Car Subscription */}
              <div className="p-8 rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#14100c] to-[#0c0c0c] text-left flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat2 className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">Car Subscription</h3>
                  </div>
                  <p className="text-xs text-zinc-300 mb-6">
                    On-demand driving access with predictable monthly fees and flexible commitments.
                  </p>
                  <div className="space-y-3">
                    {SUBSCRIPTION_POINTS.map((pt) => (
                      <div key={pt} className="flex items-start gap-2.5 text-xs text-zinc-200">
                        <Check className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ Accordion ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Common Inquiries
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

        {/* ── 9. Final CTA ── */}
        <section className="py-24 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready for a Different{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Way to Drive?
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-8">
              Explore vehicles and discover the subscription experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/cars" className="w-full sm:w-auto">
                <ShimmerButton size="md" className="w-full sm:w-auto">
                  Explore Cars
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>

              <button
                type="button"
                onClick={scrollToPlans}
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors text-center"
              >
                See Subscription Options
              </button>
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
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-2xl z-10 text-left"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 block mb-1">
                {selectedPlanModal.category}
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedPlanModal.name} Plan Overview
              </h3>
              <p className="text-xs text-zinc-400 mb-4">{selectedPlanModal.detailedNote}</p>

              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-6">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">
                  Illustrative Monthly Rate
                </span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  {selectedPlanModal.samplePrice}
                </span>
                <span className="text-xs text-zinc-500"> / month*</span>
              </div>

              <div className="space-y-2.5 mb-6">
                {selectedPlanModal.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
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

