import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Car,
  Wrench,
  Building2,
  Send,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Navigation,
  Globe,
  Layers,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ExternalLink,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

// ─── 4 Interactive Categories (How Can We Help?) ──────────────────────────────
const HELP_CATEGORIES = [
  {
    id: 'general',
    title: 'General Support',
    desc: 'Questions about Cardom features, account navigation, and platform architecture.',
    Icon: HelpCircle,
    prefillSubject: 'General Support',
  },
  {
    id: 'marketplace',
    title: 'Car Marketplace',
    desc: 'Inquiries about certified vehicle listings, test drives, and seller onboarding.',
    Icon: Car,
    prefillSubject: 'Buy a Car',
  },
  {
    id: 'services',
    title: 'Vehicle Services',
    desc: 'Help with workshop bookings, 24/7 roadside assistance, or spare parts compatibility.',
    Icon: Wrench,
    prefillSubject: 'Service & Repair',
  },
  {
    id: 'partnerships',
    title: 'Partnerships',
    desc: 'Dealership alliances, authorized service networks, and automotive supplier integration.',
    Icon: Building2,
    prefillSubject: 'Partnership',
  },
]

// ─── Subject Dropdown Options ────────────────────────────────────────────────
const SUBJECT_OPTIONS = [
  'General Support',
  'Buy a Car',
  'Sell a Car',
  'Insurance',
  'Finance',
  'Subscription',
  'Service & Repair',
  'Roadside Assistance',
  'Spare Parts',
  'Partnership',
  'Other',
]

// ─── Indian Regional Hubs (Abstract Network) ──────────────────────────────────
const REGIONAL_HUBS = [
  { city: 'Delhi NCR', type: 'Northern Command Hub', coords: 'x: 180, y: 80' },
  { city: 'Mumbai', type: 'Western Coastal Hub', coords: 'x: 110, y: 170' },
  { city: 'Hyderabad', type: 'Central Transit Hub', coords: 'x: 190, y: 195' },
  { city: 'Bangalore', type: 'Southern Tech Hub', coords: 'x: 170, y: 250' },
  { city: 'Chennai', type: 'Southeastern Port Hub', coords: 'x: 215, y: 255' },
]

// ─── 9 FAQs ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How can I contact Cardom?',
    a: 'You can submit an inquiry directly through our Send Us a Message form on this page or send a message to our demo support inbox (support@cardom.example). In production, live chat, WhatsApp concierge, and 24/7 phone assistance will be integrated.',
  },
  {
    q: 'Can I ask about buying a car?',
    a: 'Yes. Select "Car Marketplace" or "Buy a Car" as your subject to connect regarding specific certified pre-owned or new vehicle listings, test drive scheduling, and dealer vehicle histories.',
  },
  {
    q: 'Can I get help with selling my car?',
    a: 'Certainly! Choose "Sell a Car" in the subject dropdown to ask about vehicle inspection scheduling, our automated valuation model, or listing optimization.',
  },
  {
    q: 'Can I ask about servicing?',
    a: 'Yes. Our service support desk can assist with service package selection, warranty preservation inquiries, partner workshop locations, and doorstep valet collection options.',
  },
  {
    q: 'Can I request roadside assistance through this contact form?',
    a: 'For simulated real-time emergency dispatch (flat tyre, dead battery, towing, fuel delivery), we recommend using our dedicated Roadside Assistance portal (/roadside) or hotline, which provides instant incident coordinate mapping.',
  },
  {
    q: 'Can I ask about financing or insurance?',
    a: 'Yes. Our team can explain auto loan eligibility guidelines, EMI tenure estimations, and zero-depreciation insurance policy comparison quotes.',
  },
  {
    q: 'Can businesses and suppliers contact Cardom?',
    a: 'Yes. Dealerships, certified workshop garages, insurance underwriters, and OEM spare parts distributors can select "Partnerships" to discuss ecosystem integration.',
  },
  {
    q: 'How quickly will Cardom respond?',
    a: 'In this prototype demonstration, messages are logged locally with an instant reference ID. In our production environment, general inquiries target a sub-2-hour turnaround time.',
  },
  {
    q: 'Can I submit platform feedback or bug reports?',
    a: 'We welcome all user feedback! Select "Other" or "General Support" and describe your experience, suggestions, or UI feedback in the message area.',
  },
]

