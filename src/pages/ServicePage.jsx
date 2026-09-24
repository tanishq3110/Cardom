import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Wrench,
  Settings,
  Snowflake,
  Disc,
  BatteryCharging,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  Check,
  CheckCircle2,
  Truck,
  Activity,
  FileCheck2,
  FileText,
  Layers,
  ArrowRight,
  RotateCcw,
  Car,
  AlertCircle,
  ShieldCheck,
  Fuel,
  Gauge,
  Sliders,
  Star,
  X,
  Loader2,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { submitServiceRequest } from '@/services/leadsApi'

// ─── Available Demo Vehicles ──────────────────────────────────────────────────
const DEMO_VEHICLES = [
  {
    id: 'bmw-3',
    name: 'BMW 3 Series - 2021',
    shortName: 'BMW 3 Series',
    year: '2021',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mercedes-c',
    name: 'Mercedes C-Class - 2022',
    shortName: 'Mercedes C-Class',
    year: '2022',
    fuel: 'Diesel',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'audi-a4',
    name: 'Audi A4 45 TFSI - 2023',
    shortName: 'Audi A4',
    year: '2023',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'porsche-macan',
    name: 'Porsche Macan GTS - 2022',
    shortName: 'Porsche Macan',
    year: '2022',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  },
]

// ─── Selectable Service Chips ────────────────────────────────────────────────
const SERVICE_CHIPS = [
  { id: 'periodic', name: 'Periodic Maintenance', price: 320, est: '3-4 hrs' },
  { id: 'brakes', name: 'Brake Overhaul', price: 145, est: '2 hrs' },
  { id: 'ac', name: 'AC Service', price: 85, est: '1.5 hrs' },
  { id: 'engine', name: 'Engine Check', price: 120, est: '2 hrs' },
  { id: 'battery', name: 'Battery Health', price: 65, est: '45 mins' },
  { id: 'detailing', name: 'Ceramic Detailing', price: 210, est: '5-6 hrs' },
]

// ─── Service Centers ─────────────────────────────────────────────────────────
const SERVICE_CENTERS = [
  {
    id: 'munich-central',
    name: 'Central Garage, Munich',
    distance: '3.4km away',
    rating: '4.9',
    status: 'Active',
    address: 'Maximilianstraße 42, Munich',
  },
  {
    id: 'mumbai-apex',
    name: 'Cardom Apex Hub, BKC',
    distance: '2.8km away',
    rating: '4.9',
    status: 'Active',
    address: 'G Block BKC, Bandra East, Mumbai',
  },
  {
    id: 'delhi-south',
    name: 'Cardom Prime Center, Okhla',
    distance: '4.1km away',
    rating: '4.8',
    status: 'Active',
    address: 'Phase III, Okhla Industrial Area, New Delhi',
  },
  {
    id: 'bangalore-koramangala',
    name: 'Cardom Velocity Garage',
    distance: '3.2km away',
    rating: '4.9',
    status: 'Active',
    address: '80 Feet Road, Koramangala 4th Block, Bengaluru',
  },
]

// ─── Available Times ─────────────────────────────────────────────────────────
const TIME_SLOTS = ['10:00 AM', '02:00 PM', '05:00 PM', '06:00 PM']

