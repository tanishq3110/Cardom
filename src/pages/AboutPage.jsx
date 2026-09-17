import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
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
  Cpu,
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
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

// ─── 9 Ecosystem Nodes ────────────────────────────────────────────────────────
const ECOSYSTEM_NODES = [
  {
    id: 'buy',
    title: 'Buy',
    desc: 'Verified certified pre-owned and new vehicle marketplace with full history reports.',
    Icon: Car,
    href: '/cars',
  },
  {
    id: 'sell',
    title: 'Sell',
    desc: 'Streamlined online listing engine connecting vehicle owners with vetted buyers.',
    Icon: Tag,
    href: '/sell',
  },
  {
    id: 'finance',
    title: 'Finance',
    desc: 'Flexible auto loans, transparent EMI calculators, and premier lending partner networks.',
    Icon: CreditCard,
    href: '/finance',
  },
  {
    id: 'insurance',
    title: 'Insurance',
    desc: 'Comprehensive multi-insurer quotes, zero-depreciation options, and immediate binding.',
    Icon: ShieldCheck,
    href: '/insurance',
  },
  {
    id: 'subscription',
    title: 'Subscription',
    desc: 'Drive premium models with all-inclusive insurance and servicing without ownership debt.',
    Icon: Repeat2,
    href: '/subscription',
  },
  {
    id: 'service',
    title: 'Service & Repair',
    desc: 'Digital workshop appointments, certified mechanics, and live diagnostic telemetry.',
    Icon: Wrench,
    href: '/service',
  },
  {
    id: 'roadside',
    title: 'Roadside Assistance',
    desc: '24/7 emergency incident dispatch, towing, flat tyres, jump starts, and fuel delivery.',
    Icon: PhoneCall,
    href: '/roadside',
  },
  {
    id: 'parts',
    title: 'Spare Parts',
    desc: 'Precision fitment catalog for OEM and performance automotive components.',
    Icon: Package,
    href: '/parts',
  },
  {
    id: 'detailing',
    title: 'Detailing',
    desc: 'Ceramic paint protection, interior sanitization, and bespoke studio restoration.',
    Icon: Sparkles,
    href: '/service',
  },
]

// ─── 4 Pillars (Why Cardom Exists) ───────────────────────────────────────────
const WHY_CARDOM_PILLARS = [
  {
    title: 'Simplicity',
    desc: 'Reduce the friction created by fragmented, offline automotive services with modern digital interfaces.',
    Icon: Zap,
  },
  {
    title: 'Transparency',
    desc: 'Present important information clearly so users can compare and understand their options without surprises.',
    Icon: Eye,
  },
  {
    title: 'Convenience',
    desc: 'Bring automotive journeys together instead of forcing drivers to juggle disconnected vendors.',
    Icon: Layers,
  },
  {
    title: 'Connection',
    desc: 'Create a platform where vehicles, services, providers, and drivers work together seamlessly.',
    Icon: Network,
  },
]

// ─── Technology & Experience Cards ───────────────────────────────────────────
const TECH_CARDS = [
  {
    title: 'Intelligent Discovery',
    desc: 'Help users navigate a growing automotive marketplace and service ecosystem with contextual search.',
    Icon: Compass,
  },
  {
    title: 'Connected Data',
    desc: 'Design the platform around vehicle, service, and journey information for continuity across years.',
    Icon: Cpu,
  },
  {
    title: 'Digital Workflows',
    desc: 'Move traditionally offline automotive processes toward simpler, transparent digital experiences.',
    Icon: Workflow,
  },
  {
    title: 'Scalable Platform',
    desc: 'Build the foundation for future automotive services, fleet integrations, and connected APIs.',
    Icon: Globe,
  },
]

// ─── Future Vision Capabilities ──────────────────────────────────────────────
const FUTURE_CAPABILITIES = [
  {
    title: 'Mobility',
    desc: 'Future shared mobility, on-demand car swapping, and multi-modal urban transit integration.',
    tag: 'FUTURE VISION',
  },
  {
    title: 'Connected Vehicle',
    desc: 'Deeper IoT vehicle telemetry, remote diagnostics, and smart vehicle status alerts.',
    tag: 'FUTURE VISION',
  },
  {
    title: 'Predictive Maintenance',
    desc: 'AI-assisted wear estimation to service vehicle parts before sudden roadside breakdowns occur.',
    tag: 'FUTURE VISION',
  },
  {
    title: 'Digital Ownership',
    desc: 'A unified digital vehicle passport tracking service records, insurance, and residual market value.',
    tag: 'FUTURE VISION',
  },
]

