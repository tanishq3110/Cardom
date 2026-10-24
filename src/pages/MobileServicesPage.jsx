import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Navigation,
  Shield,
  CreditCard,
  Wrench,
  Sparkles,
  AlertTriangle,
  Package,
  Search,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

// ─── All service cards matching reference image ───────────────────────────────
const SERVICES = [
  {
    id: 'ride',
    label: 'Ride Booking',
    desc: 'Doorstep pickup, City & Airport cabs 24/7',
    to: '/ride',
    icon: Navigation,
    color: '#ff6a00',
    bg: 'rgba(255,106,0,0.15)',
    border: 'rgba(255,106,0,0.3)',
    popular: true,
  },
  {
    id: 'insurance',
    label: 'Insurance',
    desc: 'Get the best insurance plans',
    to: '/insurance',
    icon: Shield,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.22)',
  },
  {
    id: 'finance',
    label: 'Finance',
    desc: 'Flexible loan options for your dream car',
    to: '/finance',
    icon: CreditCard,
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.22)',
  },
  {
    id: 'service',
    label: 'Service & Repair',
    desc: 'Expert care for your vehicle',
    to: '/service',
    icon: Wrench,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.22)',
  },
  {
    id: 'detailing',
    label: 'Detailing',
    desc: 'Keep your car looking new',
    to: '/service',
    icon: Sparkles,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.22)',
  },
  {
    id: 'roadside',
    label: 'Roadside Assistance',
    desc: '24/7 support on the road',
    to: '/roadside',
    icon: AlertTriangle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.22)',
  },
  {
    id: 'parts',
    label: 'Spare Parts',
    desc: 'Genuine parts & accessories',
    to: '/parts',
    icon: Package,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.22)',
  },
]

export function MobileServicesPage() {
  const [query, setQuery] = useState('')

  const filtered = SERVICES.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-dvh bg-[#131313] text-[#e5e2e1] flex flex-col pb-28">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#131313]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-4">
        <h1 className="font-display text-2xl font-black text-white mb-4">Services</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search automotive & mobility services..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#201f1f] border border-white/10 rounded-xl text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#ff6a00] transition-colors"
          />
        </div>
      </div>

      {/* ── Services list ── */}
      <div className="flex-1 px-4 pt-4 space-y-3">
        {filtered.map((service) => {
          const Icon = service.icon
          return (
            <Link
              key={service.id}
              to={service.to}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#1c1b1b] border border-white/5 hover:border-[#ff6a00]/30 transition-all active:scale-[0.98] group"
            >
              {/* Icon box */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{
                  background: service.bg,
                  border: `1px solid ${service.border}`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: service.color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-white group-hover:text-[#ff6a00] transition-colors">
                    {service.label}
                  </h3>
                  {service.popular && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#ff6a00] text-black text-[9px] font-black">
                      POPULAR
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#c6c6c7] mt-0.5 truncate">{service.desc}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          )
        })}

        {/* ── Need Help Banner ── */}
        <div className="rounded-2xl bg-[#201f1f] border border-white/10 p-4 mt-6 text-center space-y-1">
          <p className="text-xs font-bold text-white">Need a custom service?</p>
          <p className="text-[11px] text-[#c6c6c7]">
            Our 24x7 automotive concierge is available to assist you.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs text-[#ff6a00] font-bold hover:underline"
            >
              <span>Contact Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
