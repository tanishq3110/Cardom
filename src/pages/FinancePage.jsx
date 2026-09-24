import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  SlidersHorizontal,
  Calculator,
  FileCheck2,
  Zap,
  ArrowRight,
  RotateCcw,
  Calendar,
  ShieldCheck,
  TrendingDown,
  UserCheck,
  FileText,
  Car,
  MapPin,
  ChevronDown,
  Info,
  BadgePercent,
  Compass,
  User,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { submitFinanceLead } from '@/services/leadsApi'

// ─── 1. Why Finance With Cardom Features ─────────────────────────────────────

const WHY_FINANCE_FEATURES = [
  {
    Icon: SlidersHorizontal,
    title: 'Flexible Options',
    description: 'Explore different loan amounts, customizable down payments, and repayment periods.',
  },
  {
    Icon: Calculator,
    title: 'Transparent Estimates',
    description: 'Understand your estimated monthly payment and interest impact before proceeding.',
  },
  {
    Icon: FileCheck2,
    title: 'Digital Process',
    description: 'Keep your financing journey organized in one place with zero paperwork friction.',
  },
  {
    Icon: Zap,
    title: 'Connected Experience',
    description: 'Move from finding a car to exploring financing without leaving the Cardom platform.',
  },
]

// ─── 2. Financing Structures (Unranked) ──────────────────────────────────────

const FINANCING_STRUCTURES = [
  {
    Icon: CreditCard,
    title: 'Standard Auto Loan',
    description: 'Finance a vehicle through a conventional repayment structure with predictable monthly EMIs spread across your chosen tenure.',
  },
  {
    Icon: Calendar,
    title: 'Flexible Tenure',
    description: 'Choose a repayment period from 1 to 7 years that comfortably fits your planned monthly budget and cash flow requirements.',
  },
  {
    Icon: TrendingDown,
    title: 'Higher Down Payment',
    description: 'Explore how a larger upfront contribution reduces the principal financed, directly lowering total interest paid over the loan term.',
  },
]

// ─── 3. Finance Journey Steps ───────────────────────────────────────────────

const JOURNEY_STEPS = [
  { number: '01', title: 'Choose Your Car', desc: 'Find a vehicle that fits your lifestyle from verified listings.' },
  { number: '02', title: 'Estimate Your EMI', desc: 'Adjust price, down payment, interest rate, and repayment tenure.' },
  { number: '03', title: 'Review Financing', desc: 'Understand the estimated interest breakdown and repayment cost structure.' },
  { number: '04', title: 'Complete Your Application', desc: 'Continue with the appropriate financing provider when services are connected.' },
]

// ─── 4. Documents / Eligibility Cards ───────────────────────────────────────

const DOCUMENT_REQUIREMENTS = [
  {
    Icon: UserCheck,
    title: 'Identity Details',
    description: 'Basic identity information (such as government-issued ID or PAN) may be required by financing providers.',
  },
  {
    Icon: FileText,
    title: 'Income Information',
    description: 'Providers may request income statements, salary slips, or bank records to evaluate repayment capacity.',
  },
  {
    Icon: Car,
    title: 'Vehicle Details',
    description: 'Vehicle specifications, pro-forma invoice, and purchase details may be required for auto loan evaluation.',
  },
  {
    Icon: MapPin,
    title: 'Address Details',
    description: 'Residential or communication address proofs may be requested as part of regulatory KYC compliance.',
  },
]

// ─── 5. FAQ Questions & Answers ─────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'What is an auto loan?',
    answer: 'An auto loan is a secured vehicle financing arrangement where a financing institution lends you the capital required to purchase a car, which you repay through fixed monthly instalments (EMIs) over an agreed tenure.',
  },
  {
    question: 'How does an EMI work?',
    answer: 'Equated Monthly Instalments (EMIs) are calculated using a reducing-balance formula where each payment consists of both principal repayment and interest. In the initial months, a higher proportion goes toward interest, gradually shifting toward principal repayment as the loan matures.',
  },
  {
    question: 'Can I change the loan tenure?',
    answer: 'Yes. Most lenders provide flexible tenures ranging from 12 to 84 months (1 to 7 years). A shorter tenure increases the monthly EMI but reduces overall interest paid, while a longer tenure lowers the monthly EMI but increases total interest.',
  },
  {
    question: 'Does a larger down payment change the financed amount?',
    answer: 'Yes. Every rupee paid upfront directly reduces the loan principal. Lowering your principal decreases both your monthly EMI and the cumulative interest accrued over the life of the loan.',
  },
  {
    question: 'What documents may be required?',
    answer: 'Lenders typically request identity proof, address verification, recent salary slips or bank statements, and pro-forma invoice details for the chosen vehicle.',
  },
  {
    question: 'Does Cardom provide the loan directly?',
    answer: 'No. This frontend experience is conceptual and designed for illustrative estimation only. Cardom does not itself provide, underwrite, or approve credit facilities.',
  },
]

