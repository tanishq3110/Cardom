import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  PhoneCall,
  Disc,
  BatteryCharging,
  Fuel,
  Truck,
  AlertTriangle,
  Key,
  Wrench,
  ShieldAlert,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Navigation,
  Crosshair,
  Car,
  Check,
  RotateCcw,
  Sliders,
  X,
  Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

// ─── 8 Emergency Roadside Issues ──────────────────────────────────────────────
const EMERGENCY_SERVICES = [
  {
    id: 'flat-tyre',
    title: 'Flat Tyre',
    desc: 'Rapid puncture repair, stepney tyre installation, and roadside pressure inflation.',
    Icon: Disc,
    badge: 'Immediate',
    estTime: '20–30 min',
  },
  {
    id: 'dead-battery',
    title: 'Dead Battery',
    desc: 'Jump-start service with heavy-duty cables or instant on-site battery replacement.',
    Icon: BatteryCharging,
    badge: 'Quick Boost',
    estTime: '15–25 min',
  },
  {
    id: 'fuel-delivery',
    title: 'Fuel Delivery',
    desc: 'Emergency delivery of up to 5 liters of high-grade petrol or diesel directly to your car.',
    Icon: Fuel,
    badge: 'Fuel On Demand',
    estTime: '25–35 min',
  },
  {
    id: 'towing',
    title: 'Towing',
    desc: 'Hydraulic flatbed or under-lift recovery towing to your preferred destination or partner garage.',
    Icon: Truck,
    badge: 'Heavy Recovery',
    estTime: '30–45 min',
  },
  {
    id: 'breakdown',
    title: 'Car Breakdown',
    desc: 'Engine stall, sudden overheating, alternator failure, or loss of drivetrain power.',
    Icon: AlertTriangle,
    badge: 'Diagnostic',
    estTime: '25–40 min',
  },
  {
    id: 'lockout',
    title: 'Lockout Assistance',
    desc: 'Zero-damage non-destructive vehicle entry by verified automotive lock specialists.',
    Icon: Key,
    badge: 'Damage-Free',
    estTime: '20–30 min',
  },
  {
    id: 'mechanical',
    title: 'Minor Mechanical Issue',
    desc: 'Coolant leaks, snapped fan belts, blown fuses, or loose brake calipers fixed roadside.',
    Icon: Wrench,
    badge: 'Spot Fix',
    estTime: '30–45 min',
  },
  {
    id: 'accident',
    title: 'Accident Support',
    desc: 'Emergency vehicle extraction, spot claim documentation, and safety perimeter setup.',
    Icon: ShieldAlert,
    badge: 'Priority 1',
    estTime: '15–25 min',
  },
]

// ─── Sample Indian Cities ─────────────────────────────────────────────────────
const INDIAN_CITIES = [
  { id: 'delhi', name: 'Delhi NCR', landmark: 'Outer Ring Road, Near Aerocity' },
  { id: 'mumbai', name: 'Mumbai', landmark: 'Western Express Highway, Near BKC Flyover' },
  { id: 'bangalore', name: 'Bangalore', landmark: 'Outer Ring Road, Bellandur Junction' },
  { id: 'hyderabad', name: 'Hyderabad', landmark: 'PVNR Expressway, Pillar 140' },
  { id: 'chennai', name: 'Chennai', landmark: 'OMR Road, Near Sholinganallur' },
]

// ─── Sample Demo Vehicles ─────────────────────────────────────────────────────
const PRESET_VEHICLES = [
  { brand: 'BMW', model: '3 Series 330i', year: '2022', reg: 'MH 02 CD 8821' },
  { brand: 'Mercedes-Benz', model: 'C-Class C200', year: '2023', reg: 'DL 01 AB 4509' },
  { brand: 'Hyundai', model: 'Creta SX(O)', year: '2022', reg: 'KA 05 MN 3290' },
  { brand: 'Tata', model: 'Nexon EV Max', year: '2023', reg: 'TS 09 XY 6711' },
]