// ─── Detailed Category Offerings (Below the Fold) ───────────────────────────
const SERVICE_CATEGORIES = [
  {
    id: 'periodic',
    title: 'Periodic Service',
    description: 'Routine maintenance to keep your vehicle running smoothly, including engine oil, filter replacements, and multipoint checks.',
    Icon: Wrench,
    items: ['Engine oil & filter swap', 'Brake fluid & coolant top-up', 'Spark plugs & cabin filter', '40-point safety inspection'],
  },
  {
    id: 'repair',
    title: 'General Repair',
    description: 'Address mechanical and electrical issues, suspension squeaks, transmission tune-ups, and diagnostic troubleshooting.',
    Icon: Settings,
    items: ['Suspension & shock absorber tune', 'Steering gear calibration', 'Exhaust & catalytic converter', 'Transmission fluid overhaul'],
  },
  {
    id: 'cooling',
    title: 'AC & Cooling',
    description: 'Inspection and servicing for your cooling and climate systems, gas top-ups, condenser cleaning, and cabin sanitization.',
    Icon: Snowflake,
    items: ['Eco refrigerant recharge', 'Evaporator coil antibacterial wash', 'Compressor valve testing', 'Condenser high-pressure wash'],
  },
  {
    id: 'brakes',
    title: 'Brakes & Tyres',
    description: 'Brake pad and disc inspections, hydraulic fluid flushing, laser wheel alignment, and premium tyre balancing.',
    Icon: Disc,
    items: ['OEM brake pad replacement', 'Rotor disc resurfacing', 'Hydraulic fluid bleeding', '3D laser computerized alignment'],
  },
  {
    id: 'battery',
    title: 'Battery & Electrical',
    description: 'Battery health assessment, alternator diagnostics, high-voltage wiring tests, and starter motor servicing.',
    Icon: BatteryCharging,
    items: ['Cold cranking amp (CCA) load test', 'Alternator voltage test', 'Terminal corrosion cleanse', 'Smart battery conditioning'],
  },
  {
    id: 'detailing',
    title: 'Detailing & Ceramic',
    description: 'Professional deep-cleaning, dual-action paint correction, 9H ceramic coating, and cabin steam sterilization.',
    Icon: Sparkles,
    items: ['Multi-stage paint correction', '9H ceramic hydrophobic seal', 'Interior leather conditioning', 'Deep steam engine bay detailing'],
  },
]

// ─── Trust Pillars ───────────────────────────────────────────────────────────
const WHY_CARDOM = [
  {
    title: 'Certified OEM Technicians',
    desc: 'Every workshop mechanic undergoes rigorous brand-specific training to ensure precision diagnostic standards.',
    Icon: ShieldCheck,
  },
  {
    title: '100% Genuine Spare Parts',
    desc: 'Only genuine manufacturer OEM components with authentic serial numbers and warranty registration.',
    Icon: FileCheck2,
  },
  {
    title: 'Transparent Digital Quotes',
    desc: 'Itemized pricing upfront with zero hidden labor costs or surprise workshop add-ons.',
    Icon: Gauge,
  },
  {
    title: '6-Month / 10,000 km Warranty',
    desc: 'Complete peace of mind. All repairs and fitted parts are backed by Cardom warranty protection.',
    Icon: Wrench,
  },
]

// ─── FAQs ────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Will servicing at Cardom void my manufacturer warranty?',
    a: 'No. All services are performed strictly per OEM specifications using genuine OEM components and factory diagnostic computers, preserving your manufacturer warranty intact.',
  },
  {
    q: 'How does Doorstep Pickup & Delivery work?',
    a: 'A background-verified Cardom valet picks up your vehicle from your residence or office at your scheduled slot, delivers it to the certified partner workshop, and returns it sanitized once complete.',
  },
  {
    q: 'What if additional repairs are identified during inspection?',
    a: 'Our workshop never performs unscheduled work without your prior digital approval. You receive a photo/video diagnostic report via WhatsApp/SMS with itemized costs to approve or decline.',
  },
  {
    q: 'Can I reschedule or cancel my booking?',
    a: 'Yes, cancellations or slot rescheduling are 100% free up to 2 hours before your scheduled appointment.',
  },
]