// ─── Abstract Automotive-Finance Hero Visual (SVG) ──────────────────────────

function FinanceHeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto flex items-center justify-center">
      {/* Diffuse orange aura */}
      <div className="absolute inset-4 rounded-full bg-orange-500/15 blur-[80px] pointer-events-none" />

      <svg viewBox="0 0 500 500" className="w-full h-full object-contain relative z-10" fill="none">
        <defs>
          <linearGradient id="finance-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="calc-aura" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Concentric financial telemetry rings */}
        <circle cx="250" cy="250" r="215" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="250" cy="250" r="165" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="250" cy="250" r="115" stroke="rgba(249,115,22,0.15)" strokeWidth="1" strokeDasharray="3 4" />

        {/* Percentage markers and HUD telemetry */}
        <g transform="translate(195, 90)">
          <rect width="110" height="24" rx="6" fill="#121212" stroke="rgba(249,115,22,0.4)" strokeWidth="1" />
          <text x="55" y="16" fill="#f97316" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            9.2% AVG RATE
          </text>
        </g>

        <g transform="translate(70, 180)">
          <text x="0" y="0" fill="rgba(249,115,22,0.6)" fontSize="20" fontFamily="monospace" fontWeight="bold">
            %
          </text>
        </g>
        <g transform="translate(410, 290)">
          <text x="0" y="0" fill="rgba(249,115,22,0.5)" fontSize="24" fontFamily="monospace" fontWeight="bold">
            %
          </text>
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

        {/* Sleek Aerodynamic Sports Car Silhouette */}
        <path
          d="M 90 285 
             C 130 285, 160 275, 190 250 
             C 220 225, 270 205, 320 205 
             C 370 205, 410 235, 430 265 
             L 450 285"
          stroke="url(#finance-line-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Baseline Horizon Guideline */}
        <line x1="70" y1="300" x2="460" y2="300" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeDasharray="6 8" />

        {/* Wheel wells */}
        <path d="M 140 300 A 26 26 0 0 1 192 300" stroke="rgba(249,115,22,0.7)" strokeWidth="2" fill="none" />
        <circle cx="166" cy="300" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        <path d="M 340 300 A 26 26 0 0 1 392 300" stroke="rgba(249,115,22,0.7)" strokeWidth="2" fill="none" />
        <circle cx="366" cy="300" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Active Simulation Status Tag */}
        <g transform="translate(60, 410)">
          <circle cx="8" cy="8" r="4" fill="#10b981" />
          <text x="20" y="12" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
            EMI SIMULATION ENGINE READY
          </text>
        </g>
      </svg>
    </div>
  )
}

// ─── Standard Reducing Balance Formula Helper ───────────────────────────────

function calculateEMI(carPrice, downPayment, annualRate, tenureYears) {
  const principal = Math.max(0, carPrice - downPayment)
  const n = tenureYears * 12

  if (principal <= 0 || n <= 0) {
    return {
      emi: 0,
      totalPayment: 0,
      totalInterest: 0,
      principal: 0,
      n,
    }
  }

  const r = annualRate / 12 / 100

  // Handle 0% interest rate separately
  if (r === 0) {
    const emi = Math.round(principal / n)
    return {
      emi,
      totalPayment: principal,
      totalInterest: 0,
      principal,
      n,
    }
  }

  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, n)
  const emi = Math.round((principal * r * factor) / (factor - 1))
  const totalPayment = emi * n
  const totalInterest = Math.max(0, totalPayment - principal)

  return {
    emi,
    totalPayment,
    totalInterest,
    principal,
    n,
  }
}

// ─── Main FinancePage Component ─────────────────────────────────────────────