// ─── Why Cardom Roadside ─────────────────────────────────────────────────────
const ROADSIDE_PILLARS = [
  {
    title: '24/7 Rapid Incident Command',
    desc: 'Dedicated emergency dispatch hub coordinating real-time recovery units across major highway corridors.',
    Icon: Radio,
  },
  {
    title: 'Live Telemetry & Tracking',
    desc: 'Watch your assigned recovery vehicle navigate directly to your coordinates in real time via live radar.',
    Icon: Navigation,
  },
  {
    title: 'Certified OEM Mechanics',
    desc: 'Every rescue truck is staffed with licensed technicians equipped with computerized OBD-II diagnostic units.',
    Icon: ShieldCheck,
  },
  {
    title: 'Zero Hidden Tolls or Fees',
    desc: 'Transparent pricing with comprehensive roadside coverage options and zero surcharge on night rescues.',
    Icon: Activity,
  },
]

// ─── Roadside FAQs ───────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How fast will a roadside assistance truck reach me?',
    a: 'Across covered metropolitan zones and major expressway stretches, our average dispatch ETA is 24 to 45 minutes (marked as illustrative demo value in this prototype). Heavy weather or extreme highway congestions may slightly alter arrival times.',
  },
  {
    q: 'Is towing covered to any location I choose?',
    a: 'Standard towing covers transport to any Cardom certified service hub or any authorized workshop within a 40 km radius. Extra distance can be accommodated at a standardized per-kilometer rate.',
  },
  {
    q: 'What if my car breaks down late at night on an isolated highway?',
    a: 'Our emergency incident desk operates 24/7/365 without exception. When you request assistance, we stay in voice communication with you, dispatch the nearest GPS-tracked patrol vehicle, and alert local highway authorities if necessary.',
  },
  {
    q: 'Can you deliver fuel if my tank runs completely dry?',
    a: 'Yes, our patrol units carry approved fuel safety containers and will deliver up to 5 liters of verified petrol or diesel to restart your engine and enable you to reach the nearest fuel station.',
  },
  {
    q: 'Does roadside assistance affect my vehicle manufacturer warranty?',
    a: 'Not at all. Our team uses non-invasive entry protocols, factory-specified jump-start surge protectors, and flatbed recovery trucks that protect your drivetrain from towing strain.',
  },
]

