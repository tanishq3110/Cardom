import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Car,
  Tag,
  CreditCard,
  ShieldCheck,
  Repeat2,
  Wrench,
  PhoneCall,
  Package,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Activity,
  Compass,
  CheckCircle2,
  Sliders,
  Radio,
  Zap,
  Shield,
  Eye,
  Workflow,
  Network,
  Globe,
  Milestone,
  Check,
  Search,
  SlidersHorizontal,
  Navigation,
  FileText,
  Calendar,
  Truck,
  Cpu,
  RefreshCw,
  FolderLock,
  Receipt,
  FileCheck,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

// ─── 5 Cockpit Steps ─────────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  {
    id: 'discover',
    number: '01',
    title: 'Discover',
    tagline: 'Start with search',
    description: 'Find vehicles, services, parts, insurance, financing, and other automotive options tailored to your needs.',
  },
  {
    id: 'compare',
    number: '02',
    title: 'Compare',
    tagline: 'Transparent data',
    description: 'Review verified specifications, upfront costs, warranties, and terms side-by-side before making decisions.',
  },
  {
    id: 'choose',
    number: '03',
    title: 'Choose',
    tagline: 'Confirm selections',
    description: 'Select the car or specific automotive service tier that fits your budget and lifestyle journey.',
  },
  {
    id: 'connect',
    number: '04',
    title: 'Connect',
    tagline: 'Direct dispatch',
    description: 'Seamlessly transition into digital onboarding, workshop appointments, or verified seller conversations.',
  },
  {
    id: 'drive',
    number: '05',
    title: 'Drive',
    tagline: 'Continuous support',
    description: 'Enjoy connected vehicle ownership with ongoing maintenance, emergency roadside standby, and digital records.',
  },
]

// ─── 6 Different Journey Cards (+ Parts) ─────────────────────────────────────
const DIFFERENT_JOURNEYS = [
  {
    title: 'BUY A CAR',
    desc: 'Discover and compare certified pre-owned and new vehicles based on your lifestyle.',
    cta: 'Explore Cars',
    href: '/cars',
    Icon: Car,
  },
  {
    title: 'SELL YOUR CAR',
    desc: 'Prepare your vehicle for its next journey with instant valuation and verified buyers.',
    cta: 'Sell Your Car',
    href: '/sell',
    Icon: Tag,
  },
  {
    title: 'PROTECT YOUR CAR',
    desc: 'Explore comprehensive auto insurance policies with zero-depreciation coverage.',
    cta: 'Explore Insurance',
    href: '/insurance',
    Icon: ShieldCheck,
  },
  {
    title: 'FINANCE YOUR CAR',
    desc: 'Understand financing terms, estimate monthly EMIs, and compare leading lenders.',
    cta: 'Explore Finance',
    href: '/finance',
    Icon: CreditCard,
  },
  {
    title: 'MAINTAIN YOUR CAR',
    desc: 'Book verified workshop appointments, routine servicing, and live repair updates.',
    cta: 'Book Service',
    href: '/service',
    Icon: Wrench,
  },
  {
    title: 'HANDLE THE UNEXPECTED',
    desc: 'Get rapid 24/7 roadside assistance, flat tyre fixes, battery boosts, and towing.',
    cta: 'Get Assistance',
    href: '/roadside',
    Icon: PhoneCall,
  },
]