// ─── FAQs ────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What is Cardom?',
    a: 'Cardom is a unified automotive technology platform concept designed to bring buying, selling, financing, insurance, servicing, roadside assistance, subscriptions, and parts into a single connected experience.',
  },
  {
    q: 'What automotive services does Cardom cover?',
    a: 'Cardom’s architecture encompasses 9 core automotive domains: vehicle marketplace (Buy & Sell), auto financing, car insurance, monthly vehicle subscriptions, workshop service & repair, 24/7 roadside assistance, spare parts discovery, and detailing.',
  },
  {
    q: 'Is Cardom a car marketplace?',
    a: 'Yes, a core component of Cardom is a transparent marketplace where users can browse certified pre-owned and new vehicles with comprehensive filter tools, price transparency, and verified specifications.',
  },
  {
    q: 'Can I sell my car through Cardom?',
    a: 'Yes. The Cardom Sell portal provides an interactive vehicle listing onboarding flow designed to calculate instant valuations and connect sellers with verified prospective buyers.',
  },
  {
    q: 'Can I manage vehicle services through Cardom?',
    a: 'Cardom provides interactive booking engines for service centers, periodic maintenance packages, doorstep valet pickups, and roadside emergency assistance dispatch.',
  },
  {
    q: 'Will Cardom provide financing and insurance directly?',
    a: 'Cardom acts as an aggregator and technology interface connecting drivers with leading banks, NBFCs, and certified insurance underwriters rather than serving as a direct underwriter.',
  },
  {
    q: 'Is Cardom currently connected to live service providers?',
    a: 'In this current release, Cardom is an interactive frontend prototype demonstrating the user experience and platform architecture. Real-world garage networks and lender APIs will be connected upon backend integration.',
  },
  {
    q: 'What features are currently available to test?',
    a: 'You can interactively explore the Car Marketplace with filters, view detailed vehicle dossiers, step through the Sell Car onboarding, calculate EMI loans and insurance quotes, configure monthly subscriptions, book workshop repairs, initiate emergency roadside assistance, and browse the Spare Parts catalog.',
  },
]