export function RoadsidePage() {
  // ─── State Management ───────────────────────────────────────────────────────
  const [selectedIssueId, setSelectedIssueId] = useState('flat-tyre')
  
  // Vehicle Details
  const [vehicleBrand, setVehicleBrand] = useState('BMW')
  const [vehicleModel, setVehicleModel] = useState('3 Series 330i')
  const [vehicleYear, setVehicleYear] = useState('2022')
  const [vehicleReg, setVehicleReg] = useState('MH 02 CD 8821')

  // Location Details
  const [selectedCity, setSelectedCity] = useState('mumbai')
  const [currentArea, setCurrentArea] = useState('Western Express Highway, Near BKC Flyover')
  const [usingGps, setUsingGps] = useState(false)
  const [gpsActive, setGpsActive] = useState(false)

  // Contact
  const [contactName, setContactName] = useState('Alex Rivera')
  const [contactPhone, setContactPhone] = useState('+91 98765 43210')
  const [notes, setNotes] = useState('Tyre blew out on the highway shoulder. Hazards are on.')

  // Cockpit visual status
  const [radarState, setRadarState] = useState('ready') // 'ready' or 'scanning'

  // Booking Modal
  const [requestConfirmed, setRequestConfirmed] = useState(false)
  const [requestId, setRequestId] = useState('')

  // Active FAQ
  const [activeFaq, setActiveFaq] = useState(0)

  // Quick Preset Vehicle Handler
  const handleSelectPreset = (v) => {
    setVehicleBrand(v.brand)
    setVehicleModel(v.model)
    setVehicleYear(v.year)
    setVehicleReg(v.reg)
  }

  // City change handler
  const handleCityChange = (cityId) => {
    setSelectedCity(cityId)
    const found = INDIAN_CITIES.find((c) => c.id === cityId)
    if (found) setCurrentArea(found.landmark)
    setGpsActive(false)
  }

  // Mock "Use Current Location"
  const handleUseCurrentLocation = () => {
    setUsingGps(true)
    setTimeout(() => {
      setUsingGps(false)
      setGpsActive(true)
      setCurrentArea('Demo GPS: Sector 18, Express Highway Mile 14 (Simulated)')
    }, 700)
  }

  // Selected Service Object
  const activeService = EMERGENCY_SERVICES.find((s) => s.id === selectedIssueId) || EMERGENCY_SERVICES[0]
  const currentCityObj = INDIAN_CITIES.find((c) => c.id === selectedCity) || INDIAN_CITIES[1]

  // Submit Request
  const handleConfirmRequest = () => {
    const generatedId = 'CDM-RSA-' + Math.floor(100000 + Math.random() * 900000)
    setRequestId(generatedId)
    setRequestConfirmed(true)
  }

  // Smooth scroll helpers
  const scrollToCockpit = () => {
    document.getElementById('request-cockpit')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToServices = () => {
    document.getElementById('services-selector')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-80 -right-48 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* ─── 1. HERO: EMERGENCY RESPONSE EXPERIENCE ──────────────────────── */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Emergency Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span>Roadside Assistance</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.1]">
                Help When You <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">Need It Most.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                From sudden breakdowns and flat tyres to dead batteries and emergencies, Cardom connects you with verified roadside support crews in minutes.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToCockpit}
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <PhoneCall className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span>Request Assistance</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToServices}
                  className="px-8 py-4 rounded-xl text-sm font-semibold border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>

              {/* Emergency Hotline Hint */}
              <div className="flex items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>24/7 Incident Dispatch Network:</span>
                <span className="text-orange-400 font-bold tracking-wider">1800-CARDOM-SOS</span>
              </div>
            </div>

            {/* Right: Futuristic Roadside Command HUD Visual */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/80 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col justify-between">
                <BorderBeam size={220} duration={10} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Telemetry Line */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span>COMMAND TELEMETRY</span>
                  </div>
                  <span className="text-orange-400">BEACON: ACTIVE</span>
                </div>

                {/* Futuristic Highway Radar Visual Canvas */}
                <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
                  {/* Perspective Highway Grid Lines */}
                  <svg className="absolute inset-0 w-full h-full stroke-orange-500/20" viewBox="0 0 400 300" fill="none">
                    {/* Vanishing point horizon */}
                    <line x1="0" y1="120" x2="400" y2="120" strokeWidth="0.8" strokeDasharray="2 4" />
                    {/* Highway perspective lanes */}
                    <line x1="200" y1="120" x2="40" y2="300" strokeWidth="1.2" stroke="rgba(249,115,22,0.3)" />
                    <line x1="200" y1="120" x2="360" y2="300" strokeWidth="1.2" stroke="rgba(249,115,22,0.3)" />
                    <line x1="200" y1="120" x2="160" y2="300" strokeWidth="0.8" strokeDasharray="6 6" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="120" x2="240" y2="300" strokeWidth="0.8" strokeDasharray="6 6" stroke="rgba(249,115,22,0.5)" />
                    {/* Glowing orange route trace */}
                    <path
                      d="M 120 270 Q 180 200, 200 130"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_#f97316]"
                    />
                  </svg>

                  {/* Concentric Radar Circles */}
                  <div className="absolute w-44 h-44 rounded-full border border-orange-500/20 animate-ping opacity-30" />
                  <div className="absolute w-64 h-64 rounded-full border border-orange-500/15" />
                  <div className="absolute w-32 h-32 rounded-full border border-orange-500/30" />

                  {/* Vehicle Marker Reticle */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-orange-400 shadow-[0_0_20px_#f97316]">
                      <Car className="w-5 h-5" />
                    </div>
                    <span className="mt-1 text-[10px] font-mono font-bold text-orange-300 bg-black/80 px-2 py-0.5 rounded border border-orange-500/40">
                      INCIDENT PIN • LOCATED
                    </span>
                  </div>

                  {/* Patrol Vehicle Node in distance */}
                  <div className="absolute top-16 right-20 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-md border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-300">PATROL TRUCK DELTA-4 (~12m)</span>
                  </div>

                  {/* Telemetry Coordinates in Corner */}
                  <div className="absolute bottom-2 left-3 text-[9px] font-mono text-zinc-500 space-y-0.5">
                    <div>LAT 28.6139° N • LON 77.2090° E</div>
                    <div>FREQ: 462.5625 MHz • DISPATCH SYNCED</div>
                  </div>
                </div>

                {/* Floating Status Card (Cardom Response Network) */}
                <div className="rounded-xl border border-orange-500/40 bg-orange-500/[0.06] p-3.5">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-bold mb-2">
                    Cardom Response Network
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Status</div>
                      <div className="text-xs font-bold font-mono text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ONLINE
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Avg Response</div>
                      <div className="text-xs font-bold font-mono text-orange-400 mt-0.5">
                        24–45 MIN*
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Coverage</div>
                      <div className="text-xs font-bold font-mono text-white mt-0.5">
                        MULTI-CITY
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-500 italic mt-2 text-center">
                    *Response time shown is an illustrative demo value for interactive prototype purposes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. EMERGENCY SERVICE SELECTOR ───────────────────────────────── */}
        <section id="services-selector" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              RAPID DEPLOYMENT UNITS
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              What Do You Need Help With?
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Choose the roadside issue you are facing. We dispatch specifically equipped specialist recovery crews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EMERGENCY_SERVICES.map((service) => {
              const isSelected = selectedIssueId === service.id
              const Icon = service.Icon
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedIssueId(service.id)
                    // Visual feedback
                    setRadarState('scanning')
                    setTimeout(() => setRadarState('ready'), 600)
                  }}
                  className={cn(
                    'text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer h-56',
                    isSelected
                      ? 'border-orange-500 bg-orange-500/[0.08] shadow-[0_0_30px_rgba(249,115,22,0.22)]'
                      : 'border-white/10 bg-[#0d0d0d] hover:border-white/20 hover:bg-white/[0.02]'
                  )}
                >
                  {/* Top line with icon & selection indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-orange-500 text-black shadow-[0_0_15px_#f97316]'
                            : 'bg-white/5 text-orange-400 group-hover:scale-105 border border-white/10'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-black">
                          <Check className="w-3 h-3" />
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded border border-white/5">
                          {service.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {service.desc}
                    </p>
                  </div>

                  {/* Bottom ETA & Arrow */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-500">
                    <span className="font-mono text-[11px] text-zinc-400">
                      ETA: {service.estTime}
                    </span>
                    <ArrowRight
                      className={cn(
                        'w-4 h-4 transition-transform group-hover:translate-x-1',
                        isSelected ? 'text-orange-400' : 'text-zinc-500'
                      )}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── 3. LIVE ASSISTANCE REQUEST COCKPIT ─────────────────────────── */}
        <section id="request-cockpit" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: STEP-BASED FORM (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-7 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                    Request Roadside Assistance
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Fill in your incident coordinates for automated dispatching.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  Priority Queue
                </span>
              </div>

              {/* Step 1: Vehicle Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-bold">
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px]">1</span>
                    Vehicle Information
                  </span>

                  {/* Preset quick buttons */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                    <span>Quick Autofill:</span>
                    {PRESET_VEHICLES.slice(0, 3).map((pv) => (
                      <button
                        key={pv.brand}
                        type="button"
                        onClick={() => handleSelectPreset(pv)}
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 transition-colors"
                      >
                        {pv.brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Make / Brand</label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. BMW"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. 3 Series 330i"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Model Year</label>
                    <input
                      type="text"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. 2022"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Registration / Plate No.</label>
                    <input
                      type="text"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="e.g. MH 02 CD 8821"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Problem Selection */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-bold mb-2.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px]">2</span>
                  Select Roadside Issue
                </span>

                <select
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {EMERGENCY_SERVICES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#111]">
                      {s.title} — {s.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Location */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-bold">
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px]">3</span>
                    Location Coordinates
                  </span>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={usingGps}
                    className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-mono font-medium transition-colors"
                  >
                    <Crosshair className={cn('w-3.5 h-3.5', usingGps && 'animate-spin')} />
                    <span>{usingGps ? 'Locating...' : 'Use Current Location'}</span>
                  </button>
                </div>

                {gpsActive && (
                  <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[11px] font-mono text-orange-300 flex items-center justify-between">
                    <span>✓ Demo location selected (Simulated GPS telemetry)</span>
                    <button onClick={() => setGpsActive(false)} className="text-zinc-400 hover:text-white">
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Metropolitan Region</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#111]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-zinc-400 block mb-1">Current Area / Landmark / Mile Marker</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currentArea}
                        onChange={(e) => setCurrentArea(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="e.g. Western Express Highway, Pillar 42"
                      />
                      <MapPin className="w-3.5 h-3.5 text-orange-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Contact Information */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-bold mb-2.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px]">4</span>
                  Driver Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Mobile Number (Active Phone)</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Step 5: Additional Details */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-bold mb-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px]">5</span>
                  Additional Details
                </span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Tell us what happened (e.g. tyre shredded on highway shoulder, hazard lights on)..."
                />
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE RESPONSE SUMMARY (5 cols - Futuristic Radar Cockpit) */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="rounded-2xl border-2 border-orange-500/70 bg-[#0d0d0d]/90 backdrop-blur-xl p-6 sm:p-7 shadow-[0_0_40px_rgba(249,115,22,0.22)] relative overflow-hidden flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                    <h3 className="text-lg font-heading font-bold text-white tracking-wide">
                      Assistance Summary
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-bold animate-pulse">
                      EMERGENCY SUPPORT
                    </span>
                  </div>

                  {/* Summary dynamic lines */}
                  <div className="space-y-3 text-xs mb-6">
                    <div className="flex items-start justify-between">
                      <span className="text-zinc-400">Vehicle</span>
                      <span className="font-semibold text-white text-right">
                        {vehicleBrand} {vehicleModel}
                        <span className="block text-[10px] font-mono text-zinc-500">{vehicleReg}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Selected Issue</span>
                      <span className="font-semibold text-orange-400 flex items-center gap-1">
                        <activeService.Icon className="w-3.5 h-3.5" />
                        {activeService.title}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-zinc-400">Location</span>
                      <span className="font-medium text-white text-right max-w-[200px] truncate">
                        {currentCityObj.name}
                        <span className="block text-[10px] text-zinc-500 truncate">{currentArea}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Contact</span>
                      <span className="font-mono text-zinc-300">
                        {contactPhone}
                      </span>
                    </div>
                  </div>

                  {/* Futuristic Response Radar Visualization Card */}
                  <div className="relative rounded-xl border border-orange-500/30 bg-black/60 p-4 overflow-hidden mb-6">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-3">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                        {radarState === 'scanning' ? 'Scanning Network...' : 'Response Request Ready'}
                      </span>
                      <span className="text-orange-400">READY</span>
                    </div>

                    {/* Concentric Radar Canvas */}
                    <div className="relative h-32 flex items-center justify-center overflow-hidden rounded-lg bg-black/40 border border-white/5">
                      <div className="absolute w-28 h-28 rounded-full border border-orange-500/20" />
                      <div className="absolute w-20 h-20 rounded-full border border-orange-500/30" />
                      <div className="absolute w-12 h-12 rounded-full border border-orange-500/40" />
                      <div className="absolute w-full h-px bg-orange-500/15" />
                      <div className="absolute h-full w-px bg-orange-500/15" />

                      {/* Rotating Radar Sweep */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-28 h-28 origin-center pointer-events-none"
                      >
                        <div className="w-1/2 h-1/2 bg-gradient-to-br from-orange-500/30 to-transparent rounded-tl-full" />
                      </motion.div>

                      {/* User Vehicle Pin */}
                      <div className="relative z-10 w-4 h-4 rounded-full bg-orange-500 border border-white shadow-[0_0_12px_#f97316] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>

                      {/* Nearby Dispatch Support Marker */}
                      <div className="absolute top-4 right-8 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-mono text-emerald-300">PATROL 04</span>
                      </div>
                    </div>

                    {/* Status Readouts */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-center font-mono text-xs">
                      <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                        <div className="text-[10px] text-zinc-500">Nearby Support</div>
                        <div className="text-emerald-400 font-bold mt-0.5">Available</div>
                      </div>
                      <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                        <div className="text-[10px] text-zinc-500">Estimated Response</div>
                        <div className="text-orange-400 font-bold mt-0.5">Demo: 24–45 min</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA: Confirm Assistance Request */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleConfirmRequest}
                    className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Confirm Assistance Request</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <p className="text-[10px] text-center text-zinc-500 italic">
                    Prototype interaction • No real emergency services will be dispatched.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. CONFIRMATION SUCCESS MODAL ──────────────────────────────── */}
        <AnimatePresence>
          {requestConfirmed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl border border-orange-500/60 bg-[#0d0d0d] p-6 sm:p-8 shadow-[0_0_60px_rgba(249,115,22,0.35)] relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 mb-4 mx-auto shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-center text-white font-heading">
                  Assistance Dispatched!
                </h3>
                <p className="text-xs text-center text-zinc-400 mt-1 mb-6">
                  Emergency Incident ID: <span className="text-orange-400 font-mono font-bold">{requestId}</span>
                </p>

                {/* Dispatch Progress Tracker */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Patrol Unit:</span>
                    <span className="text-emerald-400 font-bold">Delta-04 (Flatbed)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Issue Assigned:</span>
                    <span className="text-white font-bold">{activeService.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Target Area:</span>
                    <span className="text-white truncate max-w-[220px]">{currentArea}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Simulated ETA:</span>
                    <span className="text-orange-400 font-bold font-mono">~28 mins (Demo)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestConfirmed(false)}
                    className="flex-1 py-3 rounded-xl border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold hover:border-white/30 transition-colors"
                  >
                    Reset Request
                  </button>
                  <Link
                    to="/service"
                    className="flex-1 py-3 rounded-xl bg-orange-500 text-black text-center text-xs font-bold hover:bg-orange-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Workshop Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── 5. HOW ROADSIDE ASSISTANCE WORKS ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              PRECISION PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              How Cardom Roadside Works
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Designed from the ground up for high-stress situations with zero ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Instant Request',
                desc: 'Select your vehicle and issue online or call the 24/7 incident hotline. No membership required.',
              },
              {
                step: '02',
                title: 'Smart Dispatch',
                desc: 'Our dispatch algorithm locates and routes the nearest specialized patrol truck with relevant parts.',
              },
              {
                step: '03',
                title: 'Live Telemetry',
                desc: 'Receive live GPS tracking of the approaching rescue crew with direct pilot call connectivity.',
              },
              {
                step: '04',
                title: 'Safe Recovery',
                desc: 'On-the-spot repair resolution or flatbed towing to a certified partner garage with warranty backing.',
              },
            ].map((item, idx) => (
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

        {/* ─── 6. WHY CARDOM ROADSIDE PILLARS ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
                SAFETY ASSURANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
                Emergency Standards You Can Rely On
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Cardom partners with licensed, background-checked recovery fleets across major transport corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ROADSIDE_PILLARS.map((pillar, idx) => {
                const Icon = pillar.Icon
                return (
                  <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">{pillar.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 7. FREQUENTLY ASKED QUESTIONS ──────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 font-mono">
              HELP & SUPPORT
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

        {/* ─── 8. FINAL EMERGENCY CTA ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                STRANDED RIGHT NOW?
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                We’re On Standby 24/7.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                Connect directly with the nearest Cardom incident response patrol or initiate a digital breakdown dispatch.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                >
                  Request Assistance
                </button>
                <Link
                  to="/service"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors"
                >
                  Book Workshop Service
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