export function ServicePage() {
  const { user } = useAuth()

  // ─── Interactive Booking Cockpit States ────────────────────────────────────
  const [selectedVehicle, setSelectedVehicle] = useState(DEMO_VEHICLES[0])
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false)
  
  // Selected chips (default to Periodic Maintenance & Brake Overhaul to mirror preview)
  const [selectedChipIds, setSelectedChipIds] = useState(['periodic', 'brakes'])
  
  // Service Center
  const [selectedCenter, setSelectedCenter] = useState(SERVICE_CENTERS[0])
  const [centerPickerOpen, setCenterPickerOpen] = useState(false)

  // Date & Time
  const [selectedDate, setSelectedDate] = useState('Oct 28, 2024')
  const [selectedTime, setSelectedTime] = useState('10:00 AM')
  const [doorstepValet, setDoorstepValet] = useState(true)

  // Confirmation modal state
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingRefId, setBookingRefId] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // Active FAQ
  const [activeFaq, setActiveFaq] = useState(0)

  // Chip toggle handler
  const toggleChip = (id) => {
    if (selectedChipIds.includes(id)) {
      if (selectedChipIds.length === 1) return // keep at least 1
      setSelectedChipIds(selectedChipIds.filter((item) => item !== id))
    } else {
      setSelectedChipIds([...selectedChipIds, id])
    }
  }

  // Cost calculations (matching currency format from preview)
  const baseServiceCost = selectedChipIds.reduce((sum, id) => {
    const chip = SERVICE_CHIPS.find((c) => c.id === id)
    return sum + (chip ? chip.price : 0)
  }, 0)

  const valetFee = doorstepValet ? 25 : 0
  const subtotal = baseServiceCost + valetFee
  const tax = Math.round(subtotal * 0.05 * 100) / 100 // 5% tax
  const total = (subtotal + tax).toFixed(2)

  const handleConfirmBooking = async () => {
    setBookingLoading(true)
    setBookingError(null)

    const selectedPackages = selectedChipIds.map((id) => {
      const chip = SERVICE_CHIPS.find((c) => c.id === id)
      return chip ? { id: chip.id, label: chip.label, price: chip.price } : { id }
    })

    const { data, error } = await submitServiceRequest({
      vehicleName: selectedVehicle.name,
      vehicleFuel: selectedVehicle.fuel,
      servicePackages: selectedPackages,
      serviceCenterName: selectedCenter.name,
      serviceCenterCity: selectedCenter.city,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      doorstepValet,
      baseCost: baseServiceCost,
      valetFee,
      taxAmount: tax,
      totalAmount: parseFloat(total),
      userId: user?.id || null,
    })

    setBookingLoading(false)

    if (error) {
      setBookingError(error.message)
      return
    }

    setBookingRefId(data.booking_reference)
    setBookingConfirmed(true)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-80 -left-40 w-[600px] h-[500px] bg-orange-600/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-60 -right-40 w-[600px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

        {/* Blueprint background schematics (Left bottom & Right top contour) */}
        <div className="absolute left-[-5%] top-[340px] w-[380px] h-[380px] pointer-events-none opacity-25 hidden xl:block">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full stroke-orange-500/40">
            <circle cx="100" cy="100" r="80" strokeDasharray="3 3" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="50" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="20" strokeWidth="0.6" />
            <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="0.5" strokeDasharray="2 4" />
            <path d="M30 40 L60 70 M140 70 L170 40 M30 160 L60 130 M140 130 L170 160" strokeWidth="0.8" />
            <rect x="75" y="75" width="50" height="50" rx="4" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="absolute right-[-2%] top-[140px] w-[450px] h-[300px] pointer-events-none opacity-30 hidden lg:block">
          <svg viewBox="0 0 300 200" fill="none" className="w-full h-full stroke-orange-500/60">
            {/* Aerodynamic car silhouette contour trace */}
            <path
              d="M10 150 C 40 150, 70 145, 95 125 C 130 95, 175 90, 220 105 C 255 115, 275 130, 290 145"
              strokeWidth="1.2"
            />
            <path d="M50 145 A 22 22 0 0 1 94 145" strokeWidth="1.2" />
            <path d="M210 145 A 22 22 0 0 1 254 145" strokeWidth="1.2" />
            <line x1="95" y1="125" x2="160" y2="125" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="20" y1="165" x2="280" y2="165" strokeWidth="0.5" strokeDasharray="4 6" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* ─── 1. TOP HEADER & TELEMETRY HUD ──────────────────────────────── */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
            {/* Left Header Title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                  Cardom Service & Repair
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  Precision Care for Every Drive
                </h1>

                {/* Subtle visual frequency bars */}
                <div className="hidden sm:flex items-center gap-1 opacity-70">
                  <span className="w-1 h-3 bg-orange-500 rounded-full" />
                  <span className="w-1 h-5 bg-orange-500/80 rounded-full" />
                  <span className="w-1 h-2 bg-orange-500/60 rounded-full" />
                  <span className="w-1 h-6 bg-orange-400 rounded-full" />
                  <span className="w-1 h-4 bg-orange-500/70 rounded-full" />
                </div>
              </div>

              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Real-time diagnostic telemetry, transparent cost calculators, and certified master workshop dispatch.
              </p>
            </div>

            {/* Right Telemetry HUD Card (as featured in the preview) */}
            <div className="w-full lg:w-auto">
              <div className="relative rounded-2xl border border-orange-500/40 bg-[#0d0d0d]/80 backdrop-blur-md p-4 sm:p-5 shadow-[0_0_30px_rgba(249,115,22,0.12)]">
                <BorderBeam size={160} duration={8} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Status Indicators */}
                <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-3 mb-3 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-orange-400" />
                    <span>Vehicle Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Service</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>AI Efficiency</span>
                  </div>
                </div>

                {/* Wireframe car profile in amber/orange line strokes */}
                <div className="relative py-1">
                  <div className="flex items-center justify-between gap-6 sm:gap-8">
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Health</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400">98%</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Systems</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">Green</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Service</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400">24h</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">AI Efficiency</div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400">96%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 2. THE COCKPIT: 2-COLUMN BOOKING ENGINE ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24">
            {/* LEFT COLUMN: 4-STEP CONTROLS (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
              {/* Stepper Header Tabs */}
              <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 pb-5 mb-8 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-orange-400 whitespace-nowrap">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/60 flex items-center justify-center text-[10px] text-orange-300">
                    1
                  </span>
                  <span>Vehicle</span>
                </div>
                <div className="h-px w-6 bg-white/10 shrink-0" />
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-300 whitespace-nowrap">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-400">
                    2
                  </span>
                  <span>Service Packages</span>
                </div>
                <div className="h-px w-6 bg-white/10 shrink-0" />
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 whitespace-nowrap">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-500">
                    3
                  </span>
                  <span>Service Center</span>
                </div>
                <div className="h-px w-6 bg-white/10 shrink-0" />
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 whitespace-nowrap">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-500">
                    4
                  </span>
                  <span>Date & Time</span>
                </div>
              </div>

              {/* Step 1 & Step 2 Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8">
                {/* 1. Vehicle Selector Box */}
                <div className="md:col-span-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                    <span>1. Vehicle</span>
                    <button
                      onClick={() => setVehiclePickerOpen(!vehiclePickerOpen)}
                      className="text-orange-400 hover:text-orange-300 transition-colors text-[11px] underline"
                    >
                      Change Car
                    </button>
                  </div>

                  {/* Vehicle Card (matches preview preview) */}
                  <div className="relative rounded-xl border border-white/15 bg-[#141414] p-3 overflow-hidden group hover:border-orange-500/50 transition-all">
                    <div className="h-32 w-full rounded-lg overflow-hidden bg-black relative mb-3">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <button
                        onClick={() => setVehiclePickerOpen(true)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-zinc-400 hover:text-white"
                        title="Change Car"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-semibold text-sm text-white">{selectedVehicle.name}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{selectedVehicle.fuel} • Verified OBD-II</span>
                    </div>

                    {/* Dropdown to switch demo vehicle */}
                    <AnimatePresence>
                      {vehiclePickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-0 bg-[#121212] p-3 rounded-xl z-20 flex flex-col justify-between border border-orange-500/40"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-white">Select Vehicle</span>
                              <button
                                onClick={() => setVehiclePickerOpen(false)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {DEMO_VEHICLES.map((v) => (
                                <button
                                  key={v.id}
                                  onClick={() => {
                                    setSelectedVehicle(v)
                                    setVehiclePickerOpen(false)
                                  }}
                                  className={cn(
                                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between',
                                    selectedVehicle.id === v.id
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                      : 'hover:bg-white/5 text-zinc-300'
                                  )}
                                >
                                  <span>{v.shortName}</span>
                                  <span className="text-[10px] text-zinc-500">{v.fuel}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 italic">Custom VIN lookup available</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 2. Service Packages Chips (as in preview: Select Chips) */}
                <div className="md:col-span-7">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                    2. Service Packages <span className="text-zinc-500 text-[11px]">(Select Chips)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {SERVICE_CHIPS.map((chip) => {
                      const isSelected = selectedChipIds.includes(chip.id)
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => toggleChip(chip.id)}
                          className={cn(
                            'p-3 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between h-[76px]',
                            isSelected
                              ? 'border-orange-500 bg-orange-500/10 text-white shadow-[0_0_15px_rgba(249,115,22,0.18)]'
                              : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <span className={cn('text-xs font-medium leading-tight', isSelected && 'text-orange-300')}>
                              {chip.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5 ml-1" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>€{chip.price}</span>
                            <span className="text-[10px] text-zinc-500">{chip.est}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3 & Step 4 Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-white/10">
                {/* 3. Service Center Card */}
                <div className="md:col-span-6">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                    <span>3. Service Center</span>
                    <button
                      onClick={() => setCenterPickerOpen(!centerPickerOpen)}
                      className="text-orange-400 hover:text-orange-300 text-[11px] underline"
                    >
                      Switch Location
                    </button>
                  </div>

                  <div className="relative rounded-xl border border-orange-500/60 bg-orange-500/[0.05] p-3.5 hover:border-orange-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          <span>{selectedCenter.name}</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-orange-400">
                            <MapPin className="w-3 h-3" />
                            {selectedCenter.distance}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-300">
                            <Star className="w-3 h-3 fill-current" />
                            Rating {selectedCenter.rating}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/20 text-orange-400 border border-orange-500/40">
                        {selectedCenter.status}
                      </span>
                    </div>

                    {/* Doorstep Valet Toggle */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <label htmlFor="valet-toggle" className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                        <Truck className="w-3.5 h-3.5 text-orange-400" />
                        <span>Doorstep Valet Pickup & Drop (+€25)</span>
                      </label>
                      <input
                        id="valet-toggle"
                        type="checkbox"
                        checked={doorstepValet}
                        onChange={(e) => setDoorstepValet(e.target.checked)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                    </div>

                    {/* Center selection dropdown */}
                    <AnimatePresence>
                      {centerPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-0 bg-[#121212] p-3 rounded-xl z-20 flex flex-col justify-between border border-orange-500/40"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-white">Select Verified Center</span>
                              <button
                                onClick={() => setCenterPickerOpen(false)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {SERVICE_CENTERS.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setSelectedCenter(c)
                                    setCenterPickerOpen(false)
                                  }}
                                  className={cn(
                                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between',
                                    selectedCenter.id === c.id
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                      : 'hover:bg-white/5 text-zinc-300'
                                  )}
                                >
                                  <div>
                                    <div className="font-medium">{c.name}</div>
                                    <div className="text-[10px] text-zinc-500">{c.distance}</div>
                                  </div>
                                  <span className="text-[10px] text-amber-400">★ {c.rating}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 4. Date & Time Selection */}
                <div className="md:col-span-6">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                    4. Date & Time
                  </div>

                  <div className="space-y-3">
                    {/* Date Selector Box */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span className="font-medium">{selectedDate}</span>
                        <span className="text-zinc-500">• Monday</span>
                      </div>
                      <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">
                        Available
                      </span>
                    </div>

                    {/* Time slot chips */}
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isTimeSelected = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              'py-2 px-1 text-center rounded-lg text-[11px] font-mono transition-all border',
                              isTimeSelected
                                ? 'border-orange-500 bg-orange-500/15 text-orange-300 font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                                : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20'
                            )}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE COST & ESTIMATE SUMMARY (4 cols - Exact preview design) */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="rounded-2xl border-2 border-orange-500/70 bg-[#0d0d0d]/90 backdrop-blur-xl p-6 sm:p-7 shadow-[0_0_40px_rgba(249,115,22,0.22)] relative overflow-hidden flex flex-col justify-between">
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-wide mb-6">
                    Live Cost and Estimate Summary
                  </h3>

                  <div className="space-y-4 text-sm">
                    {/* Vehicle Line */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-zinc-400">Vehicle</span>
                      <span className="font-semibold text-white">{selectedVehicle.shortName}</span>
                    </div>

                    {/* Service Line Items */}
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Service</div>
                      <div className="space-y-2">
                        {selectedChipIds.map((id) => {
                          const chip = SERVICE_CHIPS.find((c) => c.id === id)
                          if (!chip) return null
                          return (
                            <div key={id} className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-zinc-300">{chip.name}</span>
                              <span className="font-mono text-zinc-200">€{chip.price}</span>
                            </div>
                          )
                        })}

                        {doorstepValet && (
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-orange-400" />
                              Doorstep Logistics
                            </span>
                            <span className="font-mono text-zinc-300">€25</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Total Estimate</span>
                        <span className="font-mono font-medium text-white">€{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Tax (5%)</span>
                        <span className="font-mono text-zinc-400">€{tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-orange-500/30 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Estimated Total</span>
                      <span className="text-2xl font-bold font-mono text-white">€{total}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Service Booking Button (Luminous Orange) */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleConfirmBooking}
                    type="button"
                    disabled={bookingLoading}
                    className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming…</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Service Booking</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  {bookingError && (
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 text-center">
                      {bookingError}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      OEM Verified Parts
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      6-Mo Warranty
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 3. BOOKING CONFIRMATION MODAL ──────────────────────────────── */}
          <AnimatePresence>
            {bookingConfirmed && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg rounded-2xl border border-orange-500/60 bg-[#0d0d0d] p-6 sm:p-8 shadow-[0_0_50px_rgba(249,115,22,0.3)] relative"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h3 className="text-2xl font-bold text-center text-white font-heading">
                    Service Confirmed!
                  </h3>
                  <p className="text-xs text-center text-zinc-400 mt-1 mb-6">
                    Booking Reference: <span className="text-orange-400 font-mono font-bold">{bookingRefId}</span>
                  </p>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Vehicle:</span>
                      <span className="text-white font-medium">{selectedVehicle.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Service Center:</span>
                      <span className="text-white font-medium">{selectedCenter.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Schedule:</span>
                      <span className="text-white font-medium">{selectedDate} at {selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Estimated Total:</span>
                      <span className="text-orange-400 font-bold font-mono">€{total}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingConfirmed(false)}
                      className="flex-1 py-3 rounded-lg border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold"
                    >
                      Close Window
                    </button>
                    <Link
                      to="/cars"
                      className="flex-1 py-3 rounded-lg bg-orange-500 text-black text-center text-xs font-bold hover:bg-orange-400 transition-colors"
                    >
                      Browse Cars
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ─── 4. SERVICE CATEGORIES BREAKDOWN (Below Cockpit) ─────────────── */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                COMPREHENSIVE AUTOMOTIVE CATALOG
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
                Certified Service Offerings
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Explore individual work scopes performed by certified partner workshops across the Cardom network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = cat.Icon
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur p-6 hover:border-orange-500/40 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">{cat.description}</p>

                    <div className="space-y-1.5 border-t border-white/10 pt-4">
                      {cat.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── 5. WHY CARDOM SERVICE ──────────────────────────────────────── */}
          <div className="mb-24 rounded-2xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                THE CARDOM ADVANTAGE
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
                Engineered for Absolute Transparency
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                We eliminated opaque garage estimates, unreliable mechanics, and substandard parts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_CARDOM.map((feature, idx) => {
                const Icon = feature.Icon
                return (
                  <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">{feature.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── 6. HOW IT WORKS TIMELINE ────────────────────────────────────── */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                SEAMLESS WORKFLOW
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
                How Cardom Service Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                { step: '01', title: 'Schedule Online', desc: 'Select your vehicle and desired service packages with upfront cost guarantees.' },
                { step: '02', title: 'Doorstep Pickup', desc: 'A verified driver collects your vehicle or you drive directly to the partner center.' },
                { step: '03', title: 'Live Progress', desc: 'Track inspections, approve supplementary parts, and view workshop camera feeds in real time.' },
                { step: '04', title: 'Sanitized Delivery', desc: 'Your vehicle is delivered back with a verified digital service passport & 6-month warranty.' },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-[#0d0d0d] relative group hover:border-orange-500/40 transition-colors">
                  <div className="text-3xl font-bold font-mono text-orange-500/40 group-hover:text-orange-500 transition-colors mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 7. FREQUENTLY ASKED QUESTIONS ──────────────────────────────── */}
          <div className="max-w-3xl mx-auto mb-24">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                QUESTIONS & ANSWERS
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
          </div>

          {/* ─── 8. FINAL CTA SECTION ────────────────────────────────────────── */}
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                CONNECTED PLATFORM
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                Ready to Experience Next-Gen Car Servicing?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                Connect your vehicle with Cardom’s digital diagnostic network today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                >
                  Configure Service
                </button>
                <Link
                  to="/cars"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors"
                >
                  Explore Cars
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