export function ContactPage() {
  // ─── Form State ─────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Support',
    message: '',
    privacyAgreed: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)

  // FAQ State
  const [activeFaq, setActiveFaq] = useState(0)

  // Scroll helpers
  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle Category Card Click
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.id)
    setFormData((prev) => ({ ...prev, subject: cat.prefillSubject }))
    scrollToForm()
  }

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Validate Form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Please enter your name'
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject'
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    if (!formData.privacyAgreed) {
      newErrors.privacyAgreed = 'You must accept the Privacy Policy to proceed'
    }
    return newErrors
  }

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const generatedRef = 'CDM-CON-' + Math.floor(100000 + Math.random() * 900000)
      setReferenceId(generatedRef)
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 600)
  }

  // Reset Form
  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Support',
      message: '',
      privacyAgreed: false,
    })
    setSelectedCategory(null)
    setErrors({})
    setIsSubmitted(false)
  }

  // Copy demo email
  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('support@cardom.example')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-80 -right-48 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* ─── 1. HERO — CONNECT WITH CARDOM ───────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Contact Cardom</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.1]">
                Let's Keep You <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
                  Moving.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                Have a question about cars, services, financing, insurance, roadside assistance, or the Cardom platform? We're here to help.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>Send a Message</span>
                </button>

                <Link
                  to="/about"
                  className="px-8 py-4 rounded-xl text-sm font-semibold border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Cardom</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </Link>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Direct Routing Hub Active
                </span>
                <span>•</span>
                <span>Sub-2h Priority Queues</span>
              </div>
            </div>

            {/* Right: Custom Automotive Communication Visual (SVG/CSS) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col justify-between">
                <BorderBeam size={220} duration={10} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Status */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-orange-400" />
                    <span>COMMUNICATION TELEMETRY</span>
                  </div>
                  <span className="text-orange-400 font-bold">DISPATCH: READY</span>
                </div>

                {/* SVG Visual Canvas with Radiating Radio Signals */}
                <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
                  <svg className="absolute inset-0 w-full h-full stroke-orange-500/25" viewBox="0 0 400 300" fill="none">
                    {/* Concentric Signal Rings */}
                    <circle cx="200" cy="150" r="115" strokeDasharray="3 5" strokeWidth="0.8" />
                    <circle cx="200" cy="150" r="85" strokeWidth="1" stroke="rgba(249,115,22,0.4)" />
                    <circle cx="200" cy="150" r="55" strokeDasharray="2 4" strokeWidth="0.8" />
                    <circle cx="200" cy="150" r="25" stroke="#f97316" strokeWidth="1.2" />

                    {/* Radial Wave Vectors */}
                    <line x1="200" y1="150" x2="60" y2="80" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="340" y2="80" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="70" y2="230" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="330" y2="230" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />

                    {/* Nodes */}
                    <circle cx="60" cy="80" r="10" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="340" cy="80" r="10" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="70" cy="230" r="10" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="330" cy="230" r="10" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  </svg>

                  {/* Node Tags */}
                  <div className="absolute top-8 left-6 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    MARKETPLACE
                  </div>
                  <div className="absolute top-8 right-6 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    SERVICE DESK
                  </div>
                  <div className="absolute bottom-10 left-8 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    ROADSIDE SOS
                  </div>
                  <div className="absolute bottom-10 right-8 bg-black/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                    PARTNERSHIPS
                  </div>

                  {/* Glowing Cardom Center Core */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/25 to-black border-2 border-orange-500 flex flex-col items-center justify-center shadow-[0_0_30px_#f97316]"
                  >
                    <MessageSquare className="w-6 h-6 text-orange-400" />
                    <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase mt-0.5">
                      SUPPORT
                    </span>
                  </motion.div>
                </div>

                {/* Floating HUD Card: Cardom Support Network */}
                <div className="rounded-xl border border-orange-500/40 bg-orange-500/[0.06] p-3.5">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-bold mb-2">
                    Cardom Support Network
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
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Channels</div>
                      <div className="text-xs font-bold font-mono text-orange-400 mt-0.5">4 ACTIVE</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono">Response</div>
                      <div className="text-xs font-bold font-mono text-white mt-0.5">COMING SOON</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-500 italic mt-2 text-center">
                    *Prototype demonstration • Live contact routing will be active in production.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. CONTACT OPTIONS ("HOW CAN WE HELP?") ─────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              COMMUNICATION ROUTING
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              How Can We Help?
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Choose an inquiry domain to pre-configure your message subject and direct it to the appropriate team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HELP_CATEGORIES.map((cat) => {
              const Icon = cat.Icon
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={cn(
                    'text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group cursor-pointer h-56 relative overflow-hidden',
                    isSelected
                      ? 'border-orange-500 bg-orange-500/[0.08] shadow-[0_0_30px_rgba(249,115,22,0.22)]'
                      : 'border-white/10 bg-[#0d0d0d] hover:border-white/20 hover:bg-white/[0.02]'
                  )}
                >
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
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-orange-400 flex items-center justify-between">
                    <span>Route to {cat.prefillSubject}</span>
                    <span>→</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── 3. CONTACT FORM & SUPPORT HUB ───────────────────────────────── */}
        <section id="contact-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CONTACT FORM (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* ─── 4. FORM SUCCESS STATE ─────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-6 text-center space-y-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 mx-auto shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                        DISPATCH LOGGED
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                        Message Received
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                        Thanks for reaching out. Your message has been captured in this prototype. Contact handling can be connected to Cardom's backend and communication system later.
                      </p>
                    </div>

                    {/* Reference Card */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-left max-w-md mx-auto space-y-2">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-zinc-500">REFERENCE:</span>
                        <span className="text-orange-400 font-bold">{referenceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SENDER:</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">EMAIL:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SUBJECT:</span>
                        <span className="text-white">{formData.subject}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Send Another Message</span>
                      </button>
                      <Link
                        to="/about"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-semibold hover:bg-orange-500/20 text-center"
                      >
                        Explore Cardom
                      </Link>
                      <Link
                        to="/cars"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 text-center shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                      >
                        Explore Cars
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── NORMAL FORM ────────────────────────────────────────── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400">
                        DIRECT COMMUNICATION
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                        Send Us a Message
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                        Fill out the details below and our team will get in touch.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name & Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                            Your Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Alex Rivera"
                            className={cn(
                              'w-full bg-[#111] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors',
                              errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/15 focus:border-orange-500'
                            )}
                          />
                          {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name}</span>}
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                            Email Address <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={cn(
                              'w-full bg-[#111] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors',
                              errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/15 focus:border-orange-500'
                            )}
                          />
                          {errors.email && <span className="text-[10px] text-red-400 mt-1 block">{errors.email}</span>}
                        </div>
                      </div>

                      {/* Phone & Subject Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                            Phone Number <span className="text-zinc-500 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full bg-[#111] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-zinc-400 block mb-1.5 uppercase">
                            Subject / Topic <span className="text-orange-500">*</span>
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-[#111] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                          >
                            {SUBJECT_OPTIONS.map((sub) => (
                              <option key={sub} value={sub} className="bg-[#111]">
                                {sub}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Message Field */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-mono text-zinc-400 uppercase">
                            Your Message <span className="text-orange-500">*</span>
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {formData.message.length} / 1000 characters
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          name="message"
                          maxLength={1000}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          className={cn(
                            'w-full bg-[#111] border rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors resize-none',
                            errors.message ? 'border-red-500 focus:border-red-500' : 'border-white/15 focus:border-orange-500'
                          )}
                        />
                        {errors.message && <span className="text-[10px] text-red-400 mt-1 block">{errors.message}</span>}
                      </div>

                      {/* Privacy Checkbox */}
                      <div>
                        <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            name="privacyAgreed"
                            checked={formData.privacyAgreed}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 accent-orange-500 rounded cursor-pointer"
                          />
                          <span>
                            I agree to the Cardom Privacy Policy and authorize communication regarding my automotive enquiry.
                          </span>
                        </label>
                        {errors.privacyAgreed && (
                          <span className="text-[10px] text-red-400 mt-1 block">{errors.privacyAgreed}</span>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 rounded-xl font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Processing Message...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-zinc-500 text-center italic pt-1">
                        Frontend prototype verification • No live email dispatch will occur.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: CARDOM SUPPORT HUB (5 cols) */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="rounded-2xl border-2 border-orange-500/60 bg-[#0d0d0d]/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_0_40px_rgba(249,115,22,0.2)] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-heading font-bold text-white tracking-wide">
                    Cardom Support Hub
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NETWORK ACTIVE
                  </span>
                </div>

                {/* 3 Domain Status Badges */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <span className="text-orange-400 font-bold block">GENERAL</span>
                      <span className="text-[11px] text-zinc-400">Support & Platform Operations</span>
                    </div>
                    <span className="text-emerald-400 text-[10px]">99.8% Online</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <span className="text-orange-400 font-bold block">AUTOMOTIVE</span>
                      <span className="text-[11px] text-zinc-400">Cars • Services • Parts</span>
                    </div>
                    <span className="text-emerald-400 text-[10px]">Active Queues</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <span className="text-orange-400 font-bold block">PARTNERS</span>
                      <span className="text-[11px] text-zinc-400">Business & Dealer Integration</span>
                    </div>
                    <span className="text-orange-400 text-[10px]">Verified Desk</span>
                  </div>
                </div>

                {/* Animated Core with Communication Vectors */}
                <div className="relative h-44 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute w-32 h-32 rounded-full border border-orange-500/20 animate-ping opacity-30" />
                  <div className="absolute w-28 h-28 rounded-full border border-orange-500/30" />
                  <div className="absolute w-16 h-16 rounded-full border border-orange-500/40" />

                  {/* Radiating Pulses */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-28 h-28 border-t-2 border-orange-500/60 rounded-full pointer-events-none"
                  />

                  <div className="relative z-10 w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold shadow-[0_0_20px_#f97316]">
                    <Zap className="w-6 h-6" />
                  </div>

                  <div className="absolute bottom-2 text-[9px] font-mono text-zinc-500">
                    DISPATCH TELEMETRY ACTIVE
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-white">Centralized Escalation:</strong> Inquiries submitted via this portal are programmatically dispatched to automotive concierges in real-time.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. SUPPORT CHANNELS ("CONNECT WITH CARDOM") ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              COMMUNICATION CHANNELS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              Connect With Cardom
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Multiple contact avenues engineered for drivers, dealerships, and enterprise automotive partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Email Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-mono text-orange-400 uppercase font-bold mb-1">
                  DEMO CONTACT
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Electronic Mail</h3>
                <div className="text-xs font-mono text-zinc-300 bg-white/[0.03] p-2 rounded-lg border border-white/5 mb-3 select-all">
                  support@cardom.example
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  For inquiries regarding vehicle listings, service center coordination, and platform feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="mt-6 w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Address</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-orange-400" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Platform Explore Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-mono text-orange-400 uppercase font-bold mb-1">
                  PLATFORM OVERVIEW
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Explore Cardom</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Discover all connected automotive verticals across buying, selling, servicing, financing, and subscriptions.
                </p>
              </div>

              <Link
                to="/about"
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Business Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-mono text-orange-400 uppercase font-bold mb-1">
                  BUSINESS ENQUIRIES
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Partnership Hub</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  For automotive dealerships, insurance underwriters, certified workshops, and parts distribution networks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, subject: 'Partnership' }))
                  scrollToForm()
                }}
                className="mt-6 w-full py-2.5 px-4 rounded-xl border border-orange-500/50 bg-orange-500/10 text-orange-300 text-xs font-semibold hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Contact Business Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── 6. RESPONSE INFORMATION (SUPPORT FLOW STRIP) ────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-2xl border border-white/10 bg-black/50 p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                SUPPORT FLOW
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs mb-4">
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="text-orange-400 font-bold mb-1">01. MESSAGE</div>
                <span className="text-[10px] text-zinc-400">Captured with encrypted ID</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="text-white font-bold mb-1">02. REVIEW</div>
                <span className="text-[10px] text-zinc-400">Assigned to domain desk</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="text-white font-bold mb-1">03. RESPONSE</div>
                <span className="text-[10px] text-zinc-400">Email / WhatsApp dispatch</span>
              </div>
              <div className="p-3 rounded-xl border border-orange-500/40 bg-orange-500/5">
                <div className="text-orange-400 font-bold mb-1">04. RESOLUTION</div>
                <span className="text-[10px] text-zinc-400">Verified vehicle continuity</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center italic">
              *This workflow represents the intended Cardom support experience. Actual response channels and support operations will be connected later.
            </p>
          </div>
        </section>

        {/* ─── 7. LOCATION / PRESENCE (ABSTRACT INDIA TECHNICAL GRID) ───────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-14 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                  CONCEPTUAL NETWORK
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                  Built for Drivers, Everywhere.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Cardom is designed as a platform that can support automotive journeys across cities and major transit corridors nationwide.
                </p>

                <div className="space-y-2.5 pt-2">
                  {REGIONAL_HUBS.map((hub) => (
                    <div
                      key={hub.city}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="font-bold">{hub.city}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{hub.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geometric India Network Visualization Canvas */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <div className="w-full max-w-md aspect-square rounded-2xl bg-black/60 border border-white/10 p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="text-[10px] font-mono text-zinc-500 flex justify-between border-b border-white/10 pb-2">
                    <span>PAN-INDIA DISPATCH GRID</span>
                    <span className="text-orange-400">MULTI-CITY</span>
                  </div>

                  {/* Stylized Node Network Canvas */}
                  <div className="relative flex-1 my-2 flex items-center justify-center">
                    <svg className="w-full h-full stroke-orange-500/30" viewBox="0 0 300 300" fill="none">
                      {/* Inter-city connecting telemetry lines */}
                      <line x1="150" y1="60" x2="90" y2="150" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="150" y1="60" x2="160" y2="170" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="90" y1="150" x2="160" y2="170" strokeWidth="1" />
                      <line x1="90" y1="150" x2="140" y2="230" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="160" y1="170" x2="140" y2="230" strokeWidth="1" />
                      <line x1="160" y1="170" x2="190" y2="235" strokeWidth="1" />
                      <line x1="140" y1="230" x2="190" y2="235" strokeWidth="1" strokeDasharray="3 3" />

                      {/* City Nodes */}
                      {/* Delhi */}
                      <circle cx="150" cy="60" r="6" fill="#f97316" />
                      {/* Mumbai */}
                      <circle cx="90" cy="150" r="6" fill="#f97316" />
                      {/* Hyderabad */}
                      <circle cx="160" cy="170" r="5" fill="#f97316" />
                      {/* Bangalore */}
                      <circle cx="140" cy="230" r="6" fill="#f97316" />
                      {/* Chennai */}
                      <circle cx="190" cy="235" r="5" fill="#f97316" />
                    </svg>

                    {/* City Labels */}
                    <div className="absolute top-6 left-32 text-[10px] font-mono text-orange-300 font-bold">
                      DELHI NCR
                    </div>
                    <div className="absolute top-32 left-4 text-[10px] font-mono text-orange-300 font-bold">
                      MUMBAI
                    </div>
                    <div className="absolute top-36 right-16 text-[10px] font-mono text-orange-300 font-bold">
                      HYDERABAD
                    </div>
                    <div className="absolute bottom-10 left-12 text-[10px] font-mono text-orange-300 font-bold">
                      BANGALORE
                    </div>
                    <div className="absolute bottom-8 right-8 text-[10px] font-mono text-orange-300 font-bold">
                      CHENNAI
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-zinc-500 text-center border-t border-white/10 pt-2">
                    Conceptual network map • No real-time service fulfillment claim.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. FREQUENTLY ASKED QUESTIONS ──────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              HELP & FAQS
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

        {/* ─── 9. FINAL CTA ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                STAY CONNECTED
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                Have a Question? Let's Talk.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                Explore Cardom today and discover a connected automotive experience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/cars"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                >
                  Explore Cars
                </Link>
                <Link
                  to="/how-it-works"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors"
                >
                  Explore Services
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