// ─── 10 FAQs ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What can I do with Cardom?',
    a: 'Cardom is an integrated automotive platform where you can search and buy cars, list your current vehicle for sale, compare auto loans, bind insurance policies, configure vehicle subscriptions, book certified workshop servicing, dispatch roadside assistance, and discover precision spare parts.',
  },
  {
    q: 'Can I buy a car through Cardom?',
    a: 'Yes. You can explore our Car Marketplace, filter by price, brand, mileage, and body type, inspect high-resolution galleries and verified history reports, and submit inquiries for certified vehicles.',
  },
  {
    q: 'Can I sell my car?',
    a: 'Yes. The Sell Your Car workflow lets you enter vehicle specifications, receive an instant fair-market valuation range, and submit your car to vetted nationwide buyer networks.',
  },
  {
    q: 'Can I book vehicle servicing?',
    a: 'Yes. You can select your car, choose service packages (Periodic Service, Brakes, AC, Engine Diagnostics), select a partner service center by city, pick a date & time slot, and opt for doorstep valet pickup.',
  },
  {
    q: 'Can I request roadside assistance?',
    a: 'Yes. The Roadside Assistance portal allows instant dispatch requests for flat tyres, battery jump-starts, fuel delivery, towing, or breakdown recovery with simulated real-time GPS telemetry.',
  },
  {
    q: 'Can I find spare parts?',
    a: 'Yes. Our Spare Parts catalog includes a vehicle compatibility engine covering 8 vehicle brands, letting you discover direct-fit OEM and performance replacement components.',
  },
  {
    q: 'Can Cardom provide financing?',
    a: 'Cardom provides real-time EMI calculators and eligibility tools connecting buyers with verified partner lending institutions and banks.',
  },
  {
    q: 'Are all Cardom services currently connected to live backends?',
    a: 'This project is a high-fidelity frontend interactive prototype demonstrating complete workflows, calculator logic, and interface designs. Live transactions, real banking APIs, and physical workshops will activate upon backend rollout.',
  },
  {
    q: 'Does Cardom have a mobile app?',
    a: 'Cardom is built as a fully responsive web application engineered to operate fluidly on modern mobile screens, tablets, and desktop browsers without requiring a separate app download.',
  },
  {
    q: 'Will Cardom support future mobility services?',
    a: 'Our long-term architectural vision includes connected vehicle IoT diagnostics, shared mobility subscriptions, and AI predictive maintenance scheduling as automotive technologies advance.',
  },
]