export function FinancePage() {
  const calculatorRef = useRef(null)
  const { user, profile } = useAuth()

  // Calculator State
  const [carPrice, setCarPrice] = useState(2500000) // ₹25 Lakh default
  const [downPayment, setDownPayment] = useState(500000) // ₹5 Lakh default
  const [interestRate, setInterestRate] = useState(9.0) // 9.0% default
  const [tenureYears, setTenureYears] = useState(5) // 5 Years default
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Financing Application State
  const [financeFormOpen, setFinanceFormOpen] = useState(false)
  const [financeContact, setFinanceContact] = useState({
    name: '',
    phone: '',
    email: '',
    employmentType: 'Salaried',
    annualIncome: '',
  })
  const [financeLoading, setFinanceLoading] = useState(false)
  const [financeError, setFinanceError] = useState(null)
  const [financeSuccess, setFinanceSuccess] = useState(false)

  // Scroll to calculator helper
  const scrollToCalculator = () => {
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Reset Calculator to defaults
  const handleResetCalculator = () => {
    setCarPrice(2500000)
    setDownPayment(500000)
    setInterestRate(9.0)
    setTenureYears(5)
  }

  // Calculate live values
  const calculation = useMemo(() => {
    return calculateEMI(carPrice, downPayment, interestRate, tenureYears)
  }, [carPrice, downPayment, interestRate, tenureYears])

  // Sample static calculation values for section 6
  const sampleCalc = useMemo(() => {
    return calculateEMI(1000000, 200000, 9.0, 5)
  }, [])

  const handleFinanceSubmit = async (e) => {
    e.preventDefault()
    setFinanceLoading(true)
    setFinanceError(null)

    const { error } = await submitFinanceLead({
      carPrice,
      downPayment,
      loanAmount: calculation.principal,
      interestRate,
      tenureYears,
      monthlyEmi: calculation.emi,
      employmentType: financeContact.employmentType || null,
      annualIncome: financeContact.annualIncome || null,
      contactName: financeContact.name || profile?.full_name || null,
      contactPhone: financeContact.phone || profile?.phone || null,
      contactEmail: financeContact.email || user?.email || null,
      userId: user?.id || null,
    })

    setFinanceLoading(false)

    if (error) {
      setFinanceError(error.message)
      return
    }

    setFinanceSuccess(true)
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
                  <CreditCard className="w-3.5 h-3.5" />
                  Car Financing
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                  Make Your Next{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Drive Possible.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10">
                  Explore financing options and understand your monthly payments
                  before you make your move. Transparent projections and zero hidden terms.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ShimmerButton
                    size="lg"
                    onClick={scrollToCalculator}
                    className="w-full sm:w-auto min-w-[190px] shadow-[0_0_24px_rgba(249,115,22,0.3)]"
                  >
                    Calculate EMI
                    <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>

                  <Link
                    to="/cars"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 text-center transition-colors"
                  >
                    Explore Cars
                  </Link>
                </div>
              </div>

              {/* Right Column: Abstract Visual */}
              <div className="lg:col-span-5">
                <FinanceHeroVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Why Finance With Cardom ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Clarity & Confidence
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Finance Without the{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Guesswork.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY_FINANCE_FEATURES.map(({ Icon, title, description }, index) => (
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

        {/* ── 3. EMI Calculator (Main Feature) ── */}
        <section ref={calculatorRef} id="emi-calculator" className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Interactive Repayment Tool
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Know Your{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Monthly Payment.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Adjust vehicle value, upfront down payment, interest rate, and repayment duration in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Input Form (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] space-y-6 text-left">
                {/* 1. Car Price */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Vehicle Price (₹)
                    </label>
                    <span className="text-sm font-bold text-orange-400 font-mono">
                      ₹{carPrice.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={carPrice}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 mb-2"
                  />
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[1000000, 2500000, 5000000, 10000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCarPrice(val)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors',
                          carPrice === val
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-white',
                        )}
                      >
                        ₹{(val / 100000).toFixed(0)}L
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Down Payment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Down Payment (₹)
                    </label>
                    <span className="text-sm font-bold text-orange-400 font-mono">
                      ₹{downPayment.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={carPrice}
                    step="25000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Math.min(carPrice, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 mb-2"
                  />
                  {/* Percent Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[0.1, 0.2, 0.3, 0.5].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPayment(Math.round(carPrice * pct))}
                        className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-white transition-colors"
                      >
                        {pct * 100}% (₹{((carPrice * pct) / 100000).toFixed(1)}L)
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Interest Rate & Tenure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-zinc-300">
                        Interest Rate (% p.a.)
                      </label>
                      <span className="text-sm font-bold text-orange-400 font-mono">
                        {interestRate}%
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-2">
                      Loan Tenure
                    </label>
                    <select
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((yr) => (
                        <option key={yr} value={yr} className="bg-[#111111] text-white">
                          {yr} {yr === 1 ? 'Year' : 'Years'} ({yr * 12} Months)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="pt-2 flex justify-start">
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

              {/* Right Column: Dynamic EMI Output Card (5 cols) */}
              <div className="lg:col-span-5 relative p-6 sm:p-8 rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#16120d] via-[#0e0e0e] to-[#080808] shadow-2xl flex flex-col justify-between">
                <BorderBeam duration={10} colorFrom="#f97316" colorTo="transparent" />

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                    Estimated Monthly EMI
                  </span>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                      ₹{calculation.emi.toLocaleString()}
                    </span>
                    <span className="text-xs text-orange-400 font-medium">/ month</span>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="mb-6">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden flex">
                      <div
                        style={{
                          width: `${
                            calculation.totalPayment > 0
                              ? (calculation.principal / calculation.totalPayment) * 100
                              : 100
                          }%`,
                        }}
                        className="bg-orange-500 h-full"
                      />
                      <div className="bg-zinc-600 h-full flex-1" />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Principal ({calculation.totalPayment > 0 ? Math.round((calculation.principal / calculation.totalPayment) * 100) : 100}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        Interest ({calculation.totalPayment > 0 ? Math.round((calculation.totalInterest / calculation.totalPayment) * 100) : 0}%)
                      </span>
                    </div>
                  </div>

                  {/* Breakdown Metrics */}
                  <div className="space-y-3 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Principal Amount:</span>
                      <span className="font-semibold text-white font-mono">
                        ₹{calculation.principal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Estimated Interest:</span>
                      <span className="font-semibold text-orange-400 font-mono">
                        ₹{calculation.totalInterest.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                      <span className="text-zinc-300 font-medium">Total Payable:</span>
                      <span className="font-bold text-white font-mono">
                        ₹{calculation.totalPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Loan Tenure:</span>
                      <span className="text-zinc-300">
                        {calculation.n} Months ({tenureYears} Years)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    *Calculator results are illustrative estimates only. Actual rates, fees, eligibility, and repayment terms may vary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Financing Options (3 Unranked Cards) ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Repayment Architectures
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Explore Financing{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Structures.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Consider different structures based on your cash flow preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FINANCING_STRUCTURES.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="p-8 rounded-2xl border border-white/[0.07] bg-[#0c0c0c] flex flex-col text-left hover:border-orange-500/30 transition-all duration-300"
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

        {/* ── 5. Finance Journey Timeline ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Connected 4-Step Process
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                From Car Search to{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Financing.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {JOURNEY_STEPS.map((step) => (
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

        {/* ── 6. Sample Financing Scenario ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative bg-[#060606]">
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border border-orange-500/30 bg-orange-500/10 text-orange-400 mb-3">
                SAMPLE CALCULATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                See What Your Numbers{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Could Look Like.
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Illustrative sample scenario based on representative figures.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] shadow-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-white/[0.06] text-center sm:text-left">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Vehicle Price</span>
                  <p className="text-base font-bold text-white mt-0.5">₹10,00,000</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Down Payment</span>
                  <p className="text-base font-bold text-white mt-0.5">₹2,00,000 (20%)</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Illustrative Rate</span>
                  <p className="text-base font-bold text-orange-400 mt-0.5">9.0% p.a.</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Tenure</span>
                  <p className="text-base font-bold text-white mt-0.5">5 Years (60 mo)</p>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Resulting Illustrative EMI
                  </span>
                  <span className="text-3xl font-black text-orange-400 font-mono">
                    ₹{sampleCalc.emi.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500"> / month</span>
                </div>

                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Estimated Total Interest
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    ₹{sampleCalc.totalInterest.toLocaleString()}
                  </span>
                </div>

                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    Total Repayment
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    ₹{sampleCalc.totalPayment.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] text-[10px] text-zinc-500 text-center">
                *This is an illustrative sample calculation for demo purposes only and does not represent an offer from Cardom or any affiliated financing partner.
              </div>
            </div>
          </div>
        </section>

        {/* ── 6.5 Request Financing Assistance ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative bg-[#060606]">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Personalized Assistance
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Request Financing{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Assistance.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Share your details and our team will reach out with personalised financing options based on your EMI calculation above.
              </p>
            </div>

            {financeSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-10 rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#16120d] via-[#0e0e0e] to-[#080808] text-center shadow-2xl relative"
              >
                <BorderBeam duration={8} colorFrom="#f97316" colorTo="transparent" />
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
                  Our financing team will review your profile and EMI calculation, then reach out within 24 hours.
                </p>
                <div className="max-w-xs mx-auto p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-left mb-6 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Loan Amount:</span>
                    <span className="font-mono font-semibold text-white">₹{calculation.principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Monthly EMI:</span>
                    <span className="font-mono font-semibold text-orange-400">₹{calculation.emi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tenure:</span>
                    <span className="text-zinc-300">{tenureYears} Years</span>
                  </div>
                </div>
                <button
                  onClick={() => { setFinanceSuccess(false); setFinanceFormOpen(false) }}
                  className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c0c] overflow-hidden shadow-2xl">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => setFinanceFormOpen(!financeFormOpen)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-semibold text-white">Apply for Financing Assistance</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-orange-400 transition-transform duration-200',
                      financeFormOpen ? 'rotate-180' : '',
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {financeFormOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <form
                        onSubmit={handleFinanceSubmit}
                        className="px-6 pb-8 space-y-5 border-t border-white/[0.06]"
                      >
                        {/* Current Calculator Summary */}
                        <div className="mt-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] grid grid-cols-3 gap-3 text-center">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Loan Amount</span>
                            <span className="text-sm font-bold text-white font-mono">₹{calculation.principal.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Monthly EMI</span>
                            <span className="text-sm font-bold text-orange-400 font-mono">₹{calculation.emi.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Tenure</span>
                            <span className="text-sm font-bold text-white">{tenureYears}Y</span>
                          </div>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">
                              <User className="w-3 h-3 inline mr-1" />
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={profile?.full_name || 'Full name'}
                              value={financeContact.name}
                              onChange={(e) => setFinanceContact({ ...financeContact, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">
                              <Phone className="w-3 h-3 inline mr-1" />
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder={profile?.phone || '+91 XXXXX XXXXX'}
                              value={financeContact.phone}
                              onChange={(e) => setFinanceContact({ ...financeContact, phone: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">
                              <Mail className="w-3 h-3 inline mr-1" />
                              Email Address
                            </label>
                            <input
                              type="email"
                              placeholder={user?.email || 'your@email.com'}
                              value={financeContact.email}
                              onChange={(e) => setFinanceContact({ ...financeContact, email: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5">
                              <Briefcase className="w-3 h-3 inline mr-1" />
                              Employment Type
                            </label>
                            <select
                              value={financeContact.employmentType}
                              onChange={(e) => setFinanceContact({ ...financeContact, employmentType: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                            >
                              <option value="Salaried">Salaried</option>
                              <option value="Self-Employed">Self-Employed</option>
                              <option value="Business Owner">Business Owner</option>
                              <option value="Freelancer">Freelancer</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs text-zinc-400 block mb-1.5">
                              Annual Income (approx.)
                            </label>
                            <select
                              value={financeContact.annualIncome}
                              onChange={(e) => setFinanceContact({ ...financeContact, annualIncome: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-lg text-xs bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                            >
                              <option value="">Prefer not to say</option>
                              <option value="Below 3L">Below ₹3 Lakh</option>
                              <option value="3L–6L">₹3 – 6 Lakh</option>
                              <option value="6L–12L">₹6 – 12 Lakh</option>
                              <option value="12L–25L">₹12 – 25 Lakh</option>
                              <option value="25L–50L">₹25 – 50 Lakh</option>
                              <option value="Above 50L">Above ₹50 Lakh</option>
                            </select>
                          </div>
                        </div>

                        {/* Error Banner */}
                        {financeError && (
                          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                            {financeError}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <ShimmerButton
                            size="md"
                            className="w-full sm:w-auto min-w-[200px]"
                            disabled={financeLoading}
                          >
                            {financeLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting…
                              </>
                            ) : (
                              <>
                                Submit Financing Request
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </ShimmerButton>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* ── 7. Documents / Eligibility ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Verification Guidelines
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Get Ready Before{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  You Apply.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {DOCUMENT_REQUIREMENTS.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl border border-white/[0.07] bg-[#0d0d0d] text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-orange-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. FAQ Accordion ── */}
        <section className="py-20 sm:py-28 border-b border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 mb-2 block">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Answers About{' '}
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Auto Financing.
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
              Ready to Make the{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Numbers Work?
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-8">
              Explore your next car and understand the financing journey before you move forward.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ShimmerButton size="md" onClick={scrollToCalculator} className="w-full sm:w-auto">
                Calculate EMI
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

      <Footer />
    </div>
  )
}