export function AboutPage() {
  const [activeFaq, setActiveFaq] = useState(0)

  // Scroll helpers
  const scrollToEcosystem = () => {
    document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background flares */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-80 -right-48 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* ─── 1. HERO — THE IDEA BEHIND CARDOM ────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>About Cardom</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.1]">
                Everything Automotive. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
                  Connected.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                Cardom brings buying, selling, financing, insurance, servicing, roadside assistance, subscriptions, and automotive parts together in one connected experience.
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
                  onClick={scrollToEcosystem}
                  className="px-8 py-4 rounded-xl text-sm font-semibold border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Services</span>
                  <ChevronDown className="w-4 h-4 text-orange-400" />
                </button>
              </div>

              <div className="pt-3 flex items-center gap-6 text-xs font-mono text-zinc-500 border-t border-white/10">
                <div>ONE PLATFORM</div>
                <div>•</div>
                <div className="text-orange-400">EVERY AUTOMOTIVE NEED</div>
              </div>
            </div>

            {/* Right: Custom Futuristic Automotive Core Visual */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col justify-between">
                <BorderBeam size={220} duration={10} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

                {/* Top Telemetry Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-orange-400" />
                    <span>CARDOM ARCHITECTURE V2</span>
                  </div>
                  <span className="text-orange-400 font-bold">SYSTEM: ONLINE</span>
                </div>

                {/* SVG Orbital Core Canvas */}
                <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
                  <svg className="absolute inset-0 w-full h-full stroke-orange-500/25" viewBox="0 0 400 300" fill="none">
                    {/* Concentric Orbital Rings */}
                    <circle cx="200" cy="150" r="110" strokeDasharray="4 6" strokeWidth="0.8" />
                    <circle cx="200" cy="150" r="80" strokeWidth="1" stroke="rgba(249,115,22,0.4)" />
                    <circle cx="200" cy="150" r="45" stroke="#f97316" strokeWidth="1.2" />

                    {/* Radial Node Vectors */}
                    <line x1="200" y1="150" x2="100" y2="70" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="300" y2="70" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="80" y2="150" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="320" y2="150" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="110" y2="230" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />
                    <line x1="200" y1="150" x2="290" y2="230" strokeWidth="0.8" stroke="rgba(249,115,22,0.5)" />

                    {/* Outer Nodes */}
                    <circle cx="100" cy="70" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="300" cy="70" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="80" cy="150" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="320" cy="150" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="110" cy="230" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                    <circle cx="290" cy="230" r="12" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  </svg>

                  {/* Center Glowing Cardom Core */}
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-black border-2 border-orange-500 flex flex-col items-center justify-center shadow-[0_0_30px_#f97316]"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 mb-1 animate-ping" />
                    <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
                      CARDOM
                    </span>
                    <span className="text-[8px] font-mono text-orange-400">CORE</span>
                  </motion.div>

                  {/* Peripheral node labels */}
                  <div className="absolute top-12 left-16 text-[9px] font-mono text-zinc-400">BUY & SELL</div>
                  <div className="absolute top-12 right-16 text-[9px] font-mono text-zinc-400">FINANCE</div>
                  <div className="absolute top-[144px] left-6 text-[9px] font-mono text-zinc-400">INSURANCE</div>
                  <div className="absolute top-[144px] right-6 text-[9px] font-mono text-zinc-400">SERVICE</div>
                  <div className="absolute bottom-10 left-16 text-[9px] font-mono text-zinc-400">ROADSIDE</div>
                  <div className="absolute bottom-10 right-16 text-[9px] font-mono text-zinc-400">PARTS</div>
                </div>

                {/* Floating Status Box */}
                <div className="rounded-xl border border-orange-500/40 bg-orange-500/[0.06] p-3 text-center">
                  <span className="text-xs font-mono font-semibold text-orange-400 uppercase tracking-wider">
                    One Platform • Every Automotive Need
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. OUR MISSION ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#121212] to-[#080808] p-8 sm:p-14 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Editorial */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                  OUR MISSION
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight">
                  Make Car Ownership Feel Simple.
                </h2>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  The automotive journey is often fragmented across dealerships, insurers, lenders, workshops, roadside providers, subscription platforms, and parts suppliers.
                </p>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Cardom is designed around a simpler idea: bring these experiences together so drivers can discover, compare, manage, and take care of their vehicles from one connected platform.
                </p>

                <div className="pt-2 flex items-center gap-6 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                    <span>Zero Fragmented Friction</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                    <span>Transparent Discovery</span>
                  </div>
                </div>
              </div>

              {/* Right: Convergence Visual */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="w-full rounded-2xl border border-orange-500/30 bg-black/60 p-6 relative">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 text-center">
                    FRAGMENTED SILOS CONVERGE INTO CARDOM
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                    {['BUY', 'SELL', 'FINANCE', 'INSURE', 'SERVICE', 'REPAIR', 'PARTS'].map((service, idx) => (
                      <div
                        key={service}
                        className={cn(
                          'p-2.5 rounded-lg border border-white/10 bg-white/[0.02] text-center transition-colors',
                          idx === 0 && 'border-orange-500/40 text-orange-400 bg-orange-500/5'
                        )}
                      >
                        {service}
                      </div>
                    ))}
                    <div className="p-2.5 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-400 text-center font-bold">
                      SUBSCRIPTIONS
                    </div>
                  </div>

                  {/* Animated Arrow into Core */}
                  <div className="flex flex-col items-center justify-center my-3">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-transparent to-orange-500" />
                    <div className="px-6 py-2 rounded-full border border-orange-500 bg-orange-500/20 text-orange-300 font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      CARDOM CORE
                    </div>
                    <div className="w-0.5 h-6 bg-gradient-to-b from-orange-500 to-transparent" />
                  </div>

                  <p className="text-[11px] text-zinc-500 text-center italic">
                    Unified experience expanding outward to power every phase of driver mobility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. THE CARDOM ECOSYSTEM ─────────────────────────────────────── */}
        <section id="ecosystem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              INTEGRATED ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              One Platform. Many Journeys.
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Each dedicated vertical connects with your broader vehicle records, creating a continuous automotive ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ECOSYSTEM_NODES.map((node) => {
              const Icon = node.Icon
              return (
                <Link
                  key={node.id}
                  to={node.href}
                  className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 hover:border-orange-500/50 hover:bg-[#121212] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      {node.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-500 group-hover:text-orange-400 transition-colors">
                    <span className="font-mono text-[11px]">Explore Vertical</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ─── 4. WHAT CARDOM CONNECTS (3-Column Section) ──────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors group relative">
              <div className="text-5xl font-mono font-bold text-orange-500/30 group-hover:text-orange-500 transition-colors mb-4">
                01
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">DISCOVER</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Find cars, parts, services, insurance, financing, and automotive solutions based on your specific lifestyle needs.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors group relative">
              <div className="text-5xl font-mono font-bold text-orange-500/30 group-hover:text-orange-500 transition-colors mb-4">
                02
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">DECIDE</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Compare options, understand real total costs of ownership, and move forward with clarity and confidence.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors group relative">
              <div className="text-5xl font-mono font-bold text-orange-500/30 group-hover:text-orange-500 transition-colors mb-4">
                03
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">MANAGE</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Keep your automotive journey connected across ownership, maintenance, services, warranties, and roadside support.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 5. THE CARDOM EXPERIENCE TIMELINE ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              END-TO-END LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mt-2">
              From Your First Search to Every Mile After.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Discover', desc: 'Start by finding the car, service, or automotive solution you need.' },
              { step: '02', title: 'Choose', desc: 'Compare options and select what fits your budget and journey.' },
              { step: '03', title: 'Connect', desc: 'Access the relevant automotive service through one platform.' },
              { step: '04', title: 'Drive', desc: 'Keep moving with connected ownership, maintenance, and support.' },
              { step: '05', title: 'Return', desc: 'Come back to Cardom whenever your vehicle needs attention.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/40 transition-colors group relative"
              >
                <div className="text-3xl font-bold font-mono text-orange-500/40 group-hover:text-orange-500 transition-colors mb-3">
                  {item.step}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 6. WHY CARDOM EXISTS ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111] to-[#080808] p-8 sm:p-14 relative overflow-hidden">
            <div className="max-w-xl mb-12">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                CORE PHILOSOPHY
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
                Built Around the Driver.
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Every tool, workflow, and interface is engineered to eliminate friction from automotive decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_CARDOM_PILLARS.map((pillar, idx) => {
                const Icon = pillar.Icon
                return (
                  <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-orange-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base text-white mb-2">{pillar.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── 7. CARDOM BY THE NUMBERS (Platform Vision) ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-orange-500/30 bg-black/60 p-8 sm:p-12">
            <div className="text-center mb-10">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                PLATFORM VISION
              </span>
              <p className="text-xs text-zinc-500 mt-1">
                Conceptual platform scope shown for the Cardom prototype.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-6xl font-mono font-bold text-orange-400">01</div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 mt-2">
                  Connected Platform
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-6xl font-mono font-bold text-white">09</div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 mt-2">
                  Service Categories
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-6xl font-mono font-bold text-orange-400">01</div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 mt-2">
                  Unified Experience
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-6xl font-mono font-bold text-white">∞</div >
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 mt-2">
                  Possibilities
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. TECHNOLOGY & EXPERIENCE ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              PRODUCT ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
              Technology Behind the Experience
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Designed from the foundation up for modern mobility, transparent data models, and fluid interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH_CARDS.map((card, idx) => {
              const Icon = card.Icon
              return (
                <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-[#0d0d0d] hover:border-orange-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white mb-2">{card.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── 9. FUTURE VISION (The Road Ahead) ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#121212] to-[#080808] p-8 sm:p-14 relative overflow-hidden">
            <div className="max-w-xl mb-12">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                THE ROAD AHEAD
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-2">
                We’re Building Beyond the Car.
              </h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Cardom’s long-term vision is to create a connected automotive ecosystem where vehicles, services, mobility, maintenance, and ownership experiences work together.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FUTURE_CAPABILITIES.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <span className="inline-block text-[9px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded mb-3">
                    {item.tag}
                  </span>
                  <h4 className="font-bold text-base text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 10. BRAND STATEMENT ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28 text-center py-12">
          <div className="space-y-2">
            <div className="text-3xl sm:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight text-white flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2">
              <span className="hover:text-orange-400 transition-colors">BUY.</span>
              <span className="hover:text-orange-400 transition-colors">SELL.</span>
              <span className="hover:text-orange-400 transition-colors">FINANCE.</span>
              <span className="hover:text-orange-400 transition-colors">PROTECT.</span>
              <span className="hover:text-orange-400 transition-colors">MAINTAIN.</span>
              <span className="text-orange-500">MOVE.</span>
            </div>
            <p className="text-base sm:text-xl font-heading font-medium text-zinc-400 mt-6 tracking-wide">
              One connected automotive experience.
            </p>
          </div>
        </section>

        {/* ─── 11. FAQ ACCORDION ──────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
              FREQUENTLY ASKED
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-2">
              Everything You Need to Know
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

        {/* ─── 12. FINAL CTA ──────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 p-8 sm:p-14 text-center relative overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

            <div className="max-w-xl mx-auto">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                THE JOURNEY STARTS HERE
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
                Your Car. Your Journey. One Platform.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
                Explore the Cardom experience and discover a simpler way to move through the automotive world.
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
                  onClick={scrollToEcosystem}
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