export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeFaq, setActiveFaq] = useState(0)

  const scrollToJourney = () => {
    document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })
  }

  const currentStepData = JOURNEY_STEPS[activeStep]

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-80 -right-48 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* ─── 1. HERO — HOW CARDOM WORKS ──────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Milestone className="w-3.5 h-3.5" />
                <span>How Cardom Works</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.1]">
                From Search <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
                  to Drive.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                Cardom connects the different parts of your automotive journey through one platform — from discovering your next car to maintaining the one you already own.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/cars"
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore Cars</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={scrollToJourney}
                  className="px-8 py-4 rounded-xl text-sm font-semibold border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Services</span>
                  <ChevronDown className="w-4 h-4 text-orange-400" />
                </button>
              </div>

              {/* Linear Flow Pill Bar */}
              <div className="pt-4 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-zinc-500 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-orange-400 font-bold">DISCOVER</span>
                <span>→</span>
                <span className="text-zinc-300">COMPARE</span>
                <span>→</span>
                <span className="text-zinc-300">CHOOSE</span>
                <span>→</span>
                <span className="text-zinc-300">CONNECT</span>
                <span>→</span>
                <span className="text-orange-400 font-bold">DRIVE</span>
              </div>
            </div>

            {/* Right: Custom Animated Journey Route Visual (SVG/CSS) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col justify-between">
                <BorderBeam size={220} duration={10} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Status */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-orange-400" />
                    <span>AUTOMOTIVE JOURNEY MAP</span>
                  </div>
                  <span className="text-emerald-400">TELEMETRY: SYNCED</span>
                </div>

                {/* SVG Route Visualization */}
                <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
                  <svg className="absolute inset-0 w-full h-full stroke-orange-500/25" viewBox="0 0 400 300" fill="none">
                    {/* Grid perspective */}
                    <line x1="0" y1="260" x2="400" y2="260" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="200" x2="400" y2="200" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="400" y2="140" strokeWidth="0.5" strokeDasharray="3 3" />

                    {/* Glowing S-Curve Route Trace */}
                    <path
                      d="M 40 230 C 120 230, 100 80, 200 80 C 300 80, 280 230, 360 230"
                      stroke="#f97316"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_#f97316]"
                    />

                    {/* Route Waypoints */}
                    <circle cx="40" cy="230" r="7" fill="#111" stroke="#f97316" strokeWidth="2" />
                    <circle cx="150" cy="120" r="7" fill="#111" stroke="#f97316" strokeWidth="2" />
                    <circle cx="200" cy="80" r="9" fill="#f97316" stroke="#fff" strokeWidth="2" />
                    <circle cx="250" cy="120" r="7" fill="#111" stroke="#f97316" strokeWidth="2" />
                    <circle cx="360" cy="230" r="7" fill="#111" stroke="#f97316" strokeWidth="2" />
                  </svg>

                  {/* Waypoint Text Badges */}
                  <div className="absolute bottom-10 left-4 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    01 DISCOVER
                  </div>
                  <div className="absolute top-16 left-28 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    02 COMPARE
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-black font-bold rounded px-2.5 py-0.5 text-[10px] font-mono shadow-[0_0_12px_#f97316]">
                    03 CHOOSE
                  </div>
                  <div className="absolute top-16 right-28 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    04 CONNECT
                  </div>
                  <div className="absolute bottom-10 right-4 bg-black/80 border border-orange-500/50 rounded px-2 py-0.5 text-[9px] font-mono text-orange-400">
                    05 DRIVE
                  </div>

                  {/* Animated Center Vehicle Reticle */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-orange-500/30 flex items-center justify-center pointer-events-none"
                  >
                    <Car className="w-6 h-6 text-orange-400" />
                  </motion.div>
                </div>

                {/* Status Box */}
                <div className="rounded-xl border border-orange-500/40 bg-orange-500/[0.06] p-3 text-center">
                  <span className="text-xs font-mono font-semibold text-orange-400 uppercase tracking-wider">
                    Continuous Driver Experience Architecture
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2 & 3. THE JOURNEY & INTERACTIVE JOURNEY COCKPIT ─────────────── */}
        <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              INTERACTIVE WALKTHROUGH
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              Your Journey, Connected.
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Whether you’re buying, selling, financing, protecting, maintaining, or simply keeping your vehicle moving, Cardom is designed around the journey.
            </p>
          </div>

          {/* Interactive Cockpit Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Vertical Step Navigation (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl p-4 sm:p-6 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 px-3 pb-2 border-b border-white/10">
                Step Sequence
              </div>

              {JOURNEY_STEPS.map((step, idx) => {
                const isActive = activeStep === idx
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden group cursor-pointer',
                      isActive
                        ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                        : 'border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03]'
                    )}
                  >
                    <span
                      className={cn(
                        'w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors',
                        isActive
                          ? 'bg-orange-500 text-black'
                          : 'bg-white/5 text-zinc-400 group-hover:text-white'
                      )}
                    >
                      {step.number}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn('text-sm font-bold', isActive ? 'text-white' : 'text-zinc-300')}>
                          {step.title}
                        </span>
                        <span className="text-[10px] font-mono text-orange-400">{step.tagline}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500 shadow-[0_0_8px_#f97316]" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* RIGHT COLUMN: Dynamic Interactive Visual Cockpit (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border-2 border-orange-500/60 bg-[#0d0d0d]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(249,115,22,0.18)] min-h-[460px] flex flex-col justify-between relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepData.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
                          Step {currentStepData.number} • {currentStepData.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                          COCKPIT SIMULATION
                        </span>
                      </div>

                      <h3 className="text-2xl font-heading font-bold text-white mt-3 mb-2">
                        {currentStepData.title}: {currentStepData.tagline}
                      </h3>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                        {currentStepData.description}
                      </p>

                      {/* State Specific Dynamic Panels */}
                      {currentStepData.id === 'discover' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                          {['Cars Marketplace', 'Auto Insurance', 'Car Financing', 'Service Center', 'Roadside SOS', 'Spare Parts'].map((item, i) => (
                            <div key={item} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                              <span className="text-zinc-200">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {currentStepData.id === 'compare' && (
                        <div className="space-y-2 font-mono text-xs">
                          <div className="grid grid-cols-4 p-2 rounded-lg bg-white/5 font-semibold text-zinc-400 text-[11px]">
                            <span>CRITERIA</span>
                            <span>OPTION A</span>
                            <span>OPTION B</span>
                            <span>VERDICT</span>
                          </div>
                          <div className="grid grid-cols-4 p-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-300">
                            <span>Price/EMI</span>
                            <span className="text-white">₹42,000/mo</span>
                            <span className="text-white">₹46,500/mo</span>
                            <span className="text-emerald-400">Lower Total</span>
                          </div>
                          <div className="grid grid-cols-4 p-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-300">
                            <span>Coverage</span>
                            <span className="text-white">Comprehensive</span>
                            <span className="text-white">Zero-Dep</span>
                            <span className="text-orange-400">Max Shield</span>
                          </div>
                          <div className="grid grid-cols-4 p-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-300">
                            <span>Warranty</span>
                            <span className="text-white">12 Months</span>
                            <span className="text-white">24 Months</span>
                            <span className="text-emerald-400">Extended</span>
                          </div>
                        </div>
                      )}

                      {currentStepData.id === 'choose' && (
                        <div className="p-4 rounded-xl border border-orange-500/40 bg-orange-500/[0.05] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-orange-400 uppercase">YOUR SELECTION</span>
                            <div className="text-base font-bold text-white mt-0.5">BMW 3 Series 330i (2022)</div>
                            <div className="text-xs text-zinc-400 mt-1">Direct Verification Confirmed • Instant Dispatch Ready</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold shadow-[0_0_15px_#f97316]">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}

                      {currentStepData.id === 'connect' && (
                        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                          <div className="text-[10px] font-mono uppercase text-zinc-500">CARDOM SERVICE NETWORK STATUS</div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-zinc-300">Verified Partner Workshop:</span>
                            <span className="text-emerald-400 font-bold">ONLINE & DISPATCHED</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-zinc-300">Digital Document Vault:</span>
                            <span className="text-orange-400 font-bold">ENCRYPTED & SYNCED</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-zinc-300">Dedicated Service Concierge:</span>
                            <span className="text-white font-bold">ASSIGNED</span>
                          </div>
                        </div>
                      )}

                      {currentStepData.id === 'drive' && (
                        <div className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-zinc-400">Telemetry Status:</span>
                            <span className="text-emerald-400 font-bold">ACTIVE ODYSSEY</span>
                          </div>
                          <div className="text-lg font-bold font-mono text-orange-400">
                            YOUR JOURNEY IS MOVING
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Continuous 24/7 incident roadside backing, digital logbook recording, and automated service reminders.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        Previous Step
                      </button>

                      <div className="flex items-center gap-1.5">
                        {JOURNEY_STEPS.map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              activeStep === i ? 'w-6 bg-orange-500' : 'bg-white/20'
                            )}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={activeStep === JOURNEY_STEPS.length - 1}
                        onClick={() => setActiveStep((prev) => Math.min(JOURNEY_STEPS.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-black font-bold text-xs hover:bg-orange-400 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                      >
                        Next Step
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. DIFFERENT JOURNEYS (6 Interactive Cards + Parts) ─────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              FLEXIBLE PATHWAYS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              One Platform. Different Journeys.
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Enter the Cardom ecosystem at whichever point your vehicle needs right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {DIFFERENT_JOURNEYS.map((journey) => {
              const Icon = journey.Icon
              return (
                <div
                  key={journey.title}
                  className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 flex flex-col justify-between hover:border-orange-500/50 hover:bg-[#111] transition-all duration-300 group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                      {journey.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      {journey.desc}
                    </p>
                  </div>

                  <Link
                    to={journey.href}
                    className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-300 group-hover:text-white group-hover:border-orange-500/40 transition-colors"
                  >
                    <span>{journey.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* 7th Option: Find Parts Banner */}
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/[0.05] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Looking For Replacement Components?</h4>
                <p className="text-xs text-zinc-400">Browse our precision fitment catalog covering brakes, engine filters, and batteries.</p>
              </div>
            </div>
            <Link
              to="/parts"
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors shrink-0"
            >
              Explore Parts →
            </Link>
          </div>
        </section>

        {/* ─── 5. BUYING JOURNEY (Miniature Marketplace Mock) ─────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                  MARKETPLACE FLOW
                </span>
                <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                  Buying a Car
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Experience a transparent vehicle acquisition process engineered with verified vehicle dossiers and upfront pricing.
                </p>

                {/* Flow Sequence */}
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pt-2 flex-wrap">
                  <span className="px-2 py-1 rounded bg-white/5 text-orange-400">SEARCH</span>
                  <span>↓</span>
                  <span className="px-2 py-1 rounded bg-white/5">FILTER</span>
                  <span>↓</span>
                  <span className="px-2 py-1 rounded bg-white/5">COMPARE</span>
                  <span>↓</span>
                  <span className="px-2 py-1 rounded bg-white/5">VIEW</span>
                  <span>↓</span>
                  <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-300 font-bold">CHOOSE</span>
                </div>

                <div className="pt-4">
                  <Link
                    to="/cars"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  >
                    <span>Explore Cars</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Miniature Marketplace Mock UI Card */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-white/15 bg-[#0d0d0d] p-5 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs font-mono">
                    <span className="text-orange-400">FEATURED DOSSIER</span>
                    <span className="text-zinc-500">100% INSPECTED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-6 h-44 rounded-xl overflow-hidden bg-black relative">
                      <img
                        src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80"
                        alt="BMW M3 Competition"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-500 text-black">
                        HOT DEAL
                      </span>
                    </div>

                    <div className="sm:col-span-6 space-y-2">
                      <div className="text-[10px] font-mono text-zinc-500">BMW • 2023 MODEL</div>
                      <div className="font-bold text-base text-white">M3 Competition xDrive</div>
                      <div className="text-xl font-bold font-mono text-orange-400">₹95,00,000</div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/10">
                        <div>Odo: 11,200 km</div>
                        <div>Fuel: Petrol</div>
                        <div>Loc: Mumbai, MH</div>
                        <div>Trans: Automatic</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. OWNERSHIP JOURNEY (Circular Ecosystem) ──────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              POST-PURCHASE SUPPORT
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              After You Drive Away.
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Cardom is designed to stay useful beyond the initial vehicle purchase.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 sm:p-12 relative flex items-center justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
              {[
                { title: 'INSURANCE', icon: ShieldCheck, sub: 'Policy Renewal' },
                { title: 'SERVICE', icon: Wrench, sub: 'Maintenance' },
                { title: 'PARTS', icon: Package, sub: 'OEM Upgrades' },
                { title: 'ROADSIDE', icon: PhoneCall, sub: '24/7 Safety Net' },
                { title: 'FINANCE', icon: CreditCard, sub: 'EMI Management' },
                { title: 'DETAILING', icon: Sparkles, sub: 'Studio Protection' },
              ].map((node) => {
                const Icon = node.icon
                return (
                  <div
                    key={node.title}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center hover:border-orange-500/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-mono font-bold text-xs text-white">{node.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{node.sub}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 7, 8, 9. SERVICE, ROADSIDE & PARTS JOURNEYS ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 space-y-8">
          {/* Service Flow */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-orange-400 uppercase font-bold">SERVICE JOURNEY</span>
                <h4 className="text-xl font-bold text-white mt-1">Periodic Maintenance Flow</h4>
              </div>
              <Link
                to="/service"
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors self-start sm:self-auto"
              >
                Book a Service
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs text-center">
              {['01. SERVICE DUE', '02. SELECT CAR', '03. CHOOSE HUB', '04. SCHEDULE', '05. WORKSHOP', '06. PASSPORT RECORD'].map((s, idx) => (
                <div key={s} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-300">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Roadside Flow */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-orange-400 uppercase font-bold">ROADSIDE JOURNEY</span>
                <h4 className="text-xl font-bold text-white mt-1">When Something Goes Wrong</h4>
              </div>
              <Link
                to="/roadside"
                className="px-5 py-2.5 rounded-xl border border-orange-500 text-orange-400 text-xs font-bold hover:bg-orange-500 hover:text-black transition-colors self-start sm:self-auto"
              >
                Request Assistance
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
              {['01. REPORT ISSUE', '02. GPS LOCATE', '03. AI DISPATCH', '04. CREW EN ROUTE', '05. SAFE RECOVERY'].map((s) => (
                <div key={s} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-300">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Parts Flow */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-orange-400 uppercase font-bold">PARTS JOURNEY</span>
                <h4 className="text-xl font-bold text-white mt-1">Find the Right Part</h4>
              </div>
              <Link
                to="/parts"
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors self-start sm:self-auto"
              >
                Explore Parts
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center mb-2">
              {['01. SELECT MAKE', '02. FIND PART', '03. CHECK FITMENT', '04. COMPARE', '05. ORDER*'].map((s) => (
                <div key={s} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-300">
                  {s}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 text-right italic pt-2">
              *Commerce and supplier fulfillment are future integrations.
            </p>
          </div>
        </section>

        {/* ─── 10. ONE ACCOUNT, ONE JOURNEY (Future Platform Experience) ───── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-orange-500/30 bg-black/60 p-8 sm:p-14 text-center relative overflow-hidden">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              FUTURE PLATFORM EXPERIENCE
            </span>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2 mb-8">
              One Place to Manage the Journey.
            </h3>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {[
                { name: 'MY VEHICLE', icon: Car },
                { name: 'MY SERVICES', icon: Wrench },
                { name: 'MY DOCUMENTS', icon: FileText },
                { name: 'MY REQUESTS', icon: Activity },
                { name: 'MY PARTS', icon: Package },
                { name: 'MY FINANCE', icon: CreditCard },
                { name: 'MY INSURANCE', icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.name}
                    className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-300 flex items-center gap-2 hover:border-orange-500/40 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-orange-400" />
                    <span>{item.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 11. WHAT HAPPENS BEHIND THE SCENES ──────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 sm:p-12 text-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              PLATFORM ARCHITECTURE — CONCEPT
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1 mb-10">
              Behind the Experience
            </h3>

            {/* Architecture Hierarchy */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-3.5 rounded-xl border border-white/15 bg-white/[0.02] font-mono text-xs font-bold text-white">
                DRIVER INTERFACE
              </div>
              <div className="text-orange-400 text-sm font-bold">↓</div>
              <div className="p-3.5 rounded-xl border border-orange-500/50 bg-orange-500/10 font-mono text-xs font-bold text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                CARDOM PLATFORM CORE
              </div>
              <div className="text-orange-400 text-sm font-bold">↓</div>
              <div className="p-3.5 rounded-xl border border-white/15 bg-white/[0.02] font-mono text-xs font-bold text-zinc-300">
                AUTOMOTIVE SERVICES ECOSYSTEM
              </div>

              {/* Sub-branches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                {['MARKETPLACE', 'FINANCE', 'INSURANCE', 'WORKSHOP NETWORK', 'ROADSIDE GPS', 'PARTS HUBS', 'FUTURE MOBILITY'].map((b) => (
                  <div key={b} className="p-2 rounded-lg border border-white/5 bg-black/40 text-[10px] font-mono text-zinc-400">
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 12. SIMPLE FOR THE DRIVER (3 Statements) ────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">LESS SEARCHING</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Find relevant automotive experiences in one place with unified search models.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">LESS FRICTION</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Move between different parts of your vehicle journey more easily and predictably.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">MORE CONNECTION</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Build a more connected relationship with your vehicle through complete historical data.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 13. FAQ ACCORDION (10 Questions) ────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              HELP & GUIDANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
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

        {/* ─── 14. FINAL CTA ──────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                YOUR JOURNEY STARTS HERE
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                Everything You Need. One Connected Journey.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                Explore cars, services, protection, maintenance, and more through the Cardom experience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/cars"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                >
                  Explore Cars
                </Link>
                <button
                  type="button"
                  onClick={scrollToJourney}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors"
                >
                  Explore Services
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

